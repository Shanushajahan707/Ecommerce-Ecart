const { ObjectId } = require('mongodb')
const mongoose=require('mongoose')
const orderSchema = new mongoose.Schema({
    userid: {
        type: ObjectId
    },
    username: {
        type: String
    },
    productcollection: [
        {
            productid: {
                type: ObjectId
            },
            productName: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            status:{
                type:String
            }
        }
    ],
    orderdate: {
        type: Date
    },
    deliverydate: {
        type: Date
    },
    address: {
        type: Object
    },
    paymentmode: {
        type: String
    },
    discount: {
        type: String,
    },
    
});

const orderstructure=mongoose.model('orders',orderSchema)
module.exports= orderstructure
