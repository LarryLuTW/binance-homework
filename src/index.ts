import { strict as assert } from "assert";
import { BinanceWebSocketClient, BinanceHTTPClient } from "./client";
import { provideLiquidity } from "./strategy";
import strategyConfig from "../config/strategy.config";

// Step 1 - Assert all the required environment variables are set
const { BINANCE_PROD_WS_BASE, BINANCE_TEST_API_BASE, API_KEY, SECRET_KEY } =
  process.env;
assert(BINANCE_PROD_WS_BASE, "BINANCE_PROD_WS_BASE is not set");
assert(BINANCE_TEST_API_BASE, "BINANCE_TEST_API_BASE is not set");
assert(API_KEY, "API_KEY is not set");
assert(SECRET_KEY, "SECRET_KEY is not set");

// Step 2 - Start the strategy
const prodWSClient = new BinanceWebSocketClient(BINANCE_PROD_WS_BASE);
const testHttpClient = new BinanceHTTPClient(
  BINANCE_TEST_API_BASE,
  API_KEY,
  SECRET_KEY
);

const cleanupProvideLiquidity = provideLiquidity(
  prodWSClient,
  testHttpClient,
  strategyConfig
);

// Step 3 - Ensure all the resources will be cleaned up before the process exits
async function shutdown({ code }: { code: number }) {
  prodWSClient.unsubscribe();
  await cleanupProvideLiquidity();
  process.exit(code);
}

process.on("unhandledRejection", async (err) => {
  console.log("Uncaught Exception happens!");
  console.log(err);
  await shutdown({ code: 1 });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Exiting...");
  await shutdown({ code: 0 });
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Exiting...");
  await shutdown({ code: 0 });
});
