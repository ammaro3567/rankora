export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessages = {
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection and try again.',
  WEBHOOK_ERROR: 'Analysis service is temporarily unavailable. Please try again in a few moments.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  LIMIT_REACHED: 'You have reached your monthly limit. Please upgrade your plan to continue.',
  SUPABASE_ERROR: 'Database error occurred. Please try again or contact support.',
  INVALID_URL: 'Please enter a valid URL starting with http:// or https://',
  PAYMENT_ERROR: 'Payment processing failed. Please try again or contact support.',
  PROJECT_LIMIT: 'You have reached your project limit. Upgrade to create more projects.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

export const handleError = (error: any): string => {
  // Network errors
  if (error.message === 'Failed to fetch' || error.code === 'NETWORK_ERROR') {
    return errorMessages.NETWORK_ERROR;
  }

  // Webhook errors
  if (error.message?.includes('webhook') || error.message?.includes('502') || error.message?.includes('503')) {
    return errorMessages.WEBHOOK_ERROR;
  }

  // Auth errors
  if (error.message?.includes('auth') || error.code === 'PGRST301') {
    return errorMessages.AUTH_ERROR;
  }

  // Supabase errors
  if (error.message?.includes('PGRST') || error.message?.includes('supabase')) {
    return errorMessages.SUPABASE_ERROR;
  }

  // Payment errors
  if (error.message?.includes('payment') || error.message?.includes('PayPal')) {
    return errorMessages.PAYMENT_ERROR;
  }

  // Custom app errors
  if (error instanceof AppError) {
    return error.message;
  }

  // Limit errors
  if (error.message?.includes('limit')) {
    return errorMessages.LIMIT_REACHED;
  }

  // Default
  return error.message || errorMessages.UNKNOWN_ERROR;
};
