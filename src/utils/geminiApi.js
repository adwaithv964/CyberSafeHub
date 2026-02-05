// Helper function to pause execution (exponential backoff)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Import API URL from config
import { API_BASE_URL } from '../config';
import { auth } from '../config/firebase';

export const callGeminiAPI = async (messages, systemPrompt) => {
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

    const payload = {
        contents,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined
    };

    try {
        const user = auth.currentUser;
        if (!user) {
            return "Please sign in to use the Cyber Assistant.";
        }

        const token = await user.getIdToken();

        const response = await fetch(`${API_BASE_URL}/api/security/gemini`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
        }

        // Handle errors returned by backend
        let errorText = "Unknown error";
        try {
            const errorData = await response.json();
            errorText = errorData.error || errorData.message || response.statusText;
        } catch (e) {
            errorText = await response.text();
        }

        console.error(`Gemini API Error (${response.status}):`, errorText);

        if (response.status === 429) {
            return "I'm currently overloaded with requests. Please try again in a moment.";
        }

        return `Error: Unable to connect to assistant (${response.status}).`;

    } catch (error) {
        console.error("Network error calling Gemini Proxy:", error);
        return "Network error. Please ensure the backend server is running.";
    }
};
