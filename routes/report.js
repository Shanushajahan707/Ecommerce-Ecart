const express = require('express');
const router = express.Router();
const ordercontroller = require('../Controller/ordercontroller')
const reportcontroller = require('../Controller/reportcontroller')
const ordercollection=require('../models/order')
const addresscollection=require('../models/address')



const checkSession = (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin/adminlogin");
    }
  };

router.get('/admin/salesreport',checkSession, reportcontroller.reportpage)
router.get('/salesreport',reportcontroller.salesReport)

router.get('/generate-pdf', reportcontroller.pdfreport)


  
module.exports = router