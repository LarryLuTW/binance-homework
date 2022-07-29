export enum Side {
  BUY = "BUY",
  SELL = "SELL",
}

export enum OrderType {
  LIMIT = "LIMIT",
  MARKET = "MARKET",
}

export enum TimeInForce {
  GTC = "GTC",
}

export type Order = {
  symbol: string;
  price: number;
  quantity: number;
  type: OrderType;
  side: Side;
  timeInForce: string;
};

export function stringifyOrder(order: Order): string {
  return `${order.symbol} ${order.side} ${order.quantity}@${order.price}`;
}

export type SubmittedOrder = Order & { orderId: number };
