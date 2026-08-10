import { createHash, randomUUID, timingSafeEqual } from "node:crypto";

export const PRICE_UAH = 1500;
export const PRICE_LABEL = "1 500 грн";

export const PRODUCTS = new Set(["Чорний Bentley", "Білий Bentley"]);

const UKRAINIAN_PHONE = /^\+380 (?:39|50|63|66|67|68|73|75|77|89|91|92|93|94|95|96|97|98|99) \d{3} \d{2} \d{2}$/;

export function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;

  const body = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
  if (typeof body !== "string") return {};

  try {
    return JSON.parse(body);
  } catch {
    return Object.fromEntries(new URLSearchParams(body));
  }
}

export function validateOrder(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const product = typeof body.product === "string" ? body.product.trim() : "";

  if (
    name.length < 2 ||
    name.length > 80 ||
    !UKRAINIAN_PHONE.test(phone) ||
    !PRODUCTS.has(product)
  ) {
    return null;
  }

  return { name, phone, product };
}

export function encodeData(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

export function decodeData(data) {
  return JSON.parse(Buffer.from(data, "base64").toString("utf8"));
}

export function createSignature(privateKey, data) {
  return createHash("sha3-256")
    .update(`${privateKey}${data}${privateKey}`, "utf8")
    .digest("base64");
}

export function signatureIsValid(privateKey, data, signature) {
  if (typeof signature !== "string") return false;

  const expected = Buffer.from(createSignature(privateKey, data));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function getSiteUrl() {
  const rawUrl = process.env.SITE_URL?.trim();
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" ? url.origin : null;
  } catch {
    return null;
  }
}

export function createOrderId() {
  return `mc-${Date.now()}-${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export function sendJson(res, status, body) {
  return res.status(status).json(body);
}
