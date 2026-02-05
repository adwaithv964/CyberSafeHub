// Helper function to pause execution (exponential backoff)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const callGeminiAPI = async (messages, systemPrompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return "API Key not found. Please create a .env file with your VITE_GEMINI_API_KEY.";

    const models = [
        "gemini-2.5-flash"
    ];

    // Format conversation history
    let contents = messages.map(msg => ({
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));

    // Gemini API requires the first message to be from the user
    if (contents.length > 0 && contents[0].role === 'model') {
        contents = contents.filter((_, index) => index > 0 || _.role === 'user');
        while (contents.length > 0 && contents[0].role === 'model') {
            contents.shift();
        }
    }

    const payload = { contents };
    if (systemPrompt) {
        payload.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    let retryDelay = 2000; // Start with 2 seconds delay

    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        console.log(`Attempting to use model: ${model}`);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
            }

            // If 429 (Too Many Requests), wait before trying next model
            if (response.status === 429) {
                console.warn(`Model ${model} failed with status 429 (Rate Limit). Waiting ${retryDelay / 1000}s before trying next model...`);

                // Only wait if there are more models to try
                if (i < models.length - 1) {
                    await delay(retryDelay);
                    retryDelay *= 2; // Exponential backoff: 2s -> 4s -> 8s
                }
                continue;
            }

            // If 404 (Not Found) or 503 (Service Unavailable), try next model
            if (response.status === 404 || response.status === 503) {
                console.warn(`Model ${model} failed with status ${response.status}. Switching to next model...`);
                continue;
            }

            // For other errors, log and stop (likely a bad request that will fail on all models)
            const errorText = await response.text();
            console.error(`API call failed on ${model}: ${response.status}`, errorText);

        } catch (error) {
            console.error(`Network error with model ${model}:`, error);
            // Continue to next model on network error
        }
    }

    return "All security lines are currently busy. Please try again later. (Rate Limit Exceeded)";
};
