# 🗄️ إصلاح قاعدة البيانات - Database Fix Instructions

## 🚨 المشاكل الموجودة

من الصور والـ Console أرى المشاكل التالية:

1. **خطأ 404 في إنشاء المشاريع:**
   ```
   POST https://cpyurkebefjgyymcppag.supabase.co/rest/v1/rpc/create_project...
   404 (Not Found)
   ```

2. **دوال قاعدة البيانات مفقودة:**
   ```
   PGRST202: Could not find the function public.create_project_with_limit_check
   ```

3. **مشاكل في استدعاء RPC functions**

4. **Dashboard لا يعمل بسبب مشاكل قاعدة البيانات**

## ✅ الحل المطلوب

### 1. **تشغيل ملف الإصلاح الشامل**

قم بتشغيل ملف `database_complete_fix.sql` في Supabase SQL Editor:

1. اذهب إلى [Supabase Dashboard](https://app.supabase.com)
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى ملف `database_complete_fix.sql`
5. اضغط **Run** لتنفيذ الكود

### 2. **ما سيتم إنشاؤه**

#### **الجداول:**
- ✅ `profiles` - ملفات المستخدمين
- ✅ `subscription_plans` - خطط الاشتراك
- ✅ `user_subscriptions` - اشتراكات المستخدمين
- ✅ `subscription_history` - تاريخ الاشتراكات
- ✅ `projects` - المشاريع
- ✅ `user_analyses` - التحليلات
- ✅ `competitor_comparisons` - مقارنات المنافسين

#### **الدوال:**
- ✅ `create_user_subscription` - إنشاء اشتراك
- ✅ `get_user_subscription_info` - معلومات الاشتراك
- ✅ `check_user_limits` - التحقق من الحدود
- ✅ `create_project_with_limit_check` - إنشاء مشروع مع فحص الحدود
- ✅ `create_analysis_with_limit_check` - إنشاء تحليل مع فحص الحدود
- ✅ `get_monthly_usage` - الاستخدام الشهري
- ✅ `list_user_projects` - قائمة المشاريع
- ✅ `get_project_analyses` - تحليلات المشروع
- ✅ `delete_user_project` - حذف المشروع

#### **السياسات:**
- ✅ RLS policies لجميع الجداول
- ✅ صلاحيات للمستخدمين
- ✅ Triggers لتحديث `updated_at`

### 3. **بعد تشغيل الإصلاح**

#### **التحقق من الجداول:**
```sql
-- التحقق من وجود الجداول
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'subscription_plans', 'user_subscriptions', 'projects', 'user_analyses');
```

#### **التحقق من الدوال:**
```sql
-- التحقق من وجود الدوال
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('create_project_with_limit_check', 'check_user_limits', 'get_monthly_usage');
```

#### **التحقق من البيانات:**
```sql
-- التحقق من الخطط
SELECT * FROM subscription_plans;

-- التحقق من المستخدمين
SELECT * FROM profiles;
```

### 4. **اختبار Dashboard**

بعد تشغيل الإصلاح:

1. **أعد تحميل الصفحة** (F5)
2. **اختبر إنشاء مشروع جديد**
3. **تحقق من Console** - يجب ألا توجد أخطاء 404
4. **تحقق من Dashboard** - يجب أن يعمل بشكل طبيعي

### 5. **إذا استمرت المشكلة**

#### **أ. تحقق من RLS Policies:**
```sql
-- التحقق من RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

#### **ب. تحقق من الصلاحيات:**
```sql
-- التحقق من الصلاحيات
SELECT grantee, privilege_type, table_name 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public';
```

#### **ج. تحقق من الدوال:**
```sql
-- التحقق من الدوال
SELECT proname, prosrc 
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

### 6. **رسائل النجاح المتوقعة**

بعد تشغيل الإصلاح يجب أن ترى:

```
✅ Database setup completed successfully!
✅ All tables created
✅ All functions created
✅ All policies applied
✅ All indexes created
✅ Default plans inserted
```

### 7. **اختبار نهائي**

#### **أ. إنشاء مشروع:**
- اذهب إلى صفحة Projects
- أدخل اسم مشروع جديد
- اضغط Create
- يجب أن يعمل بدون أخطاء

#### **ب. Dashboard:**
- يجب أن يظهر الاستخدام الصحيح
- يجب أن تعمل جميع الإحصائيات
- لا توجد أخطاء في Console

#### **ج. إنشاء تحليل:**
- اذهب إلى AI Analyzer
- أدخل URL
- اضغط Analyze
- يجب أن يعمل بدون أخطاء

## 🚀 بعد الإصلاح

بعد تطبيق هذا الإصلاح:

- ✅ قاعدة البيانات تعمل بشكل كامل
- ✅ Dashboard يعمل بدون مشاكل
- ✅ إنشاء المشاريع يعمل
- ✅ إنشاء التحليلات يعمل
- ✅ لا توجد أخطاء 404 أو PGRST202
- ✅ جميع الدوال متاحة
- ✅ RLS policies تعمل

---

**🎯 النتيجة النهائية**: قاعدة البيانات تعمل بشكل مثالي مع جميع الوظائف!
