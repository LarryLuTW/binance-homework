import day from "dayjs";
import { BinanceHTTPClient, BinanceWebSocketClient } from "../client";
import {
  Side,
  OrderType,
  Order,
  TimeInForce,
  SubmittedOrder,
  stringifyOrder,
} from "../type";
import { inRange } from "../lib";

export const provideLiquidity = (
  wsClient: BinanceWebSocketClient,
  httpClient: BinanceHTTPClient,
  config: { symbol: string; profitSpread: number; orderQuantity: number }
) => {
  let submittedBuyOrder: SubmittedOrder | null = null;
  let submittedSellOrder: SubmittedOrder | null = null;

  console.log("config: ", config);
  const { symbol, profitSpread, orderQuantity } = config;

  wsClient.subscribeToPrice(symbol, async (price) => {
    console.log();
    console.log(day().toString());
    console.log(`The latest price of ${symbol} is ${price}`);

    // submit orders if there is no existing orders
    if (submittedBuyOrder === null || submittedSellOrder === null) {
      console.log(
        `There's no existing orders, submitting new orders with profitSpread = ${profitSpread}, quantity = ${orderQuantity}`
      );

      const buyOrder: Order = {
        symbol,
        price: price - profitSpread,
        quantity: orderQuantity,
        type: OrderType.LIMIT,
        side: Side.BUY,
        timeInForce: TimeInForce.GTC,
      };
      const sellOrder: Order = {
        symbol,
        price: price + profitSpread,
        quantity: orderQuantity,
        type: OrderType.LIMIT,
        side: Side.SELL,
        timeInForce: TimeInForce.GTC,
      };
      console.log(`submitting buy  order: ${stringifyOrder(buyOrder)}`);
      console.log(`submitting sell order: ${stringifyOrder(sellOrder)}`);
      [submittedBuyOrder, submittedSellOrder] = await Promise.all([
        httpClient.submitOrder(buyOrder),
        httpClient.submitOrder(sellOrder),
      ]);
      return;
    }

    // log current orders price range
    console.log(
      `range: ${submittedBuyOrder.price} - ${submittedSellOrder.price}`
    );

    // cancel orders if they will be filled
    if (!inRange(price, submittedBuyOrder.price, submittedSellOrder.price)) {
      console.log(
        `The price of ${symbol} ${price} is out of range, canceling orders`
      );
      console.log(
        `cancelling buy  order: ${stringifyOrder(submittedBuyOrder)}`
      );
      console.log(
        `cancelling sell order: ${stringifyOrder(submittedSellOrder)}`
      );
      await Promise.all([
        httpClient.cancelOrder(submittedBuyOrder),
        httpClient.cancelOrder(submittedSellOrder),
      ]);
      submittedBuyOrder = null;
      submittedSellOrder = null;
      return;
    }
  });

  // This cleanup function will be called before the process shutdown
  return async function cleanup() {
    console.log("Receive shutdown signal, start cleaning up...");
    if (submittedBuyOrder !== null) {
      await httpClient.cancelOrder(submittedBuyOrder);
    }
    if (submittedSellOrder !== null) {
      await httpClient.cancelOrder(submittedSellOrder);
    }
  };
};
