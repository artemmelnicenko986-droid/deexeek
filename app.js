const modal = document.querySelector("#order-modal");
const form = document.querySelector("#order-form");
const productSelect = document.querySelector("#product-select");
const closeButton = document.querySelector("#close-order");
const doneButton = document.querySelector("#done-order");
const submitButton = document.querySelector("#submit-order");
const errorMessage = document.querySelector("#form-error");
const successMessage = document.querySelector("#success-message");
const phoneInput = form.elements.phone;
const ukrainianMobileCodes = ["39", "50", "63", "66", "67", "68", "73", "75", "77", "89", "91", "92", "93", "94", "95", "96", "97", "98", "99"];
const ukrainianPhonePattern = /^\+380 (?:39|50|63|66|67|68|73|75|77|89|91|92|93|94|95|96|97|98|99) \d{3} \d{2} \d{2}$/;
let lastTrigger = null;

function formatUkrainianPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("380")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 9);

  let formatted = "+380";
  if (digits.length) formatted += ` ${digits.slice(0, 2)}`;
  if (digits.length > 2) formatted += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) formatted += ` ${digits.slice(5, 7)}`;
  if (digits.length > 7) formatted += ` ${digits.slice(7, 9)}`;
  return formatted;
}

function openOrder(product, trigger) {
  lastTrigger = trigger;
  productSelect.value = product || "Чорний Bentley";
  form.hidden = false;
  successMessage.hidden = true;
  errorMessage.hidden = true;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => form.elements.name.focus());
}

function closeOrder() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  form.reset();
  errorMessage.hidden = true;
  lastTrigger?.focus();
}

function redirectToLiqPay(checkoutUrl, data, signature) {
  const paymentForm = document.createElement("form");
  paymentForm.method = "POST";
  paymentForm.action = checkoutUrl;
  paymentForm.acceptCharset = "utf-8";

  for (const [name, value] of Object.entries({ data, signature })) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    paymentForm.append(input);
  }

  document.body.append(paymentForm);
  paymentForm.submit();
}

function showPaymentReturn() {
  if (new URLSearchParams(window.location.search).get("payment") !== "return") return;

  window.history.replaceState({}, document.title, window.location.pathname);
  form.hidden = true;
  successMessage.hidden = false;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

document.querySelectorAll(".js-order").forEach((button) => {
  button.addEventListener("click", () => openOrder(button.dataset.product, button));
});

phoneInput.addEventListener("focus", () => {
  if (!phoneInput.value) phoneInput.value = "+380";
});

function validatePhoneCode() {
  const code = phoneInput.value.match(/^\+380 (\d{2})/)?.[1];
  const isValid = !code || ukrainianMobileCodes.includes(code);

  phoneInput.setCustomValidity(
    isValid ? "" : "Вкажіть український мобільний код, наприклад 068, 096 або 073.",
  );
  return isValid;
}

phoneInput.addEventListener("input", () => {
  phoneInput.value = formatUkrainianPhone(phoneInput.value);
  validatePhoneCode();
});

closeButton.addEventListener("click", closeOrder);
doneButton.addEventListener("click", closeOrder);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeOrder();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeOrder();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.hidden = true;

  const data = new FormData(form);
  const name = data.get("name").trim();
  const phone = data.get("phone").trim();
  const product = data.get("product");

  if (!ukrainianPhonePattern.test(phone)) {
    errorMessage.textContent = "Вкажіть український мобільний номер у форматі +380 68 123 45 67.";
    errorMessage.hidden = false;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Переходимо до оплати…";
  try {
    const response = await fetch("/api/create-payment", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, phone, product }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.data || !result.signature || !result.checkoutUrl) {
      throw new Error(result.error || "Не вдалося створити платіж.");
    }

    redirectToLiqPay(result.checkoutUrl, result.data, result.signature);
  } catch (error) {
    errorMessage.textContent = error.message || "Не вдалося перейти до оплати. Спробуйте ще раз.";
    errorMessage.hidden = false;
    submitButton.disabled = false;
    submitButton.textContent = "Перейти до оплати";
  }
});

showPaymentReturn();
