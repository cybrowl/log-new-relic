import { config } from "dotenv";
import fetch from "node-fetch";

import { getActor } from "./utils/actor.js";
import { idlFactory } from "./logger/logger.did.js";
import { default_identity } from "./utils/identity.js";

config();

// change me for dev
const isProd = true;

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;
const LOGGER_CANISTER_ID = isProd
  ? process.env.LOGGER_CANISTER_ID_PROD
  : process.env.LOGGER_CANISTER_ID_DEV;

const NEW_RELIC_LOG_API_URL = "https://log-api.newrelic.com/log/v1";

const headers = {
  "Content-Type": "application/json",
  "X-Insert-Key": NEW_RELIC_API_KEY,
};

async function fetchData() {
  try {
    let actor = await getActor(
      LOGGER_CANISTER_ID,
      idlFactory,
      default_identity,
      isProd
    );

    const version = await actor.version();
    const authorized = await actor.authorize();

    const logs = await actor.get_logs();

    console.log("version: ", version);
    console.log("authorized: ", authorized);

    return logs;
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    return null;
  }
}

function convertTimeToNumber(data) {
  return data.map((item) => {
    return {
      ...item,
      time: Number(item.time),
    };
  });
}

async function forwardToNewRelic(data) {
  if (data) {
    console.log("data length: ", data.length);

    try {
      const response = await fetch(NEW_RELIC_LOG_API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(convertTimeToNumber(data)),
      });

      if (response.status === 202) {
        console.log("Data sent to New Relic successfully");
        const logs_cleared = await actor.clear_logs();
        console.log(logs_cleared);
      } else {
        console.error(`Error sending data to New Relic: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error sending data to New Relic: ${error.message}`);
    }
  }
}

(async function main() {
  while (true) {
    const logs = await fetchData();

    await forwardToNewRelic(logs);
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // Adjust the sleep interval as needed
  }
})();
