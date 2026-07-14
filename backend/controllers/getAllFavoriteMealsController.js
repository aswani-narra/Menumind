const asyncHandler = require('express-async-handler');
const Scraper = require('images-scraper');

const Meal = require('../models/mealModel');
const google = new Scraper({
    puppeteer: {
        headless: true,
    },
})

const getAllFavoriteMeals = asyncHandler(async (req, res) => {
    try {
        const meal = await Meal.find({});
        res.json(meal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getImageForMeal = asyncHandler(async (req, res) => {
    const meal_name = req.body.meal_name;
    try {
        const results = await google.scrape(meal_name, 1);
        if (results && results.length > 0 && results[0].url) {
            return res.json({ url: results[0].url });
        }
    } catch (error) {
        console.warn(`Image scraping failed for "${meal_name}": ${error.message}. Using fallback image.`);
    }
    res.json({ url: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60" });
});

module.exports = {
    getAllFavoriteMeals,
    getImageForMeal
}