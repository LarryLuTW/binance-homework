import axios, { AxiosInstance } from "axios";
import { getTimestamp, getSignature } from "../lib";
import { Order, SubmittedOrder } from "../type";

enum ENDPOINT {
  ORDER = "/api/v3/order",
}

type RequestPayload = Record<string, string | number>;

export default class BinanceHTTPClient {
  private readonly client: AxiosInstance;
  private readonly secretKey: string;

  constructor(baseUrl: string, apiKey: string, secretKey: string) {
    this.secretKey = secretKey;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-MBX-APIKEY": apiKey,
      },
    });
  }

  // create params from payload and also add timestamp and signature
  private createParamsFromPayload(payload: RequestPayload): URLSearchParams {
    const params = new URLSearchParams({
      ...payload,
      timestamp: getTimestamp().toString(),
    });
    const signature = getSignature(params.toString(), this.secretKey);
    params.append("signature", signature);
    return params;
  }

  async submitOrder(order: Order): Promise<SubmittedOrder> {
    const params = this.createParamsFromPayload(order);
    const res = await this.client.post(ENDPOINT.ORDER, params);
    const submittedOrder = res.data;
    return {
      symbol: submittedOrder.symbol,
      orderId: submittedOrder.orderId,
      price: Number(submittedOrder.price),
      quantity: Number(submittedOrder.origQty),
      type: submittedOrder.type,
      side: submittedOrder.side,
      timeInForce: submittedOrder.timeInForce,
    };
  }

  async cancelOrder(order: SubmittedOrder) {
    const params = this.createParamsFromPayload({
      symbol: order.symbol,
      orderId: order.orderId,
    });
    try {
      await this.client.delete(ENDPOINT.ORDER, { params });
    } catch (err: any) {
      if (err.response?.data?.code === -2011) {
        // { code: -2011, msg: 'Unknown order sent.' }
        // we can ignore this error since it means the order is already canceled
        return;
      }
      throw err;
    }
  }
}
