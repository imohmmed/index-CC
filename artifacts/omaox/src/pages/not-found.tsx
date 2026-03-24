import { useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 - الصفحة غير موجودة | Omaox أوماكس";
  }, []);

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl font-display font-black text-primary/20 mb-6">404</div>
          <h1 className="text-3xl font-bold text-white mb-4">الصفحة غير موجودة</h1>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى رابط آخر.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-zinc-950 transition-all font-bold"
          >
            العودة للرئيسية
            <ArrowLeft className="w-5 h-5 -scale-x-100" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
