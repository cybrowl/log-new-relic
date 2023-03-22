import fetch from "node-fetch";
import { config } from "dotenv";

config();

const newRelicApiKey = process.env.NEW_RELIC_API_KEY;

const NEW_RELIC_LOG_API_URL = "https://log-api.newrelic.com/log/v1";
const HTTP_ENDPOINT_URL =
  "https://jaypp-oiaaa-aaaag-aaa6q-cai.raw.ic0.app/logs";

const headers = {
  "Content-Type": "application/json",
  "X-Insert-Key": newRelicApiKey,
};

async function fetchData() {
  try {
    const response = await fetch(HTTP_ENDPOINT_URL);

    if (response.ok) {
      return await response.json();
    } else {
      console.error(`Error fetching data: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    return null;
  }
}

async function forwardToNewRelic(data) {
  if (data) {
    console.log("data: ", data);

    try {
      const response = await fetch(NEW_RELIC_LOG_API_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
      });

      if (response.status === 202) {
        console.log("Data sent to New Relic successfully");
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
    const data = await fetchData();

    await forwardToNewRelic(data);
    await new Promise((resolve) => setTimeout(resolve, 60 * 1000)); // Adjust the sleep interval as needed
  }
})();
