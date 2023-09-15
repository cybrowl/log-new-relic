import { config } from "dotenv";
import fetch from "node-fetch";

import { getActor } from "./utils/actor.js";
import { idlFactory } from "./logger/logger.did.js";
import { parseIdentity } from "./utils/identity.js";

config();

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;
const LOGGER_CANISTER_ID_PROD = process.env.LOGGER_CANISTER_ID_PROD;
const LOGGER_CANISTER_ID_STAGING = process.env.LOGGER_CANISTER_ID_STAGING;

const NEW_RELIC_LOG_API_URL = "https://log-api.newrelic.com/log/v1";

const headers = {
  "Content-Type": "application/json",
  "X-Insert-Key": NEW_RELIC_API_KEY,
};

// Initialize the actors
const admin_identity = parseIdentity(process.env.PRIVATE_KEY);
const isProd = true;

const actor_prod = await getActor(
  LOGGER_CANISTER_ID_PROD,
  idlFactory,
  admin_identity,
  isProd
);

const actor_staging = await getActor(
  LOGGER_CANISTER_ID_STAGING,
  idlFactory,
  admin_identity,
  isProd
);

// Convert BigInt time values to numbers
function convertTimeToNumber(data) {
  return data.map((item) => {
    return {
      ...item,
      time: Number(item.time),
    };
  });
}

// Convert [[Text]] to object
function convertTagsToObject(data) {
  return data.map((item) => {
    const newObj = { ...item };

    const attributesObject = {
      logtype: item.logtype,
      hostname: item.hostname,
    };

    item.tags.forEach((tag) => {
      attributesObject[tag[0]] = tag[1];
    });

    newObj.attributes = attributesObject;
    delete newObj.tags;
    return newObj;
  });
}

async function processLogs(actor, res) {
  try {
    const authorized = await actor.authorize();

    if (authorized === false) {
      res.status(500).json({
        message: "Not_Authorized",
      });
      return;
    }

    const { ok: logs, err: error } = await actor.get_logs();

    const data_with_attributes = convertTagsToObject(logs);
    const response = await fetch(NEW_RELIC_LOG_API_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(convertTimeToNumber(data_with_attributes)),
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

export default async function handler(req, res) {
  if (req.url === "/api/prod") {
    await processLogs(actor_prod, res);
  } else if (req.url === "/api/staging") {
    await processLogs(actor_staging, res);
  } else {
    res.status(404).json({
      message: "Invalid endpoint",
    });
  }
}
