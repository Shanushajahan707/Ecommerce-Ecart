const mongoose = require('mongoose');
const category=require('../models/category')
const ProductSchema = new mongoose.Schema({
    Productname: {
        type: String,
       
    },
    Category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: category,
    },
    Price: {
        type: Number,
       
    },
    Rating: {
        type: Number,
       
    },
    Stock:{
        type:Number
    }, 
    Model: {
        type: String,
       
    },
    Description: {
        type: String,
       
    },
    image:[String],
    isList:{
        type:Boolean,
        default:true
    },
    offer:{
        type:Object
    }
});

const Product = mongoose.model('products', ProductSchema);

module.exports = Product;
