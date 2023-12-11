const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const profileimage=new mongoose.Schema({
    userid:{
        type:ObjectId
    },
    profilepic:{
        type:String
    }
}) 
const imagecollection=mongoose.model('profileimages',profileimage)
module.exports=imagecollection
 