# نظام التحليل AI - دليل التشغيل

## نظرة عامة
هذا النظام يتكون من مكونين رئيسيين:
1. **AI Overview Analyzer** - يحلل URL واحد فقط
2. **Competitor Comparison** - يقارن بين URLين

## الفصل بين المكونين

### 1. AI Overview Analyzer
- **الوظيفة**: يحلل مقالة واحدة فقط
- **Webhook**: يستخدم `N8N_ANALYSIS_WEBHOOK`
- **الدالة**: `sendToN8nWebhook()`
- **المدخلات**: URL واحد فقط
- **المخرجات**: تحليل مفصل للمقالة

```typescript
// مثال على الاستخدام
const webhookResult = await sendToN8nWebhook({ 
  keyword: 'analysis', 
  userUrl: 'https://example.com/article' 
});
```

### 2. Competitor Comparison
- **الوظيفة**: يقارن بين مقالتين
- **Webhook**: يستخدم `COMPARISON_WEBHOOK`
- **الدالة**: `analyzeComparison()`
- **المدخلات**: URLين (user + competitor)
- **المخرجات**: مقارنة شاملة مع اقتراحات

```typescript
// مثال على الاستخدام
const response = await analyzeComparison({
  userUrl: 'https://myarticle.com',
  competitorUrl: 'https://competitor.com/article'
});
```

## Webhook Endpoints

### Single URL Analysis
```
N8N_ANALYSIS_WEBHOOK: https://n8n-n8n.lyie4i.easypanel.host/webhook/616dad33-b5c1-424d-b6c3-0cd04f044a49
```

### Comparison Analysis
```
COMPARISON_WEBHOOK: https://n8n-n8n.lyie4i.easypanel.host/webhook/616dad33-b5c1-424d-b6c3-0cd04f044a49
```

## كيفية عمل النظام

### عند تحليل مقالة واحدة:
1. المستخدم يدخل URL واحد
2. النظام يرسل طلب إلى `N8N_ANALYSIS_WEBHOOK`
3. AI يحلل المقالة ويعطي تقييمات منفصلة
4. النتائج تعرض للمستخدم

### عند مقارنة مقالتين:
1. المستخدم يدخل URLين
2. النظام يرسل طلب إلى `COMPARISON_WEBHOOK`
3. AI يحلل المقالتين معاً ويقارنهما
4. النتائج تعرض مقارنة شاملة

## الفوائد من هذا الفصل

✅ **تحليل دقيق**: كل مقالة تُحلل بشكل مستقل
✅ **مقارنة فعالة**: المقارنة تتم بين مقالتين محددتين
✅ **أداء أفضل**: لا يتم خلط التحليل الفردي مع المقارنة
✅ **صيانة أسهل**: كل مكون له وظيفة واضحة

## ملاحظات مهمة

- كل webhook endpoint يعمل بشكل مستقل
- لا يتم خلط البيانات بين التحليل الفردي والمقارنة
- كل مكون يستخدم الدالة المناسبة له
- النتائج محفوظة بشكل منفصل في قاعدة البيانات
