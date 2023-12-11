const mongoose = require('mongoose')
const loginschema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,   
    },
    password: {
        type: String,
    },
    isblocked: {
        type: Boolean
    },
    otp: {
        type: String,
    },
    pic:{
        type:String
    },
    wallet:{
        type:Number,
        default:0
    },
    referralcode:{
        type:String
    }
});

const users = mongoose.model('signups', loginschema);

module.exports = users;