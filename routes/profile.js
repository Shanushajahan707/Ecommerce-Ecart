const express = require('express');
const router = express.Router();
const profilecontroller = require('../Controller/profilecontroller')
const bodyParser = require('body-parser')
// const morgan = require('morgan')
const nocache = require('nocache')
const session = require('express-session');
const server = require('../server')
const app = express()
const users = require('../models/users')
const product = require('../models/products')
const path = require('path')
//multer
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/profileimages')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })

//multer
//middi,e session and blocked

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
 

 
//load user profile page 
router.get('/userprofile', checkSessionAndBlocked, profilecontroller.profileload)
//render add address page
router.get('/addaddress', checkSessionAndBlocked, profilecontroller.addaddress)
//add adress post request
router.post('/addaddress', checkSessionAndBlocked, profilecontroller.addaddresspost)
//render user address page 
router.get('/viewaddress', checkSessionAndBlocked, profilecontroller.viewaddresss)
//render the edit address page 
router.get('/addressedit/:id', checkSessionAndBlocked, profilecontroller.updateaddress)
//post for the address edit
router.post('/addresseditpost/:id', checkSessionAndBlocked, profilecontroller.updateaddresspost)
//route for the delete the address
router.get('/deleteaddress/:id', checkSessionAndBlocked, profilecontroller.deleteaddress)
//render teh orders
router.get('/orders', checkSessionAndBlocked, profilecontroller.vieworders)
//update profile render
router.get('/updateprofile/:id', checkSessionAndBlocked, profilecontroller.updateprofile)
//update profile post request
router.post('/updateprofile/:id', checkSessionAndBlocked, upload.single('img'), profilecontroller.updateprofilepost)
//edit password render
router.get('/editpass', checkSessionAndBlocked, profilecontroller.changepass)
//edit password post request
router.post('/editpassword', checkSessionAndBlocked, profilecontroller.changepasspost)
// router.get('/returnorders',profilecontroller.orderhistory)
router.get('/viewordermore/:id/:productid',checkSessionAndBlocked,profilecontroller.viewordermore)

router.get('/invoice/:id/:prid',checkSessionAndBlocked,profilecontroller.invoice)
  

module.exports = router