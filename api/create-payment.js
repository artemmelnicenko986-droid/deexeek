import {
  createOrderId,
  createSignature,
  encodeData,
  getSiteUrl,
  PRICE_LABEL,
  PRICE_UAH,
  readBody,
  sendJson,
  validateOrder,
} from "../lib/liqpay.js";

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const order = validateOrder(readBody(req));
  if (!order) {
    return sendJson(res, 400, { error: "Перевірте дані замовлення." });
  }

  const publicKey = process.env.LIQPAY_PUBLIC_KEY;
  const privateKey = process.env.LIQPAY_PRIVATE_KEY;
  const siteUrl = getSiteUrl();
  if (!publicKey || !privateKey || !siteUrl) {
    console.error("LiqPay environment variables are not configured.");
    return sendJson(res, 503, { error: "Оплата тимчасово недоступна." });
  }

  const orderId = createOrderId();
  const payment = {
    version: 7,
    public_key: publicKey,
    action: "pay",
    amount: PRICE_UAH,
    currency: "UAH",
    description: `Mini Cars — ${order.product}`,
    order_id: orderId,
    info: JSON.stringify(order),
    language: "uk",
    paytypes: "card",
    server_url: `${siteUrl}/api/liqpay-callback`,
    result_url: `${siteUrl}/?payment=return`,
  };
  const data = encodeData(payment);

  return sendJson(res, 200, {
    data,
    signature: createSignature(privateKey, data),
    checkoutUrl: "https://www.liqpay.ua/api/3/checkout",
    orderId,
    price: PRICE_LABEL,
  });
}
