import { config } from "dotenv";
import fetch from "node-fetch";

import { getActor } from "./utils/actor.js";
import { idlFactory } from "./logger/logger.did.js";
import { parseIdentity } from "./utils/identity.js";

config();

// Set to true for production, false for development
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

// Initialize the actor
const admin_identity = parseIdentity(process.env.PRIVATE_KEY);

const actor = await getActor(
  LOGGER_CANISTER_ID,
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

// NOTE: Only Dev
// (async function main() {
//   while (true && isProd === true) {
//     try {
//       const authorized = await actor.authorize();
//       const { ok: logs, err: error } = await actor.get_logs();
//       const data_with_attributes = convertTagsToObject(logs);
//       const response = await fetch(NEW_RELIC_LOG_API_URL, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(convertTimeToNumber(data_with_attributes)),
//       });

//       if (response.status === 202) {
//         console.log("response.status: ", response.status);

//         const logs_cleared = await actor.clear_logs();
//         console.log(logs_cleared);
//       } else {
//         console.log("err:");
//       }
//     } catch (error) {
//       console.log("err:");
//     }
//     await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // Adjust the sleep interval as needed
//   }
// })();

export default async function handler(req, res) {
  if (req.url === "/api/cron") {
    try {
      const authorized = await actor.authorize();

      if (authorized === false) {
        res.status(500).json({
          message: "Not_Authorized",
        });
      }

      const { ok: logs, err: error } = await actor.get_logs();
      const data_with_attributes = convertTagsToObject(logs);
      const response = await fetch(NEW_RELIC_LOG_API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(convertTimeToNumber(data_with_attributes)),
      });

      if (response.status === 202) {
        res.status(200).json({
          message: "Data sent to New Relic successfully",
          response: response,
        });

        const logs_cleared = await actor.clear_logs();
        console.log(logs_cleared);
      } else {
        res.status(500).json({
          message: `Error sending data to New Relic: ${response.status}`,
        });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "forwardToNewRelic failed", err: error.message });
    }
  } else {
  }
}
