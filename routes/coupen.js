const express = require('express');
const router = express.Router();
const coupencontroller=require('../Controller/coupencontroller')



router.get('/admin/addcoupen',coupencontroller.addcoupen)
router.post('/admin/addcoupenpost',coupencontroller.addcoupenpost)
router.get('/admin/viewcoupen',coupencontroller.viewccoupen)
router.post('/coupencheck',coupencontroller.coupencheck)
module.exports=router 