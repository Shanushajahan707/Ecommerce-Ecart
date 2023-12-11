const usercontroller = require('./usercontroller'); // Adjust the path as needed
const express = require('express');
const router = express.Router();
const addproduct = require('../models/products')
const server = require('../server')
const users = require('../models/users');
const Product = require('../models/products');
const categorycollection = require('../models/category');
const ordercollection = require('../models/order')
// const { EsimProfilePage } = require('twilio/lib/rest/supersim/v1/esimProfile');

//admin login page render
const adminLogin = (req, res) => {
  if (req.session.admin) {
    res.redirect('/admin/adminHome')
  }
  else {
    const msg = req.query.message
    res.render('adminlogin', { message: msg })
  }
}
//admin dashboard render
const adminHome = async (req, res) => {
  try {
    if (req.session.admin) {
      const userList = await users.find();
      res.render('dashboard', { users: userList }); // Pass the userList to the rendering engine
    } else {
      res.redirect('/admin/adminlogin', 302);
    }
  } catch (error) {
    console.log(error);
  }
}
//admin login post request
const adminloginpost = async (req, res) => {
  try {
    const admin = {
      username: "admin",
      password: "123"
    }

    if (req.body.username === admin.username && req.body.password === admin.password) {
      req.session.admin = admin
      res.redirect('/admin/salesreport')

    } else {
      // console.log("enter the login else");
      res.redirect('/admin/adminlogin/?message=InvalidEntry')
      // res.render('adminlogin', { message: "Invalid Entry " });
    }
  } catch (error) {
    console.log("error loading admin");
    res.status(500).send("Internal Server Error");
  }
}
//admin add product 
const addProduct = async (req, res) => {

  try {
    const cat = await categorycollection.find()
    // console.log(cat);
    res.render('adminaddproduct', { categories: cat })
  } catch (error) {
    console.log(error);
  }
}
//admin add product post request
const addproductpost = async (req, res) => {
  try {
    // console.log(req.body);

    const data = new Product({
      Productname: req.body.productname,
      Category: req.body.category,
      Price: req.body.price,
      Rating: req.body.rating,
      Stock: req.body.stock,
      Model: req.body.model,
      Description: req.body.description,
      image: req.body.croppedImages,
    });

    console.log(data); // Check the 'data' object before saving

    await data.save();
    console.log('Inserted successfully');
    res.redirect('/admin/adminHome');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//admin view product list
const viewproductlist = async (req, res) => {
  try {
    const prlist = await Product.find({}).populate('Category')
    res.render('seeproductadmin', { prlist })
  } catch (error) {
    console.log(error);
  }
}
//admin update product
const productupdate = async (req, res) => {

  try {

    const id = req.params.id
    const values = await Product.findById(id)
    const categories = await categorycollection.find()
    console.log(categories)
    res.render('updateproduct', { values, categories })
  } catch (error) {
    console.log(error);
  }
}

//admin update product post request
const deleteimg = async (req, res) => {
  console.log('enterr');
  const productId = req.body.productId;
  const imageIndex = req.body.imageIndex;
  try {
    console.log("HOY");
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    if (imageIndex < 0 || imageIndex >= product.image.length) {
      return res.status(400).send('Invalid image index');
    }
    product.image.splice(imageIndex, 1);
    await product.save();
    res.status(200).send('Image removed successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}


const productupdatepost = async (req, res) => {
  try {
    const id = req.params.id
    // console.log(id);
    const value = await Product.findByIdAndUpdate(id, {
      Productname: req.body.productname,
      Category: req.body.category,
      Price: req.body.price,
      Rating: req.body.rating,
      Stock: req.body.stock,
      Model: req.body.model,
      Description: req.body.description,
      // image: req.files.map(file => file.path.substring(6))
    }, { new: true })
    if (!value) {
      // const values=await Product.findById(id)
      res.render('updateproduct', value)
    } else {
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path.substring(6))
        value.image = value.image.concat(newImages);
      }
      if (!value) {
        console.log("Product not found");
        res.status(404).send("Product not found");
        return;
      }
      await value.save();
      console.log(value);
      res.redirect("/admin/productlist");
    }
  } catch (error) {
    console.log(error);
  }
}
//admin delete product
const deleteproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Product.findByIdAndRemove({ _id: id });
    if (result) {
      const prlist = await Product.find()
      res.render('seeproductadmin', { prlist })
    }
    else {
      res.json({ msg: 'User not found' });
    }
  } catch (err) {
    console.error('Error deleting user: ', err);
    res.json({ msg: err.message });
  }

}

//render the  view category 
const category = (req, res) => {
  try {
    // const catlist=c
    res.render('category')
  } catch (error) {
    console.log(error);
  }
}
//admin add category post request
const categorypost = async (req, res) => {
  try {
    const cate = { Category: req.body.categoryname };

    const existingCategory = await categorycollection.findOne({ Category: { $regex: new RegExp('^' + cate.Category + '$', 'i') } });
    if (existingCategory) {
      res.render('category', { message: "Category already exists in Db" });
    } else {
      const value = await categorycollection.insertMany([cate]);
      if (!value) {
        res.render('category', { message: "Not inserted" });
      } else {
        res.render('category', { message: "Insert Success" });
      }
    }
  } catch (error) {
    console.log(error);
  }
}


//see the category render
const viewcategory = async (req, res) => {
  try {
    await categorycollection.find()
      .then(x => {
        res.render('viewcategory', { catlist: x })
      })

  } catch (error) {
    console.log(error);
  }
}

//category update page render
const categoryupdateget = async (req, res) => {

  try {
    const id = req.params.id
    await categorycollection.findById(id)
      .then(x => {
        console.log(x);
        res.render('updatecategory', { catlist: x })
      })
  } catch (error) {
    console.log(error);
  }
}

//category update post request
const categoryupdatepost = async (req, res) => {
  try {
    const id = req.params.id
    await categorycollection.findByIdAndUpdate(id, {
      Category: req.body.categoryname
    })
      .then(x => {
        res.redirect('/category')
      })
  } catch (error) {
    console.log(error);
  }
}
//category delete admin
const deletecategory = async (req, res) => {

  try {
    console.log('enter the deletepost');
    const id = req.params.id;
    const result = await categorycollection.findByIdAndDelete(id);

    if (result) {
      console.log('enter the deletecat');
      res.redirect('/admin/category')
      // .then(x=>{
      //   res.render('viewcategory',{catlist:x})})

    }
    else {
      res.json({ msg: 'User not found' });
    }

  } catch (err) {
    console.error('Error deleting user: ', err);
    res.json({ msg: err.message });
  }
}
//admin can block the user
const block = async (req, res) => {
  const userId = req.params.id;
  const user = await users.findById(userId);
  // console.log('1st');
  // console.log('2nd');
  user.isblocked = !user.isblocked;
  await user.save();
  const userList = await users.find();
  // console.log(userList);
  // res.render('dashboard', { users: userList, message: "User status updated" });
  res.redirect('/admin/adminHome')
}
// orders page 
const userorderdetials = async (req, res) => {
  try {
    await ordercollection.find().sort({ _id: -1 })
      .then(async x => {
        for (const item of x) {
          // console.log('user id is ' + item.userid);
          userorder = item.userid
        }
        res.render('showorderadmin', { orders: x })
      })

  } catch (error) {
    console.log(error);
  }
}
//change order status 
const updateorderstatus = async (req, res) => {
  try {
    const userid = req.params.id;
    const productid = req.params._id;
    const newstatus = req.body.orderstatus;
    console.log(userid, productid);
    // Update the status of the specific product in the order
    const updatedOrder = await ordercollection.findOneAndUpdate(
      { userid, 'productcollection._id': productid },
      { $set: { 'productcollection.$.status': newstatus } },
      { new: true }
    );
    console.log('Updated Order:', updatedOrder);
    // Redirect or send a response as needed
    res.redirect('/admin/userorders');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//product list or unlist
const showproduct = async (req, res) => {
  try {
    const id = req.params.id
    console.log(id);
    const productlist = await Product.findOne({ _id: id })
    productlist.isList = !productlist.isList
    await productlist.save()
    res.redirect('/admin/productlist')
  } catch (error) {
    console.log(error);
  }
}
const admincanceluserorder = async (req, res) => {
  try {
    const id = req.params.id
    console.log('calue are ',id);
    // console.log('id is ', orderId);
    const newstatus = "Cancelled"
    // Update the status in the ordercollection
    await ordercollection.findOneAndUpdate(
      {'productcollection._id': id },
      { $set: { 'productcollection.$.status': newstatus } },
      { new: true }
    ).then((x) => {
      console.log('Updated Order:', x);
    })
      .catch(x => {
        console.log('error i nupdation', x);
      })
    // Update the stock in the productcollection
    res.redirect('/admin/userorders')
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}




//admin logout
const adminLogout = (req, res) => {
  req.session.destroy()
  res.redirect('/admin/adminlogin')
}
module.exports = {
  adminLogin,
  adminLogout,
  adminloginpost,
  addProduct,
  adminHome,
  addproductpost,
  category,
  viewproductlist,
  productupdate,
  deleteimg,
  productupdatepost,
  categorypost,
  deleteproduct,
  viewcategory,
  categoryupdateget,
  categoryupdatepost,
  deletecategory,
  block,
  userorderdetials,
  updateorderstatus,
  showproduct,
  admincanceluserorder
};
