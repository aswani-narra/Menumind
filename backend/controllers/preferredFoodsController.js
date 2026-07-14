// generate preferred foods based on cuisine, budget, dietary cost, # meals, cooking time, 
// type of good (breakfast, lunch, dinner)
const asyncHandler = require('express-async-handler')
const Profile = require('../models/profileModel');
const { getGeminiModel, cleanAndParseJSON } = require('../config/geminiHelper');

const getProfile = async () => {
    try {
        const profile = await Profile.find();
        return profile;
    } catch (error) {
        return null;
    }
};

const recommendMeals = asyncHandler(async (req, res) => {
    try {
        const model = getGeminiModel(); 
        const json_schema = `[
            {
                "Meal": {
                    "meal name": "Example Meal Name 1",
                    "ingredients": ["Ingredient 1", "Ingredient 2"]
                }
            }
        ]`;
        const user_pref = await getProfile();
        const prompt = `Using the dietary preferences below, suggest a list of 10 meals for the next week. Put the list of meals in a JSON
        format as described by the schema below. \n` + json_schema + `\n Do not return anything except the
        JSON. Here are the user preferences: \n` + JSON.stringify(user_pref);
        // console.log("user pref: \n" + user_pref);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanAndParseJSON(response.text());
        res.status(200).json(text)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Failed to create meals' });
    }
})

module.exports = {
    recommendMeals
}