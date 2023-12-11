const mongoose=require('mongoose')
const productofferschema=new mongoose.Schema({
    productname:{
        type:String,
    },
    price:{
        type:Number
    },
    offer:{
        type:Number
    }
}) 
const productofferstructure=mongoose.model('productoffer',productofferschema)
module.exports=productofferstructure
