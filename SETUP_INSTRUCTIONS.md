# إعداد Rankora - تعليمات التثبيت

## 1. إعداد Supabase

### أ) إنشاء مشروع Supabase جديد
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اضغط على "New Project"
3. اختر اسم المشروع: `rankora-project`
4. انتظر حتى يكتمل إنشاء المشروع

### ب) الحصول على مفاتيح API
1. اذهب إلى `Settings` > `API`
2. انسخ:
   - `Project URL` (سيكون بصيغة: `https://xyzcompany.supabase.co`)
   - `anon public` key

### ج) إعداد المصادقة
1. اذهب إلى `Authentication` > `Settings`
2. في قسم `Site URL`:
   - أضف: `http://localhost:5173` (للتطوير)
   - أضف: `https://yourdomain.com` (للإنتاج)

### د) إعداد Google OAuth
1. اذهب إلى `Authentication` > `Providers`
2. فعّل `Google`
3. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
4. أنشئ مشروع جديد أو اختر مشروع موجود
5. فعّل `Google+ API`
6. اذهب إلى `Credentials` > `Create Credentials` > `OAuth 2.0 Client ID`
7. اختر `Web application`
8. أضف URIs للتطوير:
   - `http://localhost:5173`
   - `https://xyzcompany.supabase.co/auth/v1/callback`
9. انسخ `Client ID` و `Client Secret`
10. ألصقهم في إعدادات Google في Supabase

## 2. إعداد قاعدة البيانات

### أ) تشغيل migrations
اذهب إلى `SQL Editor` في Supabase وشغّل الملفات التالية بالترتيب:

1. **إنشاء الجداول الأساسية:**
```sql
-- إنشاء جدول البروفايلات
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company text,
  timezone text DEFAULT 'UTC',
  role user_role DEFAULT 'starter',
  role_assigned_by uuid REFERENCES auth.users(id),
  role_assigned_at timestamptz DEFAULT now(),
  notifications jsonb DEFAULT '{"email": true, "push": false, "weekly": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول التحليلات
CREATE TABLE IF NOT EXISTS user_analyses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المقارنات
CREATE TABLE IF NOT EXISTS user_comparisons (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_url text NOT NULL,
  competitor_url text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المشاريع
CREATE TABLE IF NOT EXISTS projects (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول تحليلات المشاريع
CREATE TABLE IF NOT EXISTS project_analyses (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id bigint REFERENCES projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

2. **تفعيل Row Level Security:**
```sql
-- تفعيل RLS على جميع الجداول
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;

-- إنشاء policies
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own analyses" ON user_analyses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own comparisons" ON user_comparisons
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own project analyses" ON project_analyses
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

3. **شغّل ملفات migration الموجودة:**
   - اذهب إلى مجلد `supabase/migrations/`
   - انسخ محتوى كل ملف وشغّله في SQL Editor

## 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في root المشروع:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# PayPal Configuration
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Webhook URLs
VITE_WEBHOOK_ANALYZE_URL=your_analyze_webhook_url
VITE_WEBHOOK_COMPARE_URL=your_compare_webhook_url

# Owner Configuration
VITE_OWNER_EMAIL=ammarebrahim725@gmail.com
```

## 4. تشغيل المشروع

```bash
# تثبيت dependencies
npm install

# تشغيل المشروع
npm run dev
```

## 5. اختبار المصادقة

### أ) تسجيل الدخول العادي
1. اذهب إلى صفحة التسجيل
2. أدخل بريد إلكتروني وكلمة مرور
3. تحقق من البريد الإلكتروني للتفعيل

### ب) تسجيل الدخول عبر Google
1. اضغط على "Continue with Google"
2. اختر حساب Google
3. يجب أن يتم توجيهك إلى Dashboard

## 6. استكشاف الأخطاء

### مشكلة: "Supabase not configured"
- تأكد من وجود ملف `.env`
- تأكد من صحة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY`

### مشكلة: Google OAuth لا يعمل
- تأكد من إضافة الـ redirect URLs الصحيحة في Google Console
- تأكد من تفعيل Google provider في Supabase
- تأكد من صحة Client ID و Client Secret

### مشكلة: خطأ في قاعدة البيانات
- تأكد من تشغيل جميع migrations
- تأكد من تفعيل RLS policies
- تحقق من logs في Supabase Dashboard

## 7. إعداد الإنتاج

### أ) Vercel
1. ربط المشروع بـ GitHub
2. إضافة environment variables في Vercel dashboard
3. تحديث redirect URLs في Google Console و Supabase

### ب) Netlify
1. رفع المشروع إلى Netlify
2. إضافة environment variables
3. تحديث redirect URLs

---

## ملاحظات إضافية

- تأكد من تحديث بريد الـ Owner في الكود إذا لزم الأمر
- يمكنك تخصيص الألوان والتصميم من خلال `tailwind.config.js` و `src/index.css`
- لإضافة مزودي OAuth إضافيين، ارجع إلى وثائق Supabase

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من browser console للأخطاء
2. تحقق من Supabase logs
3. تأكد من أن جميع environment variables محددة بشكل صحيح
