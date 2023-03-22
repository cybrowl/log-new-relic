import { config } from "dotenv";
import fetch from "node-fetch";

import { getActor } from "./utils/actor.js";
import { idlFactory } from "./logger/logger.did.js";
import { default_identity } from "./utils/identity.js";

config();

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;
const LOGGER_CANISTER_ID = process.env.LOGGER_CANISTER_ID;

const NEW_RELIC_LOG_API_URL = "https://log-api.newrelic.com/log/v1";

const headers = {
  "Content-Type": "application/json",
  "X-Insert-Key": NEW_RELIC_API_KEY,
};

let actor = await getActor(LOGGER_CANISTER_ID, idlFactory, default_identity);

async function fetchData() {
  try {
    const version = await actor.version();
    const authorized = await actor.authorize();

    await actor.log_event([["hello", "world"]], "works");

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
