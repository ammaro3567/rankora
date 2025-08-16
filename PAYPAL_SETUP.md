# 🚀 إعداد PayPal لـ Rankora

## 📋 المتطلبات الأساسية

### 1. حساب PayPal Developer
- اذهب إلى [PayPal Developer](https://developer.paypal.com/)
- سجل دخول أو أنشئ حساب جديد
- انتقل إلى **Dashboard**

### 2. إنشاء تطبيق PayPal
1. اضغط **Create App**
2. أدخل اسم التطبيق: `Rankora AI Analysis`
3. اختر **Business** كـ App Type
4. اضغط **Create App**

### 3. الحصول على Client ID
- انسخ **Client ID** من التطبيق
- تأكد من أنك في وضع **Sandbox** للاختبار

## 🔧 إعداد المتغيرات البيئية

### 1. إنشاء ملف .env
```bash
# في مجلد المشروع الرئيسي
cp env.example .env
```

### 2. تعبئة المتغيرات
```bash
# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=AZXa_afC8OO7D4DcHjwyiMb05Dpf8_nWFaa3JePCybGPGVuQ9hJVmgyP0FSfxxpSYpykbvJHV6uW-ymG

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# App Environment
VITE_APP_ENV=development
VITE_PAYPAL_ENV=sandbox
```

## 🗄️ إعداد قاعدة البيانات

### 1. تشغيل SQL Script
1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى `database_fix.sql`
5. اضغط **Run**

### 2. التحقق من الجداول
```sql
-- التحقق من وجود الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'subscription_plans', 'user_subscriptions');

-- التحقق من وجود الدوال
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_user_subscription', 'get_user_subscription_info');
```

## 🧪 اختبار PayPal

### 1. حسابات Sandbox
```
Buyer Account:
- Email: sb-buyer@business.example.com
- Password: 12345678

Seller Account:
- Email: sb-seller@business.example.com  
- Password: 12345678
```

### 2. خطوات الاختبار
1. شغل المشروع: `npm run dev`
2. اذهب إلى صفحة التسعير
3. اختر خطة مدفوعة
4. اضغط "Choose this plan"
5. استخدم حساب Sandbox للدفع
6. تحقق من نجاح الدفع

### 3. مراقبة الأخطاء
- اضغط `F12` لفتح Developer Tools
- اذهب إلى **Console** tab
- راقب الرسائل أثناء الدفع

## 🔍 استكشاف الأخطاء الشائعة

### 1. خطأ "Can not pay order for unauthorized order"
**السبب**: الطلب لم يتم تفويضه بشكل صحيح
**الحل**: 
- تأكد من صحة Client ID
- تحقق من أن PayPal في وضع Sandbox
- أعد تحميل الصفحة

### 2. خطأ 422 أو 400
**السبب**: بيانات الطلب غير صحيحة
**الحل**:
- تحقق من أن السعر رقم صحيح
- تأكد من صحة الوصف
- تحقق من أن custom_id صحيح

### 3. مشاكل قاعدة البيانات
**السبب**: الدوال غير موجودة
**الحل**:
- شغل `database_fix.sql` في Supabase
- تحقق من وجود الجداول والدوال
- تأكد من صحة RLS policies

### 4. الدفع لا يصل للموقع
**السبب**: مشكلة في معالجة الدفع
**الحل**:
- تحقق من Console logs
- تأكد من أن `onApprove` يعمل
- تحقق من أن `handlePaymentSuccess` يتم استدعاؤه

## 🚀 الانتقال إلى Production

### 1. تغيير البيئة
```bash
# في ملف .env
VITE_PAYPAL_ENV=live
VITE_APP_ENV=production
```

### 2. تحديث Client ID
- اذهب إلى PayPal Developer Dashboard
- غير البيئة من Sandbox إلى Live
- انسخ Client ID الجديد

### 3. إعداد Webhooks
```
URL: https://your-domain.com/.netlify/functions/paypal-webhook
Events:
- BILLING.SUBSCRIPTION.ACTIVATED
- BILLING.SUBSCRIPTION.CANCELLED
- BILLING.SUBSCRIPTION.PAYMENT.COMPLETED
```

## 📱 اختبار نهائي

### 1. اختبار الدفع
- ✅ الدفع يعمل بدون أخطاء
- ✅ الاشتراك يُنشأ في قاعدة البيانات
- ✅ المستخدم ينتقل إلى Dashboard
- ✅ لا توجد أخطاء في Console

### 2. اختبار قاعدة البيانات
- ✅ الجداول موجودة
- ✅ الدوال تعمل
- ✅ RLS policies تعمل
- ✅ البيانات تُحفظ بشكل صحيح

### 3. اختبار التطبيق
- ✅ الصفحات تعمل
- ✅ التنقل يعمل
- ✅ المصادقة تعمل
- ✅ الاشتراكات تعمل

## 🆘 الدعم

### 1. PayPal Support
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Developer Community](https://developer.paypal.com/community/)

### 2. Supabase Support
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)

### 3. Rankora Support
- تحقق من Console logs
- راجع ملفات التعليقات
- تأكد من صحة المتغيرات البيئية

---

**🎯 النتيجة النهائية**: نظام دفع PayPal يعمل بشكل كامل مع قاعدة بيانات Supabase!
