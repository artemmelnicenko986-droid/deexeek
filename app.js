const modal = document.querySelector("#order-modal");
const form = document.querySelector("#order-form");
const productSelect = document.querySelector("#product-select");
const closeButton = document.querySelector("#close-order");
const doneButton = document.querySelector("#done-order");
const submitButton = document.querySelector("#submit-order");
const errorMessage = document.querySelector("#form-error");
const successMessage = document.querySelector("#success-message");
let lastTrigger = null;

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

document.querySelectorAll(".js-order").forEach((button) => {
  button.addEventListener("click", () => openOrder(button.dataset.product, button));
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

  if (!/^[+]?[-()\d\s]{7,24}$/.test(phone)) {
    errorMessage.textContent = "Вкажіть коректний номер телефону.";
    errorMessage.hidden = false;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Надсилаємо…";
  try {
    const response = await fetch("/api/order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, phone, product, price: "1 500 грн" }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Не вдалося надіслати замовлення.");

    form.hidden = true;
    successMessage.hidden = false;
  } catch (error) {
    errorMessage.textContent = error.message || "Не вдалося надіслати замовлення. Спробуйте ще раз.";
    errorMessage.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Оформити замовлення";
  }
});
