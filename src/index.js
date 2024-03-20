import { config } from "dotenv";
import fetch from "node-fetch";

import { getActor } from "./utils/actor.js";
import { idlFactory } from "./logger/service.did.js";

import { Ed25519KeyIdentity } from "@dfinity/identity";

config();

const parse_identity = (private_key_hex) =>
  Ed25519KeyIdentity.fromSecretKey(
    Uint8Array.from(Buffer.from(private_key_hex, "hex"))
  );

// New Relic configurations
const new_relic_api_key = process.env.NEW_RELIC_API_KEY;
const new_relic_log_api_url = "https://log-api.newrelic.com/log/v1";
const headers = {
  "Content-Type": "application/json",
  "X-Insert-Key": new_relic_api_key,
};

// Canister configurations for different environments
const logger_canister_id_prod = process.env.LOGGER_CANISTER_ID_PROD;
const logger_canister_id_staging = process.env.LOGGER_CANISTER_ID_STAGING;

// Parse identity for admin authentication
const admin_identity = parse_identity(process.env.PRIVATE_KEY);

// Initialize actor instances for both prod and staging environments
const is_prod = true;
const actor_logger_prod = await getActor(
  logger_canister_id_prod,
  idlFactory,
  admin_identity,
  is_prod
);

const actor_logger_staging = await getActor(
  logger_canister_id_staging,
  idlFactory,
  admin_identity,
  is_prod
);

function convert_time_to_number(data) {
  return data.map((item) => {
    return {
      ...item,
      time: Number(item.time),
    };
  });
}

function convert_tags_to_object(data) {
  return data.map((item) => {
    const new_obj = { ...item };

    const attributes_object = {
      logtype: item.logtype,
      hostname: item.hostname,
    };

    item.tags.forEach((tag) => {
      attributes_object[tag[0]] = tag[1];
    });

    new_obj.attributes = attributes_object;
    delete new_obj.tags;
    return new_obj;
  });
}

async function process_logs(actor, res) {
  try {
    const authorized = await actor.authorize();

    if (authorized === false) {
      res.status(500).json({
        message: "Not_Authorized",
      });
      return;
    }

    const { ok: logs, err: error } = await actor.get_logs();

    const data_with_attributes = convert_tags_to_object(logs);
    const response = await fetch(new_relic_log_api_url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(convert_time_to_number(data_with_attributes)),
    });

    if (response.status === 202) {
      const logs_cleared = await actor.clear_logs();
      console.log(logs_cleared);

      res.status(200).json({
        message: "Data sent to New Relic successfully",
        response: response,
        logs_length: logs.length,
        authorized: authorized,
      });
    } else {
      res.status(500).json({
        message: `Error sending data to New Relic: ${response.status}`,
        logs_length: logs.length,
        authorized: authorized,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "forwardToNewRelic failed",
      logs_length: logs.length,
      authorized: authorized,
    });
  }
}

/**
 * Main handler to route API requests.
 */
export default async function handler(req, res) {
  if (req.url === "/api/prod") {
    await process_logs(actor_logger_prod, res);
  } else if (req.url === "/api/staging") {
    await process_logs(actor_logger_staging, res);
  } else {
    res.status(404).json({
      message: "Invalid endpoint",
    });
  }
}
