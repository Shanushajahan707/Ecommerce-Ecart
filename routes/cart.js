const express = require('express');
const router = express.Router();
// const morgan = require('morgan')
const nocache = require('nocache')
const session = require('express-session');
const server = require('../server')
const path = require('path')
const users = require('../models/users')
const product = require('../models/products')
const cart = require('../models/cart')
const cartcontroller = require('../Controller/cartcontroller')

const checkSessionAndBlocked = async (req, res, next) => {
  if (req.session.userid) {
    const userDetials = await users.findOne({ _id: req.session.userid });
    if (!userDetials.isblocked) {
      // User is not blocked, proceed to the next middleware or route handler
      next();
    } else {
      // User is blocked, destroy the session and redirect
      req.session.destroy((err) => {
        if (err) {
          console.log("Error destroying session: ", err);
          res.redirect("/");
        } else {
          res.redirect("/");
        }
      });
    }
  } else {
    // No userId in session, redirect to the default page
    res.redirect("/");
  }
};

//cartitems page 
router.get('/cartitems',checkSessionAndBlocked, cartcontroller.cart)
//add cartpage 
router.get('/addcart/:id',checkSessionAndBlocked, cartcontroller.addcart)
//remove cart items
// Assuming you are using Express.js
router.get('/removeitem/:id', checkSessionAndBlocked,cartcontroller.removeitem);

//increase cart quatity
router.post('/increaseq/:id', checkSessionAndBlocked,cartcontroller.inccart)
//decrease cart quantity
router.post('/decreaseq/:id',checkSessionAndBlocked, cartcontroller.deccart)


module.exports = router