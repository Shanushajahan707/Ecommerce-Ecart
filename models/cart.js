const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')

const cartschema = new mongoose.Schema({
    userid: {
        type: ObjectId 
    },
    username:{
        type:String
    },
    productid:{
        type:ObjectId
    },
    product: {
        type: String
       
    },
    price: {
        type: Number
       
    },
    quantity: {
        type: Number
        
    },
    image:[String]

})
const cartstructure = mongoose.model('cartdetials', cartschema)
module.exports = cartstructure