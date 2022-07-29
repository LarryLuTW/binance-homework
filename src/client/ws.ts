import { WebSocket, RawData } from "ws";

// RFC: https://datatracker.ietf.org/doc/html/rfc6455#section-7.4.1
enum WebSocketErrorCode {
  NormalClosure = 1000,
  GoingAway = 1001,
  ProtocolError = 1002,
  UnsupportedData = 1003,
  ExpectedClosure = 1005,
  AbnormalClosure = 1006,
}

export default class BinanceWebSocketClient {
  private readonly baseUrl: string;
  private ws: WebSocket | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.ws = null;
  }

  subscribeToPrice(symbol: string, handler: (price: number) => void) {
    const url = `${this.baseUrl}/ws/${symbol.toLowerCase()}@miniTicker`;
    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log(`Subscribed to ${symbol} price`);
    });

    this.ws.on("message", (data: RawData) => {
      const miniTicker = JSON.parse(data.toString());
      const { c: closePrice } = miniTicker;
      handler(Number(closePrice));
    });

    // reconnect if the connection is closed accidentally
    this.ws.on("close", (code: number) => {
      if (code === WebSocketErrorCode.ExpectedClosure) {
        // the connection was closed by us, just do nothing
        return;
      }
      console.log("websocket is closed accidentally, start reconnecting...");
      this.subscribeToPrice(symbol, handler);
    });
  }

  unsubscribe() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
