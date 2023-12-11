const mongoose=require('mongoose')
const categoryschema=new mongoose.Schema({
    Category:{
        type:String,
        required:true
    }
}) 
const categorycollection=mongoose.model('categories',categoryschema)
module.exports=categorycollection
