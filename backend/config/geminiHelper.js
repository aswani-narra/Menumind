const { GoogleGenerativeAI } = require("@google/generative-ai");

const cleanAndParseJSON = (text) => {
    try {
        let cleanText = text.trim();
        // Check if response is wrapped in markdown code blocks
        if (cleanText.startsWith("```")) {
            const firstNewline = cleanText.indexOf("\n");
            const lastBackticks = cleanText.lastIndexOf("```");
            if (firstNewline !== -1 && lastBackticks !== -1 && lastBackticks > firstNewline) {
                cleanText = cleanText.substring(firstNewline, lastBackticks).trim();
            } else {
                cleanText = cleanText.replace(/```(json)?/gi, "").trim();
            }
        }
        return JSON.parse(cleanText);
    } catch (error) {
        console.error("JSON parsing error on text:\n", text);
        try {
            const basicClean = text.replace(/```[a-z]*/gi, "").replace(/```/g, "").trim();
            return JSON.parse(basicClean);
        } catch (innerError) {
            throw new Error(`Failed to parse Gemini response as JSON: ${error.message}`);
        }
    }
};

const getGeminiModel = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set. Please configure it in your .env file.");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

module.exports = {
    cleanAndParseJSON,
    getGeminiModel
};
