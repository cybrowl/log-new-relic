import { config } from "dotenv";
import fetch from "node-fetch";

import { getActor } from "./utils/actor.js";
import { idlFactory } from "./logger/logger.did.js";
import { parseIdentity } from "./utils/identity.js";

config();

// Set to true for production, false for development
const isProd = true;

const NEW_RELIC_API_KEY = process.env.NEW_RELIC_API_KEY;
const LOGGER_CANISTER_IDS = isProd
  ? process.env.LOGGER_CANISTER_IDS_PROD.split(",")
  : process.env.LOGGER_CANISTER_IDS_DEV.split(",");

const NEW_RELIC_LOG_API_URL = "https://log-api.newrelic.com/log/v1";

const headers = {
  "Content-Type": "application/json",
  "X-Insert-Key": NEW_RELIC_API_KEY,
};

// Initialize the actors
const admin_identity = parseIdentity(process.env.PRIVATE_KEY);

const actors = LOGGER_CANISTER_IDS.map((id) =>
  getActor(id, idlFactory, admin_identity, isProd)
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
//   const resolvedActors = await Promise.all(actors);

//   for (const actor of resolvedActors) {
//     while (true) {
//       try {
//         const authorized = await actor.authorize();

//         if (authorized) {
//           const { ok: logs, err: error } = await actor.get_logs();
//           console.log("logs_size: ", logs.length);

//           const data_with_attributes = convertTagsToObject(logs);
//           const response = await fetch(NEW_RELIC_LOG_API_URL, {
//             method: "POST",
//             headers: headers,
//             body: JSON.stringify(convertTimeToNumber(data_with_attributes)),
//           });

//           if (response.status === 202) {
//             const logs_cleared = await actor.clear_logs();
//             console.log(logs_cleared);
//           } else {
//             console.log("Error sending logs:", response.statusText);
//           }
//         } else {
//           console.log("Not authorized to fetch logs.");
//         }
//       } catch (error) {
//         console.log("Error occurred:", error.message);
//       }
//       await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // Adjust the sleep interval as needed
//     }
//   }
// })();

export default async function handler(req, res) {
  if (req.url === "/api/cron") {
    const resolvedActors = await Promise.all(actors);

    for (const actor of resolvedActors) {
      try {
        const authorized = await actor.authorize();

        if (authorized === false) {
          res.status(500).json({
            message: "Not_Authorized",
          });
          return; // return to stop processing if not authorized
        }

        const { ok: logs, err: error } = await actor.get_logs();

        if (error || logs === undefined) {
          res.status(500).json({
            message: "Issue with get_logs",
            error: error,
            authorized: authorized,
          });
        }

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
            logs_length: logs.length,
            authorized: authorized,
          });

          const logs_cleared = await actor.clear_logs();
          console.log(logs_cleared);
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
          logs_length: logs?.length, // ensure logs is defined
          authorized: authorized,
        });
      }
    }
  } else {
    // handle other URLs
  }
}
