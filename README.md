# New Relic Data Forwarder

This script fetches data from an external HTTP endpoint and forwards it to the New Relic Log API. It runs in a continuous loop, fetching data and forwarding it at regular intervals.

## Features

- Fetch logs from a logger canister
- Convert logs to the desired format
- Only Authorized caller can get logs and clear
- Forward logs to New Relic Logs API
- Clear logs in the logger canister after forwarding

## Prerequisites

- Node.js installed on your system.
- A New Relic account and an API key.

## Setup

- Clone or download this repository to your local machine.
- Run npm install to install the required dependencies.

## Configuration

- Create a .env file in the project's root directory.
- Add your New Relic API key to the .env file in the following format:

.env

```
NEW_RELIC_API_KEY=your-api-key-here
LOGGER_CANISTER_ID_DEV=your-canister-id-here
LOGGER_CANISTER_ID_PROD=your-canister-id-here
PRIVATE_KEY=your-Ed25519KeyIdentity
```

Note: you can generate Ed25519KeyIdentity with `generate_key.cjs`

Replace your-api-key-here with your actual New Relic API key.

## Usage

To start the script, run:

```
npm run start
```

The script will start fetching data from actor and forwarding it to New Relic. The script runs in a continuous loop with a sleep interval between iterations. You can adjust the sleep interval by modifying the `setTimeout` value in the main function.

# Identity

You must create an environment variable named PRIVATE_KEY to serve as your private key identity. You can generate the private key using the script located at `utils/generate_key.cjs`. Store the generated private key as the value of the PRIVATE_KEY variable in the .env file.

## Functions

fetchData
Fetches data (version, authorized status, and logs) from the logger canister.

convertTimeToNumber
Converts BigInt time values in the logs to numbers.

convertTagsToObject
Converts the tags field of each log item to an object with keys and values based on the tags content. The tags field is then replaced with an attributes field.

forwardToNewRelic
Sends processed logs to the New Relic Logs API. If the data is sent successfully, it clears logs in the logger canister.

main
The main loop that runs indefinitely, calling the fetchData and forwardToNewRelic functions at regular intervals.

## Ping

Moved to https://uptimerobot.com/ and https://betterstack.com/
