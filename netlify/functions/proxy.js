// Netlify Function to proxy requests and bypass CSP restrictions
export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { targetUrl, payload } = JSON.parse(event.body);
    
    if (!targetUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing target URL' })
      };
    }

    // Validate that targetUrl is allowed (only flow.sokt.io)
    if (!targetUrl.includes('flow.sokt.io')) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid target URL' })
      };
    }

    console.log('🔄 Proxying request to external service');
    console.log('📤 Payload received');

    // Make the request to the target URL
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    console.log('📥 Response received');
    console.log('📥 Response processed');

    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      responseData = responseText;
    }

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: response.ok,
        status: response.status,
        data: responseData
      })
    };

  } catch (error) {
    console.error('💥 Proxy error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
}
