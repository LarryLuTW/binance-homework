import { createHmac } from "crypto";

// get timestamp in milliseconds
export const getTimestamp = () => Date.now();

// generate signature from request body
export const getSignature = (body: string, secret: string) => {
  const hmac = createHmac("sha256", secret);
  return hmac.update(body).digest("hex");
};

export function inRange(value: number, min: number, max: number): boolean {
  return value > min && value < max;
}
