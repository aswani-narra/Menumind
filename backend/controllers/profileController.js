const asyncHandler = require('express-async-handler');
const Profile = require('../models/profileModel');

const getProfile = asyncHandler(async (req, res) => {
    try {
        const profile = await Profile.findOne();
        res.json(profile || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const setProfile = asyncHandler(async (req, res) => {
    try {
        const { cuisine, budget, numOfMeals, cookingTime } = req.body;
        const profile = await Profile.findOneAndUpdate(
            {},
            { cuisine, budget, numOfMeals, cookingTime },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Profile saved successfully', profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Failed to save profile' });
    }
})

module.exports = {
    getProfile,
    setProfile
}