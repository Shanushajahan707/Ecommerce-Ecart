const express = require('express');
const router = express.Router();
const offercontroller=require('../Controller/offercontroller')



const checkSession = (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin/adminlogin");
    }
  };

router.get('/admin/productoffer',checkSession,offercontroller.productoffer)
router.post('/addproductoffer',offercontroller.addproductofferpost)
router.get('/admin/productoffers',checkSession,offercontroller.productofferspage)
router.get('/admin/removeoffer/:id',offercontroller.removeoffer)
module.exports=router 