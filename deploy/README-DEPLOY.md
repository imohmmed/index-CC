# تثبيت Omaox على VPS

## المتطلبات
- Node.js 18+ (يفضل 20)
- npm أو yarn

## خطوات التثبيت

### 1. ارفع الملفات للسيرفر
ارفع مجلد `deploy` بالكامل إلى السيرفر (مثلاً `/var/www/omaox`)

### 2. ثبّت الحزم
```bash
cd /var/www/omaox
npm install
```

### 3. عدّل ملف .env
```bash
nano .env
```
غيّر القيم حسب الحاجة:
```
PORT=3000
TELEGRAM_BOT_TOKEN=التوكن_مالتك
TELEGRAM_CHAT_ID=الشات_آيدي_مالتك
EXCHANGE_RATE=1320
```

### 4. شغّل السيرفر
```bash
node server.js
```

### 5. للتشغيل الدائم (PM2)
```bash
npm install -g pm2
pm2 start server.js --name omaox
pm2 save
pm2 startup
```

### 6. إعداد Nginx (اختياري - للدومين)
```nginx
server {
    listen 80;
    server_name omaox.shop www.omaox.shop;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. شهادة SSL (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d omaox.shop -d www.omaox.shop
```

## هيكل الملفات
```
deploy/
├── .env              # متغيرات البيئة
├── package.json      # الحزم المطلوبة
├── server.js         # السيرفر الرئيسي (API + Frontend)
└── public/           # ملفات الواجهة المبنية
    ├── index.html
    ├── favicon.svg
    ├── assets/       # JS + CSS
    └── images/       # الصور
```

## أوامر البوت
- `/admin` - لوحة التحكم (تغيير السعر، الإحصائيات)
