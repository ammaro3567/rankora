// Webhook configuration
export const WEBHOOKS = {
	// Instant AI Overview Analysis webhook - analyzes single URL independently
	N8N_ANALYSIS_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/616dad33-b5c1-424d-b6c3-0cd04f044a49',
	
	// User article analysis webhook - analyzes single URL independently  
	USER_ARTICLE_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511',
	
	// Competitor article analysis webhook - analyzes single URL independently
	COMPETITOR_ARTICLE_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511',

	// Separate comparison webhook - handles comparison logic separately
	// Restore to the endpoint that previously received comparison calls
	COMPARISON_WEBHOOK: 'https://n8n-n8n.lyie4i.easypanel.host/webhook/1ce6ce57-fc27-459c-b538-eedd345f2511'
};

// Helper function to send data to n8n webhook for single URL analysis
export const sendToN8nWebhook = async (data: { keyword: string; userUrl: string }) => {
	try {
		console.log('🔗 Sending single URL analysis to:', WEBHOOKS.N8N_ANALYSIS_WEBHOOK);
		console.log('📤 Single URL payload:', data);
		
		let response = await fetch(WEBHOOKS.N8N_ANALYSIS_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body: JSON.stringify(data)
		});

		console.log('📥 Single URL response status:', response.status);

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 Single URL webhook error response:', errorText);
			// Fallback: try USER_ARTICLE_WEBHOOK with { url }
			console.log('↩️ Falling back to USER_ARTICLE_WEBHOOK');
			response = await fetch(WEBHOOKS.USER_ARTICLE_WEBHOOK, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: data.userUrl })
			});
			if (!response.ok) {
				const err2 = await response.text().catch(() => '');
				throw new Error(`Single analysis failed on both endpoints. Last status: ${response.status} - ${err2}`);
			}
		}

		const result = await response.json();
		console.log('✅ Single URL webhook success:', result);
		return { success: true, data: result };
	} catch (error) {
		console.error('💥 Single URL webhook error:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown webhook error. Please check your connection and try again.' 
		};
	}
};

// Helper function to analyze user article (single URL)
export const analyzeUserArticle = async (url: string) => {
	try {
		console.log('🔗 Analyzing single user article:', url);
		let response = await fetch(WEBHOOKS.USER_ARTICLE_WEBHOOK, {
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
			response = await fetch(WEBHOOKS.N8N_ANALYSIS_WEBHOOK, {
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
		console.log('✅ Single user article analysis success:', result);
		return { success: true, data: result };
	} catch (error) {
		console.error('Single user article analysis error:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

// Helper function to analyze competitor article (single URL)
export const analyzeCompetitorArticle = async (url: string) => {
	try {
		console.log('🔗 Analyzing single competitor article:', url);
		let response = await fetch(WEBHOOKS.COMPETITOR_ARTICLE_WEBHOOK, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url, analysis_type: 'single_competitor' })
		});

		if (!response.ok) {
			const errorText = await response.text().catch(() => '');
			console.warn('📛 COMPETITOR_ARTICLE_WEBHOOK error:', errorText);
			// Fallback to USER_ARTICLE_WEBHOOK
			console.log('↩️ Falling back to USER_ARTICLE_WEBHOOK');
			response = await fetch(WEBHOOKS.USER_ARTICLE_WEBHOOK, {
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
		console.log('✅ Single competitor article analysis success:', result);
		return { success: true, data: result };
	} catch (error) {
		console.error('Single competitor article analysis error:', error);
		return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
	}
};

// Combined comparison webhook: sends both URLs in a single request for comparison
export const analyzeComparison = async (params: { userUrl: string; competitorUrl: string }) => {
	const endpoint = WEBHOOKS.COMPARISON_WEBHOOK || WEBHOOKS.USER_ARTICLE_WEBHOOK;
	try {
		console.log('🔗 Sending comparison request to:', endpoint);
		console.log('📤 Comparison payload:', params);
		
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
			response = await fetch(WEBHOOKS.USER_ARTICLE_WEBHOOK, {
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