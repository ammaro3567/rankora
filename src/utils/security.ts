/**
 * Security utilities to prevent sensitive data exposure
 */

// Environment variables for webhook URLs (should be set in production)
const WEBHOOK_URLS = {
  N8N_ANALYSIS: process.env.NODE_ENV === 'production' 
    ? process.env.VITE_N8N_ANALYSIS_WEBHOOK 
    : 'https://flow.sokt.io/func/scriDmS1IH9A',
  KEYWORD_COMPARISON: process.env.NODE_ENV === 'production'
    ? process.env.VITE_KEYWORD_COMPARISON_WEBHOOK
    : 'https://flow.sokt.io/func/scrifD4jQoUt'
};

/**
 * Sanitize console logs to prevent sensitive data exposure
 */
export const secureLog = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data);
    } else {
      console.log(message);
    }
  },
  
  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  },
  
  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error);
    } else {
      console.error(message);
    }
  }
};

/**
 * Validate webhook responses to prevent counting invalid data
 */
export const validateWebhookResponse = {
  analysis: (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Check if we have the required fields
    const requiredFields = ['readability', 'factuality', 'structure', 'qa_format', 'structured_data', 'authority'];
    const hasRequiredFields = requiredFields.every(field => field in data);
    
    if (!hasRequiredFields) return false;
    
    // Check if at least one score is greater than 0
    const hasValidScores = requiredFields.some(field => {
      const score = Number(data[field]);
      return !isNaN(score) && score > 0;
    });
    
    return hasValidScores;
  },
  
  keywordAnalysis: (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Check if we have at least one meaningful result
    const hasMissingTopics = Array.isArray(data.missing_topics) && data.missing_topics.length > 0;
    const hasMissingEntities = Array.isArray(data.missing_entities) && data.missing_entities.length > 0;
    const hasContentGaps = Array.isArray(data.content_gaps) && data.content_gaps.length > 0;
    const hasSeoOpportunities = Array.isArray(data.seo_opportunities) && data.seo_opportunities.length > 0;
    
    // At least one category should have meaningful data
    return hasMissingTopics || hasMissingEntities || hasContentGaps || hasSeoOpportunities;
  },
  
  comparison: (data: any): boolean => {
    if (!data || typeof data !== 'object') return false;
    
    // Check if we have valid scores for both articles
    if (Array.isArray(data)) {
      return data.length >= 2 && data.every(item => item && validateWebhookResponse.analysis(item));
    }
    
    // Check object format
    return data.user && data.competitor && 
           validateWebhookResponse.analysis(data.user) && 
           validateWebhookResponse.analysis(data.competitor);
  }
};

/**
 * Sanitize data before logging to prevent sensitive information exposure
 */
export const sanitizeForLogging = (data: any): any => {
  if (typeof data === 'string') {
    // Remove URLs and sensitive patterns
    return data.replace(/https?:\/\/[^\s]+/g, '[URL]')
               .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
               .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('webhook')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLogging(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Get webhook URL safely without exposing it in logs
 */
export const getWebhookUrl = (type: 'analysis' | 'keyword'): string => {
  switch (type) {
    case 'analysis':
      return WEBHOOK_URLS.N8N_ANALYSIS || '';
    case 'keyword':
      return WEBHOOK_URLS.KEYWORD_COMPARISON || '';
    default:
      return '';
  }
};
