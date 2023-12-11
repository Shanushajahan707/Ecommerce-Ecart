const express = require('express');
const users = require('../models/users');
const { render, router } = require('../app');
const cartcollection = require('../models/cart')
const productcollection = require('../models/products')
const addresscollection=require('../models/address')
let id

//cart detiasl rendr
const cart = async (req, res) => {
    try {
        let productname;
        const id = req.session.userid;

        const usercart = await cartcollection.find({ userid: id });
        for (const item of usercart) {
            productname = item.product;
        }

        const productstock = await productcollection.findOne({ Productname: productname }, { Stock: 1, _id: 0 });
        const useraddress = await addresscollection.find({ userid: id });
        const totalQuantity = usercart.reduce((total, item) => total + item.quantity, 0);

        // Fetch the user's wallet amount
        const user = await users.findById(id);
        const walletAmount = user ? user.wallet : 0; // Default to 0 if user not found

        res.render('cart', { usercart, useraddress, totalQuantity, walletAmount });
    } catch (error) {
        console.log(error);
    }
};

//add cart with auto quatity increase if the user add same prodcut again
const addcart = async (req, res) => {
        try {
            const productid = req.params.id;
            const cartItem = await cartcollection.find({ userid: req.session.userid });
            let productFound = false;
            for (const item of cartItem) {
                if (item.productid == productid) {
                  
                    productFound = true;
                    await cartcollection.updateOne(
                        { _id: item._id },
                        { 
                            $inc: { 
                                quantity: 1
                            }
                        }   
                    );
                    break;
                }
            }
            if (!productFound) {
                const product = await productcollection.findById(productid);
                const username=await users.findById({_id:req.session.userid})
                // console.log('usermame is '+username.username);
                const cartData = {
                    userid: req.session.userid,
                    username:username.username,
                    productid: productid,
                    product: product.Productname,
                    price: product.offer && product.offer.newPrice ? product.offer.newPrice : product.Price,
                    quantity: 1,
                    image: product.image[0]
                };
                await cartcollection.insertMany([cartData]);
            }
    
            res.redirect('/userhome');
        } catch (error) {
            console.log(error);
        }
};
//remove cart item
const removeitem = async (req, res) => {
    try {
            const id = req.params.id;
            const userid=req.session.userid
            // const cartcount=cartcollection.find({userid})
            // const count=(await cartcount).length
            await cartcollection.findByIdAndDelete(id);
            // res.status(200).json({ success: true }); 
            // res.json({ success: true });
            res.redirect('/cartitems')
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}
//increse the quatity wtih btn
const inccart = async (req, res) => {
    try {
        const pid = req.params.id;
        console.log("id is", pid);

        // Find the cart item
        const item = await cartcollection.findOne({ _id: pid });

        // Check if the item exists
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // Get product information
        const productId = item.productid;
        const productStock = (await productcollection.findById(productId)).Stock;

        // Check if the new quantity exceeds the available stock
        const newQuantity = item.quantity + 1;
        if (newQuantity > productStock) {
            return res.status(400).json({
                success: false,
                message: 'Quantity exceeds stock.'
            });
        } else {
            // Calculate new price
            const newPrice = item.price * newQuantity;

            // Update the quantity in the database
            const updateResult = await cartcollection.updateOne(
                { _id: pid },
                { $set: { quantity: newQuantity } }
            );

            if (updateResult.modifiedCount === 1) {
                // The update was successful
                // Calculate the overall total price
                const overallTotalPrice = await calculateOverallTotalPrice();

                // Send the response including the newOverallTotalPrice
                return res.status(200).json({
                    success: true,
                    newQuantity,
                    newPrice,
                    newOverallTotalPrice: overallTotalPrice,
                    message: 'Quantity increased successfully'
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update quantity in the database'
                });
            }
        }
    } catch (error) {
        console.error('Error in inccart:', error);

        // Handle specific errors
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid cart item ID'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};



const deccart = async (req, res) => {
    try {
        const pid = req.params.id;
        const item = await cartcollection.findOne({ _id: pid });
        const newQuantity = Math.max(item.quantity - 1, 1);
        const newPrice = item.price * newQuantity;

        // Update the quantity in the database
        await cartcollection.updateOne(
            { _id: pid },
            { $set: { quantity: newQuantity } }
        );

        // Calculate the overall total price (sum of prices for all items in the cart)
        const overallTotalPrice = await calculateOverallTotalPrice();

        // Send the response including the newOverallTotalPrice
        res.status(200).json({
            success: true,
            newQuantity,
            newPrice,
            newOverallTotalPrice: overallTotalPrice,
            message: 'Quantity decreased successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error decreasing quantity',
            error: error.message
        });
    }
};

// Function to calculate overall total price
const calculateOverallTotalPrice = async () => {
    const cartItems = await cartcollection.find({});
    let overallTotalPrice = 0;

    // Sum up the prices for all items in the cart
    for (const item of cartItems) {
        const itemPrice = parseFloat(item.price); // Convert item.price to a number
        overallTotalPrice += item.quantity * itemPrice;
    }

    return overallTotalPrice;
};




module.exports = {
    cart,
    addcart,
    removeitem,
    inccart,
    deccart

}