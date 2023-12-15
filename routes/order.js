const express = require('express');
const router = express.Router();
const ordercontroller = require('../Controller/ordercontroller');
const { get } = require('mongoose');

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
 
//order summary page render
router.get('/ordersummary', ordercontroller.orderpage)
//order order checkout page
router.post('/orderdata', ordercontroller.ordercheckout)
router.post('/placeOrderWithWallet',ordercontroller.walletorder)
//cancel order 
router.get('/cancelorder/:id', ordercontroller.canceluserorder)

router.get('/submit-return/:id',ordercontroller.returnorder)
router.get('/addtowishlist/:id',ordercontroller.addToWishlist)
router.get('/removewishlist/:id',ordercontroller.removeFromWishlist)
router.get('/wishlistpage',ordercontroller.wishlistpage)
router.get('/addtocartfromwishlist/:id',ordercontroller.addcartformwishlist)




module.exports = router