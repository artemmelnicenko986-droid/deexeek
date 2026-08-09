# Mini Cars + Telegram

Сайт надсилає кожне оформлене замовлення до Telegram через серверну функцію `api/order.js`.

## Публікація на Vercel

1. Імпортуйте цю папку у ваш Vercel-проєкт або замініть нею файли поточного проєкту.
2. У Vercel відкрийте **Project → Settings → Environment Variables** і додайте:
   - `TELEGRAM_BOT_TOKEN` — токен бота з BotFather;
   - `TELEGRAM_CHAT_ID` — ID чату, до якого мають приходити заявки.
3. Натисніть **Redeploy**.

Токен не слід додавати в `app.js`, `index.html` або інші публічні файли: там його побачить кожен відвідувач.

## Як дізнатися TELEGRAM_CHAT_ID

1. Відкрийте [@Mini_carsss_bot](https://t.me/Mini_carsss_bot) у Telegram і натисніть **Start**.
2. Відкрийте [@userinfobot](https://t.me/userinfobot), натисніть **Start** і скопіюйте число в полі `Id`.
3. Це число додайте у Vercel як `TELEGRAM_CHAT_ID`.

Для групового чату додайте бота в групу, надішліть будь-яке повідомлення та отримайте ID групи через [@RawDataBot](https://t.me/RawDataBot). У групових ID зазвичай починається з `-100`.

## Перевірка

Після деплою відкрийте сайт, натисніть «Замовити», введіть тестове ім'я й телефон та надішліть форму. У Telegram має з'явитися повідомлення з моделлю, ціною, ім'ям та телефоном.
Telegram orders enabled.
