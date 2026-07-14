const asyncHandler = require('express-async-handler')
const Ingredients = require('../models/ingredientModel');
const Profile = require('../models/profileModel');
const { getGeminiModel, cleanAndParseJSON } = require('../config/geminiHelper');

const listIngredients = async () => {
    try {
        const documents = await Ingredients.find({});
        // Convert documents to JSON
        const jsonResult = JSON.stringify(documents, null, 2);
        return jsonResult; // Return JSON data
    } catch (error) {
        console.error('Error querying MongoDB:', error);
        return null;
    }
};

const get_dietary_restrictions = async () => {
  try {
    const profile = await Profile.findOne();
    return (profile && profile.dietaryRestrictions) ? profile.dietaryRestrictions : "none";
  } catch (error) {
    console.error('Error fetching dietary restrictions:', error);
    return "none";
  }
}

const makeMeals = asyncHandler(async (req, res) => {
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
        
        const ingr_json = await listIngredients();
        console.log("ingr_json:\n" + ingr_json);
        if (ingr_json === null) {
            console.error('Error connecting to MongoDB:');
            return res.status(500).json({ message: 'Failed to fetch ingredients from database' });
        }
        const diet_restr = await get_dietary_restrictions();
        const prompt = `Using the JSON list of ingredients provided below, provide a meal plan 
        based on the name category. Make sure to consider the expiration date (labeled end) and prioritize 
        Only use the list of ingredients provided to you below as the context, and do not add any ingredients.
        Also keep in mind the dietary restrictions mentioned below. Try not to add any
        ingredients that expire earlier. Also consider the quantity of each food item. Once you've used an ingredient once, don't use it for another meal. 
        ingredients, but if you do, include a 'not provided' in the string. Do not provide meals that only use ingredients that are not listed below. 
        Only return the response in the JSON schema format ` + json_schema + `.\n` + `Ingredients:\n` + ingr_json + `Dietary Restrictions:\n` + diet_restr
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = cleanAndParseJSON(response.text());

        res.status(200).json(text)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Failed to create meals' });
    }
})

const getIngredientsList = asyncHandler(async (req, res) => {
    try {
        const documents = await Ingredients.find({});
        // Convert documents to JSON
        res.status(200).json(documents) // Return JSON data
    } catch (error) {
        console.error('Error querying MongoDB:', error);
        res.status(400).json({ message: error.message || 'Failed to fetch ingredients' });
    }
})

const addIngredient = asyncHandler(async (req, res) => {
    try {
        const { name, quantity, start, end } = req.body;
        if (!name || !quantity || !start || !end) {
            return res.status(400).json({ message: 'All fields (name, quantity, start, end) are required.' });
        }
        const numericQuantity = parseInt(quantity, 10);
        if (isNaN(numericQuantity)) {
            return res.status(400).json({ message: 'Quantity must be a valid number.' });
        }
        const ingredient = await Ingredients.create({
            name,
            quantity: numericQuantity,
            start,
            end
        });
        res.status(201).json(ingredient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Failed to add ingredient' });
    }
})

module.exports = {
    makeMeals,
    getIngredientsList,
    addIngredient
}