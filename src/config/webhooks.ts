// Webhook configuration
export const WEBHOOKS = {
  // Instant AI Overview Analysis webhook
  N8N_ANALYSIS_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/616dad33-b5c1-424d-b6c3-0cd04f044a49',
  
  // User article analysis webhook
  USER_ARTICLE_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511',
  
  // Competitor article analysis webhook (same as user for comparison)
  COMPETITOR_ARTICLE_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511',

  // Combined comparison webhook (receives both URLs in one request)
  COMPARISON_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511'
};

// Helper function to send data to n8n webhook
export const sendToN8nWebhook = async (data: { keyword: string; userUrl: string }) => {
  try {
    console.log('🔗 Sending webhook request to:', WEBHOOKS.N8N_ANALYSIS_WEBHOOK);
    console.log('📤 Payload:', data);
    
    const response = await fetch(WEBHOOKS.N8N_ANALYSIS_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
      timeout: 30000, // 30 second timeout
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📛 Webhook error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Webhook success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('💥 Webhook error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown webhook error. Please check your connection and try again.' 
    };
  }
};

// Helper function to analyze user article
export const analyzeUserArticle = async (url: string) => {
  try {
    const response = await fetch(WEBHOOKS.USER_ARTICLE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('User article analysis error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to analyze competitor article
export const analyzeCompetitorArticle = async (url: string) => {
  try {
    const response = await fetch(WEBHOOKS.COMPETITOR_ARTICLE_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Competitor article analysis error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Combined comparison webhook: sends both URLs in a single request
export const analyzeComparison = async (params: { userUrl: string; competitorUrl: string }) => {
  const endpoint = WEBHOOKS.COMPARISON_WEBHOOK || WEBHOOKS.USER_ARTICLE_WEBHOOK;
  try {
    console.log('🔗 Sending comparison request to:', endpoint);
    console.log('📤 Comparison payload:', params);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
      timeout: 45000, // 45 second timeout for comparison (longer process)
    });

    console.log('📥 Comparison response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('📛 Comparison error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Comparison success:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('💥 Comparison webhook error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Comparison analysis failed. Please check your URLs and try again.' 
    };
  }
};