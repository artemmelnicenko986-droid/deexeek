const TELEGRAM_API = "https://api.telegram.org";

function readBody(req) {
  if (typeof req.body === "object" && req.body !== null) return req.body;
  if (typeof req.body !== "string") return {};

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  const { name, phone, product, price } = readBody(req);
  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";
  const cleanProduct = typeof product === "string" ? product.trim() : "";
  const cleanPrice = typeof price === "string" ? price.trim() : "";

  const validPhone = /^\+380 (?:39|50|63|66|67|68|73|75|77|89|91|92|93|94|95|96|97|98|99) \d{3} \d{2} \d{2}$/.test(cleanPhone);
  if (
    cleanName.length < 2 ||
    cleanName.length > 80 ||
    !validPhone ||
    !["Чорний Bentley", "Білий Bentley"].includes(cleanProduct) ||
    cleanPrice !== "1 500 грн"
  ) {
    return sendJson(res, 400, { error: "Некоректні дані замовлення." });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("Telegram environment variables are not configured.");
    return sendJson(res, 500, { error: "Сервіс замовлень тимчасово недоступний." });
  }

  const message = [
    "Нове замовлення — Mini Cars",
    "",
    `Модель: ${cleanProduct}`,
    `Ціна: ${cleanPrice}`,
    `Ім'я: ${cleanName}`,
    `Телефон: ${cleanPhone}`,
    `Час: ${new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" })}`,
  ].join("\n");

  try {
    const telegramResponse = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    if (!telegramResponse.ok) {
      const details = await telegramResponse.text();
      console.error("Telegram delivery failed:", details);
      return sendJson(res, 502, { error: "Не вдалося надіслати замовлення. Спробуйте ще раз." });
    }
  } catch (error) {
    console.error("Telegram request failed:", error);
    return sendJson(res, 502, { error: "Не вдалося надіслати замовлення. Спробуйте ще раз." });
  }

  return sendJson(res, 200, { ok: true });
}
