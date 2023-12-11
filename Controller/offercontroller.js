const express = require('express');
const productcollection=require('../models/products')
const productoffercollection=require('../models/productoffer')

const productoffer=(req,res)=>{
    console.log('enter the get');
    res.render('addproductoffer')
}
const addproductofferpost = async (req, res) => {
    try {
        console.log(req.body);
        const { productname, price, percentage } = req.body;
        const product = await productcollection.findOne({ Productname: productname });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found!' });
        }
        const existingOffer = await productoffercollection.findOne({ productname: productname });
        if (existingOffer) {
            return res.status(400).json({ success: false, message: 'An offer for this product already exists' });
        }
        const offerData = {
            productname,
            price,
            offer: percentage
        };
        await productoffercollection.insertMany([offerData]);
        console.log('Offer inserted successfully');
        return res.status(200).json({ success: true, message: 'Offer inserted successfully' });
    } catch (error) {
        console.error('Error inserting offer:', error);
        return res.status(500).json({ success: false, message: 'Error inserting offer' });
    }
};




const productofferspage=async(req,res)=>{
    const productoffers=await productoffercollection.find()
    res.render('productoffer',{productoffers})
}

const removeoffer=async(req,res)=>{
  try {
    const id=req.params.id
    await productoffercollection.findByIdAndRemove(id)
    .then(z=>{
        console.log('removed');
        res.redirect('/admin/productoffers')
    })
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  productoffer,
  addproductofferpost,
  productofferspage,
  removeoffer
}