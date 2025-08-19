# 🔧 تعليمات إعداد ملف .env.local

## 📋 الملفات المطلوبة

### 1. إنشاء ملف .env.local
في مجلد المشروع، أنشئ ملف `.env.local` وأضف المحتوى التالي:

```bash
# Clerk Development (للعمل المحلي)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_CLERK_ENV=development

# Supabase (لا تغير أي شيء)
VITE_SUPABASE_URL=https://cpyurkebefjqyymcppag.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNweXVya2ViZWZqcXl5bWNwcGFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDQyMDgsImV4cCI6MjA3MDA4MDIwOH0.tzbcZimLXGfpUbno7DeofNQsBt8-ukkEVcE5krxcDhQ

# PayPal (Sandbox للتطوير)
VITE_PAYPAL_CLIENT_ID=AZXa_afC8OO7D4DcHjwyiMb05Dpf8_nWFaa3JePCybGPGVuQ9hJVmgyP0FSfxxpSYpykbvJHV6uW-ymG
VITE_PAYPAL_ENV=sandbox

# Owner Settings
VITE_OWNER_EMAIL=ammarebrahim47@gmail.com
```

## 🔑 الحصول على Clerk Development Key

### 1. اذهب إلى Clerk Dashboard
- [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
- اختر مشروعك

### 2. اذهب إلى API Keys
- في القائمة الجانبية، اختر "API Keys"

### 3. انسخ Development Publishable Key
- ابحث عن **Development** Publishable Key
- يجب أن يبدأ بـ `pk_test_`
- انسخه واستبدل `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` في ملف `.env.local`

## 🚀 تشغيل التطبيق

### 1. إعادة تشغيل التطبيق
```bash
npm run dev
```

### 2. التحقق من الإصلاحات
- **قاعدة البيانات**: جرب إنشاء مشروع جديد
- **PayPal**: جرب شراء خطة (ستظهر أزرار PayPal)
- **Clerk**: تأكد من أن Authentication يعمل

## ⚠️ ملاحظات مهمة

### Clerk Development Mode
- **محلياً**: استخدم `VITE_CLERK_ENV=development` مع `pk_test_` key
- **على الموقع**: سيستخدم `pk_live_` key تلقائياً

### PayPal Environment
- **محلياً**: استخدم `VITE_PAYPAL_ENV=sandbox`
- **على الموقع**: سيستخدم `live` تلقائياً

### Supabase
- لا تغير أي شيء في إعدادات Supabase
- تأكد من تشغيل `database_complete_fix.sql` في Supabase Dashboard

## 🔍 استكشاف الأخطاء

### إذا لم تعمل قاعدة البيانات:
1. تأكد من تشغيل `database_complete_fix.sql` في Supabase
2. تحقق من Console للأخطاء

### إذا لم يعمل PayPal:
1. تأكد من `VITE_PAYPAL_ENV=sandbox`
2. تحقق من Console للأخطاء
3. تأكد من أن `VITE_PAYPAL_CLIENT_ID` صحيح

### إذا لم يعمل Clerk:
1. تأكد من استخدام `pk_test_` key
2. تأكد من `VITE_CLERK_ENV=development`
