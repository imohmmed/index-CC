import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Shield, Zap, Clock, Users, CheckCircle2, Copy, Check, CreditCard, Smartphone, Lock, Star, ChevronDown, MessageCircle, Award, Eye, Globe } from "lucide-react";
import { useRate } from "@/hooks/use-rate";

function Hero({ ratePerHundred }: { ratePerHundred: number }) {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="absolute inset-0 z-[-1]">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
          alt="" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card-gold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-bold text-primary">منصة موثوقة وآمنة</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              اشتري USDT بأفضل سعر <br/>
              في العراق مع <span className="text-gradient-gold">Omaox</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Omaox منصة موثوقة لبيع وشراء USDT بسعر {ratePerHundred.toLocaleString()} دينار لكل 100$ USDT. أرخص من السعر الأصلي 152,000. تحويلات سريعة وآمنة.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/buy" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-gold text-zinc-950 font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all hover:-translate-y-1"
              >
                شراء الآن بأفضل سعر
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card flex items-center justify-center gap-3">
                <span className="text-zinc-400">سعر الصرف:</span>
                <span className="font-bold text-white text-lg">100$ = <span className="text-primary">{ratePerHundred.toLocaleString()}</span> د.ع</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Converter({ rate, ratePerHundred }: { rate: number; ratePerHundred: number }) {
  const [usdt, setUsdt] = useState<number | string>(100);
  const iqd = (Number(usdt) || 0) * rate;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <span className="text-primary font-bold text-sm tracking-wider mb-2 block">سعر Omaox الحصري</span>
            <h2 className="text-4xl font-bold text-white mb-6">
              أرخص من السعر الأصلي بـ <span className="text-primary">20,000</span> دينار
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <span className="text-zinc-300 font-medium">السعر الأصلي (السوق)</span>
                <span className="font-bold line-through text-red-400/80">152,000 د.ع</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <span className="text-zinc-300 font-medium">منصات أخرى</span>
                <span className="font-bold text-zinc-400 line-through">145,000 د.ع</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/10 relative overflow-hidden">
                <span className="text-primary font-bold">سعر Omaox الحصري</span>
                <span className="text-white font-bold text-xl">{ratePerHundred.toLocaleString()} د.ع</span>
              </div>
            </div>
            
            <ul className="space-y-3">
              {[
                "سعر حصري أرخص بـ 20,000 دينار",
                "تحديث مستمر للأسعار على مدار الساعة",
                "تنفيذ فوري للمعاملات خلال دقائق"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="lg:w-1/2 w-full max-w-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card-gold rounded-3xl p-8 relative"
            >
              <h3 className="text-2xl font-bold text-white mb-6">حاسبة التحويل</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">المبلغ بالدولار (USDT)</label>
                  <input 
                    type="number"
                    value={usdt}
                    onChange={(e) => setUsdt(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-xl font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-left"
                    dir="ltr"
                    placeholder="0.00"
                  />
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 text-zinc-400 -rotate-90" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">المبلغ بالدينار العراقي (IQD)</label>
                  <div className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-4 text-primary text-xl font-bold text-left" dir="ltr">
                    {formatCurrency(iqd)}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm mb-6">
                    <span className="text-zinc-400">سعر الصرف</span>
                    <span className="text-white font-medium">1 USDT = {rate.toLocaleString()} IQD</span>
                  </div>
                  
                  <Link 
                    href="/buy" 
                    className="w-full block text-center py-4 rounded-xl bg-primary text-zinc-950 font-bold text-lg hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                  >
                    اطلب الآن
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { label: "طلب منجز اليوم", value: "٤٧", icon: Zap },
    { label: "إجمالي العمليات", value: "١٠٬٨٤٣", icon: CheckCircle2 },
    { label: "مستخدم متصل الآن", value: "١٢", icon: Users },
    { label: "دقيقة متوسط التنفيذ", value: "٣", icon: Clock },
  ];

  return (
    <section className="py-12 border-y border-white/5 bg-white/[0.02]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-primary font-bold text-sm">مباشر الآن</span>
          <h2 className="text-3xl font-bold text-white mt-2">نشاط Omaox اليوم</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
              <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Steps() {
  const steps = [
    { num: "01", title: "حدد المبلغ", desc: "استخدم حاسبة التحويل لتحديد مبلغ USDT الذي تريد شراءه" },
    { num: "02", title: "اختر طريقة الدفع", desc: "اختر طريقة الدفع المناسبة لك: البطاقة الذكية، زين كاش، ماستركارد، أو FIB" },
    { num: "03", title: "أدخل البيانات", desc: "أدخل بياناتك بأمان عبر نموذجنا المشفر بتقنية SSL" },
    { num: "04", title: "استلم عملاتك", desc: "استلم عملات USDT في محفظتك الرقمية خلال دقائق معدودة" },
  ];

  return (
    <section className="py-24 bg-zinc-900/50 border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-bold text-sm tracking-wider mb-2 block">كيف تشتري؟</span>
          <h2 className="text-4xl font-bold text-white">خطوات بسيطة وسريعة</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors group"
            >
              <div className="text-6xl font-black text-white/5 absolute top-4 left-6 group-hover:text-primary/10 transition-colors">
                {step.num}
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-6">
                {i + 1}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PaymentMethods() {
  const methods = [
    { name: "البطاقة الذكية", desc: "ادفع باستخدام البطاقة الذكية بسهولة وأمان", icon: CreditCard, badge: "الأكثر استخداماً" },
    { name: "زين كاش", desc: "تحويل سريع عبر محفظة زين كاش الإلكترونية", icon: Smartphone, badge: null },
    { name: "ماستركارد", desc: "الدفع عبر بطاقة ماستركارد بشكل آمن ومضمون", icon: CreditCard, badge: null },
    { name: "FIB", desc: "التحويل عبر مصرف FIB بكل سهولة وسرعة", icon: Smartphone, badge: null },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-bold text-sm tracking-wider mb-2 block">طرق الدفع المتاحة</span>
          <h2 className="text-4xl font-bold text-white">ادفع بالطريقة التي تناسبك</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {methods.map((method, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center hover:border-primary/30 transition-colors relative"
            >
              {method.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-zinc-950 text-xs font-bold rounded-full whitespace-nowrap">
                  {method.badge}
                </div>
              )}
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <method.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{method.name}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{method.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const features = [
    { title: "أمان مضمون", desc: "جميع المعاملات مشفرة ومحمية بأعلى معايير الأمان لضمان سلامة أموالك", icon: Shield },
    { title: "دعم على مدار الساعة", desc: "فريق دعم متخصص جاهز لمساعدتك في أي وقت والإجابة على جميع استفساراتك", icon: MessageCircle },
    { title: "آلاف العملاء", desc: "نفتخر بثقة آلاف العملاء الذين يعتمدون على Omaox في معاملاتهم اليومية", icon: Users },
    { title: "خصوصية تامة", desc: "نحترم خصوصيتك ولا نشارك بياناتك الشخصية مع أي طرف ثالث", icon: Eye },
  ];

  return (
    <section className="py-24 bg-zinc-900/50 border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-bold text-sm tracking-wider mb-2 block">لماذا Omaox؟</span>
          <h2 className="text-4xl font-bold text-white mb-4">منصة موثوقة لتبادل العملات الرقمية</h2>
          <p className="text-zinc-400 text-lg">نسعى في Omaox لتقديم أفضل تجربة لشراء عملات USDT في العراق</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <feature.icon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportedBanks() {
  const banks = [
    { name: "زين كاش", abbr: "ZC" },
    { name: "FIB", abbr: "FIB" },
    { name: "آسيا حوالة", abbr: "AH" },
    { name: "ماستركارد", abbr: "MC" },
    { name: "فيزا", abbr: "V" },
    { name: "بنك الرافدين", abbr: "BR" },
    { name: "بنك الرشيد", abbr: "RS" },
    { name: "كي كارد", abbr: "KC" },
  ];

  const trustBadges = [
    { icon: Lock, label: "SSL مشفر", desc: "بروتوكول TLS 256-bit" },
    { icon: CheckCircle2, label: "معاملات آمنة", desc: "حماية كاملة لبياناتك" },
    { icon: Zap, label: "تحويل فوري", desc: "خلال 3 دقائق أو أقل" },
    { icon: Shield, label: "ضمان استرداد", desc: "في حال أي مشكلة" },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-bold text-sm tracking-wider mb-2 block">موثوق من قِبل</span>
          <h2 className="text-4xl font-bold text-white mb-4">ندعم جميع طرق الدفع العراقية</h2>
          <p className="text-zinc-400">متوافق مع البنوك والمحافظ الإلكترونية الرئيسية في العراق</p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto mb-16">
          {banks.map((bank, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-sm">
                {bank.abbr}
              </div>
              <span className="text-zinc-400 text-xs text-center">{bank.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {trustBadges.map((badge, i) => (
            <div key={i} className="glass-card rounded-xl p-4 text-center">
              <badge.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-white font-bold text-sm">{badge.label}</p>
              <p className="text-zinc-500 text-xs">{badge.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
          {[
            { value: "+5,000", label: "زبون راضٍ" },
            { value: "+10,000", label: "عملية ناجحة" },
            { value: "3 دقائق", label: "متوسط وقت التسليم" },
            { value: "100%", label: "معاملات آمنة" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-zinc-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  const certs = [
    { icon: Lock, title: "تشفير SSL 256-bit", desc: "أعلى مستويات التشفير لحماية بياناتك" },
    { icon: CheckCircle2, title: "منصة موثقة", desc: "منصة معروفة وموثوقة في العراق" },
    { icon: Shield, title: "حماية البيانات الشاملة", desc: "لا نحتفظ ببيانات بطاقتك بعد العملية" },
    { icon: Award, title: "موثوقية عالية", desc: "أكثر من سنة من الخدمة المتميزة" },
    { icon: Zap, title: "تسليم فوري 24/7", desc: "خدمة متاحة طوال الوقت بدون توقف" },
    { icon: Globe, title: "دعم عملاء عراقي", desc: "فريق دعم متخصص يتحدث العربية" },
  ];

  return (
    <section className="py-24 bg-zinc-900/50 border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-bold text-sm tracking-wider mb-2 block">أمان وموثوقية</span>
          <h2 className="text-4xl font-bold text-white mb-4">لماذا تثق بـ Omaox؟</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {certs.map((cert, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
            >
              <cert.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="text-white font-bold mb-2">{cert.title}</h3>
              <p className="text-zinc-400 text-sm">{cert.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {["SSL Secure", "Verified", "Safe", "Trusted"].map((badge, i) => (
            <div key={i} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium flex items-center gap-2">
              {i === 0 && <Lock className="w-4 h-4 text-green-500" />}
              {i === 1 && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
              {i === 2 && <Shield className="w-4 h-4 text-primary" />}
              {i === 3 && <Star className="w-4 h-4 text-amber-400" />}
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Coupons() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const coupons = [
    { code: "OM7K2M9X", discount: "130,000 د.ع" },
    { code: "OML5R8N3", discount: "130,000 د.ع" },
    { code: "OM9J4T6P", discount: "130,000 د.ع" },
  ];

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">كوبونات خصم <span className="text-primary">حصرية</span></h2>
          <p className="text-zinc-400 text-lg">استخدم أحد هذه الكوبونات للحصول على خصم فوري على عملية الشراء</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {coupons.map((coupon, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-colors"></div>
              
              <div className="text-zinc-400 text-sm mb-2 font-medium">كود الكوبون</div>
              <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 mb-4 border border-white/5">
                <code className="text-primary font-mono font-bold text-lg tracking-wider">{coupon.code}</code>
                <button 
                  onClick={() => copyCode(coupon.code, i)}
                  className="p-2 rounded-md hover:bg-white/10 text-zinc-300 transition-colors"
                >
                  {copiedIndex === i ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">قيمة الخصم</span>
                <span className="text-primary font-bold">{coupon.discount}</span>
              </div>
              <div className="mt-2 text-xs text-zinc-500">خصم فوري</div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm mb-4">لدينا 80 كوبون خصم متاح! انسخ أحد الأكواد أعلاه والصقه في صفحة الشراء</p>
          <Link href="/buy" className="inline-flex items-center gap-2 text-primary hover:text-amber-400 font-bold text-lg transition-colors group">
            اذهب إلى صفحة الشراء
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const reviews = [
    { name: "أحمد الموسوي", city: "بغداد", time: "منذ يومين", amount: "500 USDT", text: "خدمة ممتازة وسريعة جداً! اشتريت 500 USDT ووصلت لمحفظتي خلال دقائق. سعر الصرف منافس ومو لاقي أحسن منه بالعراق." },
    { name: "محمد الجبوري", city: "الموصل", time: "منذ أسبوع", amount: "1000 USDT", text: "تعاملت معهم أكثر من 10 مرات والحمدلله ما عندي أي شكوى. الموقع سهل الاستخدام والفريق متعاون." },
    { name: "علي الكريمي", city: "البصرة", time: "منذ 3 أيام", amount: "200 USDT", text: "أول مرة أشتري USDT وكنت خايف بس الموقع واضح وأمين. ساعدوني خطوة بخطوة." },
    { name: "حسين العبيدي", city: "النجف", time: "منذ 5 أيام", amount: "300 USDT", text: "سعر ممتاز وخدمة احترافية. جربت مواقع ثانية بس Omaox الأفضل. السرعة والأمان موجودين مع بعض." },
    { name: "كريم الزيدي", city: "كربلاء", time: "منذ أسبوع", amount: "150 USDT", text: "تحويل سريع ومضمون. استلمت العملات بدون أي مشكلة. الموقع محترم وواضح ما فيه أي غموض." },
    { name: "عمر الراشدي", city: "أربيل", time: "منذ 4 أيام", amount: "750 USDT", text: "أفضل منصة لشراء USDT بالعراق. سعر الصرف دايماً محدث والتعامل سهل." },
  ];

  return (
    <section className="py-24 bg-zinc-900/50 border-y border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-4">
          <span className="text-primary font-bold text-sm tracking-wider mb-2 block">آراء زبائننا</span>
          <h2 className="text-4xl font-bold text-white mb-4">ماذا يقول زبائننا</h2>
          <p className="text-zinc-400">آلاف الزبائن يثقون بـ Omaox يومياً لشراء USDT بأفضل الأسعار</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-white font-bold text-lg">4.9</span>
          <span className="text-zinc-400">/ 5.0</span>
          <span className="text-zinc-500 text-sm mr-2">• +5044 تقييم</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <p className="text-zinc-300 text-sm leading-relaxed mb-4">"{review.text}"</p>
              <div className="border-t border-white/5 pt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{review.name}</p>
                  <p className="text-zinc-500 text-xs">{review.city} • {review.time}</p>
                </div>
                <div className="mr-auto">
                  <span className="text-xs text-zinc-500 bg-white/5 px-2 py-1 rounded-full">اشترى {review.amount}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/buy" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-gold text-zinc-950 font-bold text-lg hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all">
            اشتر USDT الآن
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    { q: "كيف أشتري USDT من Omaox؟", a: "الأمر بسيط جداً! حدد المبلغ المراد شراؤه، اختر طريقة الدفع المناسبة، أدخل بياناتك بأمان، وانتظر كود التحقق. بعد إدخال الكود، سيتم تحويل USDT إلى محفظتك خلال دقائق." },
    { q: "ما هو سعر صرف USDT الحالي عند Omaox؟", a: "سعر الصرف محدث باستمرار ومعروض في أعلى الصفحة. وهو أرخص من السعر الأصلي في السوق (152,000 دينار). تابع الموقع لمعرفة آخر تحديث." },
    { q: "كم يستغرق استقبال USDT بعد التحويل؟", a: "في العادة يتم التحويل خلال 2-5 دقائق فقط بعد تأكيد الدفع. في حالات نادرة قد يستغرق الأمر حتى 30 دقيقة." },
    { q: "هل Omaox آمنة وموثوقة؟", a: "نعم، Omaox منصة موثوقة ومحمية بتشفير SSL 256-bit. لا نحتفظ ببيانات بطاقتك بعد إتمام العملية، ونلتزم بأعلى معايير الأمان." },
    { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل البطاقة الذكية، زين كاش، ماستركارد، فيزا، FIB، وغيرها من طرق الدفع العراقية." },
    { q: "هل هناك حد أدنى أو أقصى لشراء USDT؟", a: "الحد الأدنى للشراء هو 5 دولار USDT. لا يوجد حد أقصى محدد، لكن المبالغ الكبيرة قد تحتاج تنسيق مسبق." },
    { q: "كيف أتابع طلبي؟", a: "بعد إتمام الطلب، ستحصل على رقم طلب يمكنك استخدامه للمتابعة. يمكنك التواصل معنا عبر التيليكرام لأي استفسار." },
    { q: "هل يمكنني بيع USDT إلى Omaox؟", a: "حالياً نقدم خدمة شراء USDT فقط. سنضيف خدمة البيع قريباً إن شاء الله." },
  ];

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">أسئلة شائعة حول شراء USDT</h2>
          <p className="text-zinc-400">إجابات على أكثر الأسئلة التي يطرحها عملاؤنا</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-white/5 transition-colors"
              >
                <span className="text-white font-bold text-sm">{faq.q}</span>
                <ChevronDown className={cn("w-5 h-5 text-zinc-400 shrink-0 transition-transform", openIndex === i && "rotate-180 text-primary")} />
              </button>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="px-5 pb-5"
                >
                  <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-400 mb-4">هل لديك سؤال آخر؟ تواصل معنا مباشرة على التيليجرام</p>
          <a href="https://t.me/usdtsoule" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass-card text-primary font-bold hover:bg-white/10 transition-colors">
            <MessageCircle className="w-5 h-5" />
            تواصل معنا على التيليجرام
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { rate, ratePerHundred } = useRate();

  useEffect(() => {
    document.title = "Omaox | شراء USDT في العراق بأفضل سعر - منصة أوماكس الموثوقة";
    document.querySelector('meta[name="description"]')?.setAttribute("content", "منصة Omaox أوماكس الموثوقة لشراء عملة USDT تيثر في العراق بأفضل الأسعار. سعر الصرف: 100$ = 132,000 دينار عراقي. تحويلات فورية وآمنة مع دعم 24/7.");
  }, []);
  
  return (
    <Layout>
      <Hero ratePerHundred={ratePerHundred} />
      <Stats />
      <Converter rate={rate} ratePerHundred={ratePerHundred} />
      <Steps />
      <PaymentMethods />
      <WhyUs />
      <SupportedBanks />
      <SecuritySection />
      <Coupons />
      <Testimonials />
      <FAQ />
    </Layout>
  );
}
