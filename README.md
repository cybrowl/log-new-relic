# New Relic Data Forwarder

This script fetches data from an external HTTP endpoint and forwards it to the New Relic Log API. It runs in a continuous loop, fetching data and forwarding it at regular intervals.

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
```

Replace your-api-key-here with your actual New Relic API key.

## Usage

To start the script, run:

```
npm run start
```

The script will start fetching data from the specified `HTTP_ENDPOINT_UR`L and forwarding it to New Relic. The script runs in a continuous loop with a sleep interval between iterations. You can adjust the sleep interval by modifying the `setTimeout` value in the main function.

## How it works

1. The script imports the required libraries and loads the New Relic API key from the .env file.

2. It defines two main functions:
   `fetchData()`: Fetches data from the external HTTP endpoint specified in `HTTP_ENDPOINT_URL`.
   `forwardToNewRelic(data)`: Sends the fetched data to the New Relic Log API using the `NEW_RELIC_LOG_API_URL` and API key provided in the `.env` file.

3. The main function is an async function that runs in a continuous loop. It fetches data, forwards it to New Relic, and then sleeps for a specified interval before repeating the process.

## Customization

- To change the HTTP endpoint URL, update the `HTTP_ENDPOINT_URL` variable with the new URL.
- To adjust the sleep interval between fetches, change the value passed to setTimeout in the main function.
