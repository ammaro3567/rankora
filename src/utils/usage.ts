// Local free-usage tracking per month (for non-authenticated users)

// Feature-flag to disable free-usage limits until further notice
const LIMITS_DISABLED = false;

const getMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const STORAGE_KEY = 'rankora_free_usage';

interface FreeUsageState {
  [monthKey: string]: number;
}

export const getFreeUsageCount = (): number => {
  if (LIMITS_DISABLED) return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const state = JSON.parse(raw) as FreeUsageState;
    const monthKey = getMonthKey();
    return state[monthKey] || 0;
  } catch {
    return 0;
  }
};

export const canUseFreeAnalysis = (limit = 2): boolean => {
  if (LIMITS_DISABLED) return true;
  return getFreeUsageCount() < limit;
};

export const consumeFreeAnalysis = (): void => {
  if (LIMITS_DISABLED) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const state: FreeUsageState = raw ? JSON.parse(raw) : {};
    const monthKey = getMonthKey();
    state[monthKey] = (state[monthKey] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
};


