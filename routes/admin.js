const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
// const morgan = require('morgan')
const nocache = require('nocache')
const session = require('express-session');
const server = require('../server')
const app = express()
const path = require('path')
const users = require('../models/users')
const product = require('../models/products')
// multer
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage }).array('img');

//multer 
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }))
// router.use(morgan('tiny'))
app.use(express.urlencoded({ extended: false }))
const admincontroller = require('../Controller/admincontroller')
app.use(nocache())
/* GET home page. */
//session middileware
router.use(session({
  secret: 'secret key',
  resave: false,
  saveUninitialized: true
}))


const checkSession = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/adminlogin");
  }
};


//login route
router.get('/adminlogin', admincontroller.adminLogin)
//home route
router.get('/adminHome', admincontroller.adminHome)
//admin login post request 
router.post('/admindashboard', admincontroller.adminloginpost)
//add product
router.get('/addproduct',checkSession, admincontroller.addProduct)
//add product post request
router.post('/addproduct', upload, admincontroller.addproductpost);
//show product list page render
router.get('/productlist',checkSession, admincontroller.viewproductlist)
//product update 
router.get('/productupdate/:id',checkSession, admincontroller.productupdate)
//product update get page 
router.post('/upproductpost/:id', upload, admincontroller.productupdatepost)
//post for the delete the single img
router.post('/remove-image',admincontroller.deleteimg)
//prodcut update post request 
router.get('/deleteproduct/:id',checkSession, admincontroller.deleteproduct)
//add category page 
router.get('/addcategory',checkSession, admincontroller.category)
//add category post request
router.post('/addcategory', admincontroller.categorypost)
//view category page render
router.get('/category',checkSession, admincontroller.viewcategory)
//update category 
router.get('/updatecategory/:id',checkSession,admincontroller.categoryupdateget)
//update category post
router.post('/updatecategory/:id',admincontroller.categoryupdatepost)
//delete category
router.get('/deletecategory/:id',checkSession,admincontroller.deletecategory)
//block user 
router.get('/blockuser/:id',checkSession,admincontroller.block)
//show user orders page 
router.get('/userorders',checkSession,admincontroller.userorderdetials)
//order status post requet
router.post('/updateorder/:id/:_id',admincontroller.updateorderstatus)
//product list or unlist
router.get('/showproduct/:id',checkSession,admincontroller.showproduct)
//
router.get('/adminsidecancelorder/:id',checkSession,admincontroller.admincanceluserorder)

//logout
router.get('/logout', admincontroller.adminLogout)
module.exports = router;