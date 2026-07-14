const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    cuisine: {
      type: String,
      default: "", 
    },
    budget: {
        type: String,
        default: "", 
    },
    numOfMeals: {
        type: Number,
        default: 7, 
    },
    cookingTime: {
        type: String,
        default: "", 
    },
    dietaryRestrictions: {
        type: String,
        default: "",
    }
  }, {collection: "profile"});

module.exports = mongoose.model('Profile', profileSchema);