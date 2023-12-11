const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
// const Razorpay=require('razorpay')
// const morgan = require('morgan')
const nocache = require('nocache')
const session = require('express-session');
const app = express()
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
// router.use(morgan('tiny'))
app.use(express.urlencoded({ extended: false }))
const usercontroller = require('../Controller/usercontroller')
const users = require('../models/users')
const product = require('../models/products')
const server = require('../server')
require('dotenv').config();

app.use(nocache())
/* GET home page. */

router.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true,
  // cookie: { secure: false, maxAge: 600000000 }
}))
///


///
//custom middile session & blocked 
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
//



//root page render
router.get('/', usercontroller.homePage)
//home page without account 
router.get('/Ecart', usercontroller.ecarthome)
//after login user home
router.get('/userhome',checkSessionAndBlocked, usercontroller.userHome)
//user login page 
router.get('/userlogin', usercontroller.loginPage);
//login post request 
router.post('/userpost', usercontroller.loginpost)
//user signup page 
router.get('/signup', usercontroller.signup)
//signup post  request
router.post('/usersignup', usercontroller.signuppost)
//otp page render
router.get('/otp', usercontroller.otp)
//otp post requst
router.post('/otppost', usercontroller.otppost)
//resend the otp
router.get('/resend', usercontroller.resend)
//see the product withoout account usr 
router.get('/seeproduct/:id', usercontroller.seeproductget)
// see the product with login user
router.get('/seeproductwithacc/:id', checkSessionAndBlocked, usercontroller.seeproductgetwithacc)
//shop page
router.get('/categorylist', checkSessionAndBlocked, usercontroller.categorylist)
//route for enter the registered email for the forgot otp 
router.get('/emailcheck',  usercontroller.mailpage)
//post for the email
router.post('/checkemail',  usercontroller.mailpagepost)
//otp page render
router.get('/otpcheck',  usercontroller.mailotp)
//post fpr the otp 
router.post('/otpcheck',  usercontroller.mailotppost)
//render the new password ejs
router.get('/newpassword',  usercontroller.newpassword)
//post for the new password
router.post('/newpasswordpost', usercontroller.newpasswordpost)

router.get('/search',usercontroller.search)

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/Ecart')
})



module.exports = router;
