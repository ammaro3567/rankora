// Webhook endpoints for AI analysis services
export const N8N_ANALYSIS_WEBHOOK = 'https://flow.sokt.io/func/scriDmS1IH9A';
export const USER_ARTICLE_WEBHOOK = 'https://flow.sokt.io/func/scriDmS1IH9A';
export const COMPARISON_WEBHOOK = 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511';
export const KEYWORD_COMPARISON_WEBHOOK = 'https://flow.sokt.io/func/scrifD4jQoUt';

// Helper function to use Netlify proxy when direct CSP fails
export const sendViaProxy = async (targetUrl: string, payload: any) => {
  try {
    console.log('🔄 Using proxy for external service');
    
    const response = await fetch('/.netlify/functions/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUrl,
        payload
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Proxy request successful');
    
    return { success: true, data: result.data };
  } catch (error) {
    console.error('💥 Proxy error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Proxy request failed' 
    };
  }
};

// Helper function to send data to n8n webhook for single URL analysis
export const sendToN8nWebhook = async (data: { keyword: string; userUrl: string }) => {
	try {
		console.log('🔗 Sending single URL analysis request');
		console.log('📤 Analysis payload prepared');
		
		let response = await fetch(N8N_ANALYSIS_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(data)
		});

		console.log('📥 Analysis response received');

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 Analysis error response received');
			// Fallback: try USER_ARTICLE_WEBHOOK with { url }
			console.log('↩️ Trying fallback endpoint');
			response = await fetch(USER_ARTICLE_WEBHOOK, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: data.userUrl })
			});
			if (!response.ok) {
				const err2 = await response.text().catch(() => '');
				throw new Error(`Analysis failed on both endpoints. Last status: ${response.status}`);
			}
		}

		// Try to get JSON response, fallback to text if needed
		let result;
		try {
			result = await response.json();
			console.log('✅ Analysis webhook successful (JSON)');
		} catch (jsonError) {
			console.log('⚠️ JSON parse failed, trying text fallback');
			const textResult = await response.text();
			try {
				result = JSON.parse(textResult);
				console.log('✅ Analysis webhook successful (parsed text)');
			} catch (parseError) {
				console.error('💥 Failed to parse response as JSON');
				throw new Error('Invalid JSON response from analysis service');
			}
		}
		
		// Handle case where result might be a JSON string
		let parsedResult = result;
		if (typeof result === 'string') {
			try {
				parsedResult = JSON.parse(result);
				console.log('🔄 Parsed JSON string result');
			} catch (parseError) {
				console.warn('⚠️ Failed to parse JSON string');
				parsedResult = result; // Use original if parsing fails
			}
		}
		
		// Validate that we have meaningful data before returning success
		if (!parsedResult || (Array.isArray(parsedResult) && parsedResult.length === 0)) {
			throw new Error('No analysis data received');
		}
		
		// Check if we have valid scores (at least one non-zero score)
		const hasValidScores = Array.isArray(parsedResult) 
			? parsedResult.some(item => item && typeof item === 'object' && hasValidAnalysisScores(item))
			: hasValidAnalysisScores(parsedResult);
			
		if (!hasValidScores) {
			throw new Error('Invalid analysis data: no valid scores received');
		}
		
		return { success: true, data: parsedResult };
	} catch (error) {
		console.error('💥 Analysis webhook error:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Analysis service error. Please try again.' 
		};
	}
};

// Helper function to validate analysis scores
const hasValidAnalysisScores = (data: any): boolean => {
	if (!data || typeof data !== 'object') return false;
	
	const requiredFields = ['readability', 'factuality', 'structure', 'qa_format', 'structured_data', 'authority'];
	const hasRequiredFields = requiredFields.every(field => field in data);
	
	if (!hasRequiredFields) return false;
	
	// Check if at least one score is greater than 0
	const hasValidScores = requiredFields.some(field => {
		const score = Number(data[field]);
		return !isNaN(score) && score > 0;
	});
	
	return hasValidScores;
};

