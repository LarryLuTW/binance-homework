# Binance liquidity trader

This trader will provide liquidity to [Binance](https://www.binance.com) Exchange, placing open orders and adjusting the price when the market is moving. It also supports **gracefully shutdown** and **auto-reconnect**, therefore you don't have to worry about the correctness and stability.

## Setup Guide

### Requirement

- Docker: `19.03.0+`
- [Docker Compose](https://docs.docker.com/compose/install/)
- A [Binance](https://www.binance.com) Account
- A [Github](https://github.com) Account

### Generate `API_KEY` and `SECRET_KEY` on Binance Testnet

The trader needs `API_KEY` and `SECRET_KEY` to do trading on Binance Testnet. Please follow the steps in **[How to test my functions on the Spot Testnet?](https://www.binance.com/en/support/faq/ab78f9a1b8824cf0a106b4229c76496d)** to get them.

### Setup environment variables in `.env`

To make the trade work properly. Please specify these four variables in `.env`.

```sh
BINANCE_PROD_WS_BASE="wss://stream.binance.com:9443"
BINANCE_TEST_API_BASE="https://testnet.binance.vision"

API_KEY="THE API_KEY GOT FROM PREVIOUS STEP"
SECRET_KEY="THE SECRET_KEY GOT FROM PREVIOUS STEP"
```

### Configure the strategy parameter

There's a `config/strategy.config.ts` that allows users to customize the `symbol`, `profitSpread`, and `orderQuantity`. You can just use the default config to meet the requirement.

```ts
export default {
  // the symbol you want to trade
  symbol: "BTCUSDT",
  
  // the strategy will place a buy order and a sell order
  // price of the buy order = (currentPrice - profitSpread)
  // price of the sell order = (currentPrice + profitSpread)
  profitSpread: 100,
  
  // quantity of the submitted order
  orderQuantity: 0.001,
};
```

### Start the trader

This command will start the **trader** in container with the given `.env`. It might take some time since it needs to grab base images from DockerHub and then build the trader image.

```sh
docker-compose --env-file .env up --build
```

### Stop the trader

You can just press `Ctrl-C` or run the following command to shutdown the trader gracefully. The trader will automatically cancel the existing orders before exiting.

```sh
docker-compose down
```
---

# Demo

Start the trader then it will subscribe to the price of **BTCUSDT**. Since the latest price is `23705.15` and the `profitSpread` is set to `10`. The trader will place a buy order at `23695.15` and a sell order at `23715.15`.

<img width="1200" src="https://user-images.githubusercontent.com/10403741/182030271-d745bca2-4e1d-4b59-8cc1-531d99181bf4.png">

After two minutes, the latest price of **BTCUSDT** `23694.62` is outside the range of `23695.15` to `23715.15`. Therefore, the trader will cancel the orders and then resubmit orders with the new prices.

<img width="1200" src="https://user-images.githubusercontent.com/10403741/182030556-6f2092a3-2bdb-4684-a90f-fd7e51cd7a11.png">
