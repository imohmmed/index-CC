import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ShieldCheck, Wallet, ChevronLeft } from "lucide-react";

const CITIES = ["بغداد", "الأنبار", "البصرة", "أربيل", "النجف", "كربلاء", "الموصل"];
const AMOUNTS = [100, 250, 500, 1000, 150, 2000, 300];

function NotificationBar() {
  const [notification, setNotification] = useState({ city: "بغداد", amount: 500 });
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNotification({
        city: CITIES[Math.floor(Math.random() * CITIES.length)],
        amount: AMOUNTS[Math.floor(Math.random() * AMOUNTS.length)],
      });
      setKey(prev => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 overflow-hidden relative h-10 flex items-center justify-center">
      <div className="absolute right-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        <span className="text-xs font-bold text-red-500 tracking-wider">مباشر</span>
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={key}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-sm font-medium text-zinc-300"
        >
          {notification.city} - تم شراء {notification.amount}$ USDT منذ دقائق
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/buy", label: "شراء USDT" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold p-[1px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
                <div className="w-full h-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                  <img src={`${import.meta.env.BASE_URL}images/logo.svg`} alt="Omaox Logo" className="w-8 h-8 object-contain" />
                </div>
              </div>
              <span className="text-2xl font-display font-bold text-gradient-gold tracking-tight">Omaox</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary",
                  location === link.href ? "text-primary" : "text-zinc-400"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/buy" 
              className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-bold shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all hover:-translate-y-0.5"
            >
              اطلب الآن
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-zinc-300 hover:text-white p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-white/10 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-3 rounded-lg text-base font-semibold transition-colors",
                    location === link.href ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link 
                href="/buy" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center p-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2"
              >
                شراء USDT الآن
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <img src={`${import.meta.env.BASE_URL}images/logo.svg`} alt="Omaox Logo" className="w-10 h-10" />
              <span className="text-2xl font-display font-bold text-gradient-gold">Omaox</span>
            </Link>
            <p className="text-zinc-400 leading-relaxed max-w-md mb-8">
              المنصة الأكثر أماناً وموثوقية في العراق لبيع وشراء العملات الرقمية. نوفر لك أفضل أسعار الصرف وأسرع طرق التحويل مع دعم فني على مدار الساعة.
            </p>
            <div className="flex gap-4">
              <a href="https://t.me/usdtsoule" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-primary hover:text-primary-foreground transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.802-1.056-.54-1.653-.872-2.67-1.543-1.18-.781-.416-1.21.264-1.907.178-.184 3.267-2.984 3.328-3.239.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 font-display text-lg">روابط سريعة</h4>
            <ul className="space-y-4">
              <li><Link href="/" className="text-zinc-400 hover:text-primary transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> الرئيسية</Link></li>
              <li><Link href="/buy" className="text-zinc-400 hover:text-primary transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> شراء USDT</Link></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> الشروط والأحكام</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-primary transition-colors flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> سياسة الخصوصية</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 font-display text-lg">ضمان الأمان</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">تشفير SSL 256-bit</p>
                  <p className="text-xs text-zinc-500">حماية كاملة لبياناتك</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">تسليم فوري</p>
                  <p className="text-xs text-zinc-500">معاملات سريعة وآمنة</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Omaox. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600">تطوير المنصة بأحدث تقنيات الويب</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30 selection:text-white">
      <NotificationBar />
      <Navbar />
      <main className="flex-1 w-full relative z-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
