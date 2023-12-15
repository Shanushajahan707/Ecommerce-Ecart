const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')

const wishlist=new mongoose.Schema({
    userid:{
        type:ObjectId
    },
    user:{
        type:String
    },
    productid:{
        type:ObjectId
    },
    product:{
        type:String
    },
    price:{
        type:Number
    },
    image:{
        type:String
    }
})
const wishliststructure=new mongoose.model('wishlist',wishlist)

module.exports=wishliststructure