const express = require('express');
const coupencollection = require('../models/coupen')
const usercollection = require('../models/users')

const addcoupen = (req, res) => {
    res.render('adminaddcoupen')
}
const addcoupenpost = async (req, res) => {
    console.log(req.body);
 
    try {
        const data = {
            coupencode: req.body.couponCode,
            discount: req.body.discount,
            expiredate: formatDate(req.body.expireDate),
            purchaseamount: req.body.purchaseamount
        }
        await coupencollection.insertMany([data])
            .then((result) => {
                // console.log('insereted the coupen', result);
                res.redirect('/admin/salesreport')
            })

    } catch (error) {
        console.log(error);
    }
    function formatDate(inputDate) {
        const date = new Date(inputDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
}
const viewccoupen = async (req, res) => {
    try {
        const coupens = await coupencollection.find()
        res.render('adminseecoupen', { coupens })
    } catch (error) {
        console.log(error);
    }
}
const coupencheck = async (req, res) => {
    try {
        let currentDate = new Date();
        const coupencode = req.body.coupencode;

        if (req.session.coupen && coupencode.toLowerCase() === req.session.coupen.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code has already been applied.',
            });
        }

        const coupen = await coupencollection.findOne({ coupencode: { $regex: new RegExp(coupencode, 'i') } });
        // console.log(coupen && coupen.expiredate > currentDate)

        if (coupen && coupen.expiredate > currentDate && coupencode.toLowerCase() === coupen.coupencode.toLowerCase()) {
            
            const discountAmount = coupen.discount;
            const amountLimit = coupen.purchaseamount;
            req.session.coupen = coupen.coupencode;

            return res.json({ success: true, discount: discountAmount, amount: amountLimit });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon code or expired.',
            });
        }
    } catch (error) {
        console.error('Error in coupencheck:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during coupon validation.',
        });
    }
};



module.exports = {
    addcoupen,
    addcoupenpost,
    viewccoupen,
    coupencheck
}