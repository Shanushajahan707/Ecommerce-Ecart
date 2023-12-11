const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const returnschema=new mongoose.Schema({
    userid:{
        type:ObjectId
    },
    reason:{
        type:String
    },
    product:{
        type:String
    },
    amount:{
        type:Number
    }
}) 
const returnstructure=mongoose.model('returnorders',returnschema)
module.exports=returnstructure
