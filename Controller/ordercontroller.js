const express = require('express');
const router = express.Router();
const cartcollection = require('../models/cart')
const addresscollection = require('../models/address');
const { cart } = require('./cartcontroller');
const ordercollection = require('../models/order')
const productcollection = require('../models/products')
const returncollection = require('../models/returnorders');
const users = require('../models/users');
//ordr page with total 
const orderpage = async (req, res) => {
    const id = req.session.userid
    const usercart = await cartcollection.find({ userid: req.session.userid });
    if (usercart.length > 0) {
        let totalPrice

        if (usercart && usercart.length > 0) {
            totalPrice = 0;
            for (let i = 0; i < usercart.length; i++) {
                totalPrice += usercart[i].quantity * usercart[i].price;
            }
        }
        const user = await users.findById(id);
        const walletAmount = user ? user.wallet : 0;
        const useraddress = await addresscollection.find({ userid: id })
        const totalQuantity = usercart.reduce((total, item) => total + item.quantity, 0);
        res.render('ordersummary', { usercart, useraddress, totalQuantity, totalPrice, walletAmount })
    } else {
        res.redirect('/cartitems')
    }
}
//ordre check out with status pgeand cart detaials with order receiving msg
const ordercheckout = async (req, res) => {
    try {
        const usercart = await cartcollection.find({ userid: req.session.userid });
        const today = new Date();
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const todaydate = today.toLocaleString('en-US', options);
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 4);
        const deliveryDateString = deliveryDate.toLocaleString('en-US', options);
        console.log('req dara', req.body);
        // Create an array to store cart items
        const productCollectionArray = [];
        for (const item of usercart) {
            const productData = {
                productid: item.productid,
                productName: item.product,
                price: item.price,
                quantity: item.quantity,
                status: "pending"
            };

            productCollectionArray.push(productData);

            // Update product stock
            await productcollection.updateOne(
                { _id: item.productid },
                { $inc: { Stock: -item.quantity } }
            );
        }

        const orderData = {
            userid: req.session.userid,
            username: usercart[0].username, // Assuming username is the same for all cart items
            productcollection: productCollectionArray,
            orderdate: todaydate,
            deliverydate: deliveryDateString,
            address: req.body.selectedaddress,
            paymentmode: req.body.paymentmode,
            discount: req.body.coupencode, // Assuming discount is sent in the request body

        };
        console.log('values are', orderData);
        // Create a single order document with an array of cart items
        await ordercollection.create(orderData);

        // Delete user's cart
        await cartcollection.deleteMany({ userid: req.session.userid });

        // console.log("insert");

        const popupHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Received</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f0f0f0;
                        font-family: Arial, sans-serif;
                    }
                    .popup-container {
                        background: #ffffff;
                        padding: 20px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                        text-align: center;
                        font-size: 16px;
                        color: #333;
                        max-width: 300px;
                    }
                    .tick {
                        font-size: 48px;
                        color: #00a000; /* Green color for the checkmark */
                    }
                </style>
            </head>
            <body>
                <div class="popup-container">
                    <div class="tick">&#10004;</div>
                    <p>Your order has been received!</p>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.href = '/userhome';
                    }, 3000);
                </script>
            </body>
            </html>
            
            `;
        // Send the HTML page as response
        res.type('text/html').send(popupHTML);
    } catch (error) {
        console.log(error);
        // Handle error response
        res.status(500).send('Internal Server Error');
    }
};


const walletorder = async (req, res) => {
    try {
        const userId = req.session.userid;
        const user = await users.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Access the selected address, payment mode, and total overall price from req.body
        const selectedAddress = req.body.selectedAddress;
        const paymentMode = req.body.paymentMode;
        const totalOverallPrice = req.body.totalOverallPrice;

        const usercart = await cartcollection.find({ userid: userId });
        const today = new Date();
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const todaydate = today.toLocaleString('en-US', options);
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 4);
        const deliveryDateString = deliveryDate.toLocaleString('en-US', options);

        let walletAmount = user.wallet;
        console.log('wallet amount before', walletAmount);

        const productCollectionArray = [];
        for (const item of usercart) {
            const productData = {
                productid: item.productid,
                productName: item.product,
                price: item.price,
                quantity: item.quantity,
                status: "pending"
            };

            productCollectionArray.push(productData);

            // Update product stock
            await productcollection.updateOne(
                { _id: item.productid },
                { $inc: { Stock: -item.quantity } }
            );
        }

        const orderData = {
            userid: req.session.userid,
            username: usercart[0].username, // Assuming username is the same for all cart items
            productcollection: productCollectionArray,
            orderdate: todaydate,
            deliverydate: deliveryDateString,
            address: selectedAddress,
            paymentmode: paymentMode,
            discount: req.body.coupencode, // Assuming discount is sent in the request body

        };
        console.log('values are', orderData);
        // Create a single order document with an array of cart items
        await ordercollection.create(orderData);

        // Delete user's cart
        await cartcollection.deleteMany({ userid: req.session.userid });
        // Update the user's wallet amount
        user.wallet = walletAmount;
        await user.save();

        // Delete user's cart entries
        await cartcollection.deleteMany({ userid: userId });

        // Popup HTML for order received
        const popupHTML = `
        <div class="popup-container">
            <div class="tick">&#10004;</div>
            <p>Your order has been received!</p>
        </div>
        <script>
            setTimeout(() => { 
                window.location.href = '/userhome';
            }, 3000);
        </script>
    `;

        res.json({ popupHTML });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



//cancel order get
const canceluserorder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userid=req.session.userid
        console.log('id is ', orderId);
        const newstatus ="Cancelled"
        const usercart = await cartcollection.find({ userid: req.session.userid });
        // Update the status in the ordercollection
        const updatedOrder = await ordercollection.findOneAndUpdate(
            { userid, 'productcollection._id': orderId },
            { $set: { 'productcollection.$.status': newstatus } },
            { new: true }
          );          
        console.log('Updated Order:', updatedOrder);
        // Update the stock in the productcollection
        for (const item of usercart) {
            await productcollection.updateOne(
                { _id: item.productid },
                { $inc: { Stock: item.quantity } }
            );
        }
        res.redirect('/orders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


// controllers.js
const returnorder = async (req, res) => {
    try {
        const id = req.params.id;
        console.log('id is', id);

        // Find the order by id
        const order = await ordercollection.findById(id);

        // Update the status i  n the ordercollection
        const newstatus="Returned"
        const updatedOrder = await ordercollection.findOneAndUpdate(
            { userid: req.session.userid, 'productcollection._id': id },
            { $set: { 'productcollection.$.status': newstatus } },
            { new: true }
        );
        console.log('Updated Order:', updatedOrder);

        // Assuming that the product details are in the first product of the collection
        const product = updatedOrder.productcollection[0];

        const data = {
            userid: req.session.userid,
            product: product.productName, // Adjust accordingly based on your schema
            amount: product.price * product.quantity
        };

        // Insert return data into the returncollection
        await returncollection.insertMany([data]);
        console.log('Return order inserted');

        // Update the user's wallet
        const user = await users.findById(req.session.userid);
        user.wallet += data.amount;
        await user.save();
        console.log('Wallet updated:', user);

        // Redirect to the orders page
        res.redirect('/orders');
    } catch (error) {
        console.error(error);

        // Send a JSON response indicating failure
        res.json({ success: false, message: 'Failed to handle return order' });
    }
};





module.exports = {
    orderpage,
    ordercheckout,
    canceluserorder,
    returnorder,
    walletorder
} 