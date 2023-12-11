const express = require('express');
const router = express.Router();
const paymentorder=require('../Controller/paymentcontroller')

router.post('/create/orderId',paymentorder.orderpayment)
module.exports=router