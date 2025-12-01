export const callGeminiAPI = async (prompt, systemPrompt) => {
    const apiKey = "AIzaSyApdYCUuxNl30TEqHNYGL3Hzq2TrMgZxic";
    if (!apiKey) return "API Key not found. Please create a .env file with your VITE_GEMINI_API_KEY.";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    if (systemPrompt) payload.systemInstruction = { parts: [{ text: systemPrompt }] };

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.status === 429) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }
            if (!response.ok) {
                console.error(`API call failed: ${response.status}`, await response.text());
                return "Sorry, the AI service might be temporarily unavailable.";
            }
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
            return "Sorry, I couldn't generate a valid response.";
        } catch (error) {
            console.error("Gemini API call error:", error);
            if (i < 4) {
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
            } else return "Sorry, there's a connection issue.";
        }
    }
    return "Sorry, the AI service is overloaded. Please try again later.";
};