// Helper function to analyze user article (single URL)
export const analyzeUserArticle = async (url: string) => {
	try {
		console.log('🔗 Analyzing single user article');
		let response = await fetch(USER_ARTICLE_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url, analysis_type: 'single_user' })
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 USER_ARTICLE_WEBHOOK error:', errorText);
			// Fallback to N8N_ANALYSIS_WEBHOOK signature
			console.log('↩️ Falling back to N8N_ANALYSIS_WEBHOOK');
			response = await fetch(N8N_ANALYSIS_WEBHOOK, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
				body: JSON.stringify({ keyword: 'analysis', userUrl: url })
			});
			if (!response.ok) {
				const err2 = await response.text().catch(() => '');
				throw new Error(`User article failed on both endpoints. Last status: ${response.status} - ${err2}`);
			}
		}

		const result = await response.json();
		console.log('✅ Single user article analysis successful');
		return { success: true, data: result };
	} catch (error) {
		console.error('Single user article analysis error:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

// Helper function to analyze competitor article (single URL)
export const analyzeCompetitorArticle = async (url: string) => {
	try {
		console.log('🔗 Analyzing single competitor article');
		let response = await fetch(USER_ARTICLE_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url })
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 COMPETITOR_ARTICLE_WEBHOOK error:', errorText);
			// Fallback to USER_ARTICLE_WEBHOOK
			console.log('↩️ Falling back to USER_ARTICLE_WEBHOOK');
			response = await fetch(USER_ARTICLE_WEBHOOK, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url })
			});
			if (!response.ok) {
				const err2 = await response.text().catch(() => '');
				throw new Error(`Competitor analysis failed on both endpoints. Last status: ${response.status} - ${err2}`);
			}
		}

		const result = await response.json();
		console.log('✅ Single competitor article analysis successful');
		return { success: true, data: result };
	} catch (error) {
		console.error('Single competitor article analysis error:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

// Combined comparison webhook: sends both URLs in a single request for comparison
export const analyzeComparison = async (params: { userUrl: string; competitorUrl: string }) => {
	const endpoint = COMPARISON_WEBHOOK || USER_ARTICLE_WEBHOOK;
	try {
		console.log('🔗 Sending comparison request');
		console.log('📤 Comparison payload prepared');
		
		let response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({ ...params, analysis_type: 'comparison' })
		});

		console.log('📥 Comparison response status:', response.status);

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 Comparison error response:', errorText);
			// Fallback: try USER_ARTICLE_WEBHOOK with both URLs (legacy flow)
			console.log('↩️ Falling back to USER_ARTICLE_WEBHOOK (legacy comparison flow)');
			response = await fetch(USER_ARTICLE_WEBHOOK, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userUrl: params.userUrl, competitorUrl: params.competitorUrl })
			});
			if (!response.ok) {
				const err2 = await response.text().catch(() => '');
				throw new Error(`Comparison failed on both endpoints. Last status: ${response.status} - ${err2}`);
			}
		}

		const result = await response.json();
		console.log('✅ Comparison successful');
		return { success: true, data: result };
	} catch (error) {
		console.error('💥 Comparison webhook error:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Comparison analysis failed. Please check your URLs and try again.' 
		};
	}
};

// Keyword-based comparison webhook: analyzes URL against specific keyword
export const analyzeKeywordComparison = async (params: { url: string; keyword: string }) => {
	const endpoint = KEYWORD_COMPARISON_WEBHOOK;
	try {
		console.log('🔗 Sending keyword comparison request');
		console.log('📤 Keyword comparison payload prepared');
		
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify({ ...params, analysis_type: 'keyword_comparison' })
		});

		console.log('📥 Keyword comparison response status:', response.status);

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 Keyword comparison error response:', errorText);
			throw new Error(`Keyword comparison failed. Status: ${response.status} - ${errorText}`);
		}

		// Try to get JSON response, fallback to text if needed
		let result;
		let cleanText = ''; // Declare cleanText in the outer scope
		try {
			result = await response.json();
			console.log('✅ Keyword comparison success (JSON):', result);
		} catch (jsonError) {
			console.log('⚠️ [KEYWORD_COMPARISON] JSON parse failed, trying text:', jsonError);
			const textResult = await response.text();
			console.log('📝 [KEYWORD_COMPARISON] Raw text response:', textResult);
			try {
				// Handle responses wrapped in markdown code blocks
				cleanText = textResult;
				
				// Remove ```json and ``` markers
				if (cleanText.includes('```json')) {
					cleanText = cleanText.replace(/```json\s*/, '').replace(/\s*```$/, '');
				} else if (cleanText.includes('```')) {
					cleanText = cleanText.replace(/```\s*/, '').replace(/\s*```$/, '');
				}
				
				// Clean up any remaining whitespace
				cleanText = cleanText.trim();
				
				console.log('🧹 [KEYWORD_COMPARISON] Cleaned text:', cleanText);
				
				result = JSON.parse(cleanText);
				console.log('✅ Keyword comparison success (parsed text):', result);
			} catch (parseError) {
				console.error('💥 [KEYWORD_COMPARISON] Failed to parse response as JSON:', parseError);
				console.error('💥 [KEYWORD_COMPARISON] Cleaned text was:', cleanText);
				throw new Error('Invalid JSON response from keyword comparison webhook');
			}
		}
		
		// Handle case where result might be a JSON string
		let parsedResult = result;
		if (typeof result === 'string') {
			try {
				parsedResult = JSON.parse(result);
				console.log('🔄 [KEYWORD_COMPARISON] Parsed JSON string result:', parsedResult);
			} catch (parseError) {
				console.warn('⚠️ [KEYWORD_COMPARISON] Failed to parse JSON string:', parseError);
				parsedResult = result; // Use original if parsing fails
			}
		}
		
		return { success: true, data: parsedResult };
	} catch (error) {
		console.error('💥 Keyword comparison webhook error:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Keyword comparison analysis failed. Please check your URL and keyword and try again.' 
		};
	}
};