import { supabase, getUserSubscriptionInfo, getMonthlyUsageCounts, listProjects } from '../lib/supabase';
import { evaluateAnalysisAllowance } from './limits';

const DIAG_ENABLED = import.meta.env.VITE_DEBUG_MODE === 'true';

export async function diagnoseSystemIssues(user: any) {
  if (!DIAG_ENABLED) return;
  console.groupCollapsed('🔍 Rankora System Diagnostics');
  
  try {
    console.log('👤 User present');

    // التحقق من إعداد Clerk
    console.log('🔐 Clerk loaded');

    // Skip calling set_clerk_user_id RPC to avoid 404 noise; we rely on RPCs that accept clerk_user_id explicitly

    // جلب معلومات الاشتراك عبر wrapper (يؤمن set_clerk_user_id واسم البراميتر الصحيح)
    let subscriptionData = null;
    try {
      subscriptionData = await getUserSubscriptionInfo(user.id);
      console.log('💳 Subscription loaded');
    } catch (err) {
      console.error('❌ Subscription Error:', err);
    }

    // التحقق من حدود الاستخدام
    const limitCheck = await evaluateAnalysisAllowance(user.id);
    console.log('📊 Usage limits checked');

    // فحص المشاريع باستخدام wrapper الذي يضبط RLS قبل الاستعلام
    try {
      await listProjects();
      console.log('🗂️ Projects loaded');
    } catch (projectsError) {
      console.error('❌ Projects Error:', projectsError);
    }

    // فحص التحليلات (نستعمل set_clerk_user_id أعلاه لذلك يمكن الاستعلام مباشرة)
    try {
      const { error: analysesError } = await supabase
        .from('user_analyses')
        .select('*')
        .eq('clerk_user_id', user.id);
      console.log('📈 Analyses loaded');
      if (analysesError) console.error('❌ Analyses Error:', analysesError);
    } catch (err) {
      console.error('❌ Analyses Error:', err);
    }

    // جلب عدد التحليلات والمقارنات
    // جلب استخدامات الشهر (باستخدام wrapper مع تمرير المعرف)
    try {
      // getMonthlyUsageCounts uses the current RLS context or internal clerk id
      const usageCounts = await getMonthlyUsageCounts();
      console.log('📊 Monthly Usage:', usageCounts);
    } catch (usageError) {
      console.error('❌ Usage Error:', usageError);
    }

  } catch (error) {
    console.error('🚨 Comprehensive Diagnosis Failed:', error);
  } finally {
    console.groupEnd();
  }
}

// تصدير دالة للاستخدام في مكونات React
export const runSystemDiagnostics = (user: any) => {
  if (user) {
    diagnoseSystemIssues(user);
  } else {
    console.warn('🚫 No user found for diagnostics');
  }
};
