const express = require('express');
const router = express.Router();
const addproduct = require('../models/products')
const server = require('../server')
const usercollection = require('../models/users');
const session = require('express-session');
const Product = require('../models/products');
const categorycollection = require('../models/category');
const addresscollection = require('../models/address')
const ordercollection = require('../models/order')
const profileimage = require('../models/profilepic')
const returncollection = require('../models/returnorders')
const coupencollection = require('../models/coupen')
const offercollection = require('../models/productoffer')
const productcollection=require('../models/products')
const path = require('path');
const { log } = require('console');
const PDFDocument = require('pdfkit');

const profileload = async (req, res) => {
    if (req.session.userid) {
        try {
            const user = req.session.userid;
            const userdetials = await usercollection.findOne({ _id: user });
            // const useradddress = await addresscollection.find({userid: user});
            const profileimages = await profileimage.find({ userid: user })
            // console.log('user is ' + userdetials);
            // console.log('user address is ' + useradddress);
            const userorders = await ordercollection.find({ userid: user }).sort({ _id: -1 }) 
            res.render('profile', { userdetials, userorders, profileimages });
            // console.log("userorder is "+userorders);
        } catch (error) {
            console.log(error);
        }
    }
    else {
        res.redirect('/userlogin')
    }
}

const viewaddresss = async (req, res) => {
    const user = req.session.userid;
    console.log("i d ",user);
    const useradddress = await addresscollection.find({ userid: user });
    res.render('useraddress', { useradddress })
}


const vieworders = async (req, res) => {
    const user = req.session.userid;
    const userorders = await ordercollection.find({ userid: user })
    // console.log('the order is ');
    // console.log(userorders);
    res.render('userorder', { userorders })
}

const addaddress = (req, res) => {
    res.render('addaddress')
}

const addaddresspost = async (req, res) => {
    try {
        if (req.session.userid) {
            console.log('enter the post if');
            // console.log(userid);
            const data = {
                userid: req.session.userid,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                address: req.body.address,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode,
                phone: req.body.phone
            }
            await addresscollection.insertMany([data])
                .then(x => {
                    // console.log(x);
                    // console.log('insert  address');
                    res.redirect('/userprofile')
                })
        }

    } catch (error) {
        console.log(error);
    }
}
const updateaddress = async (req, res) => {
    const id = req.params.id
    console.log(id);
    const oldaddress = await addresscollection.findOne({ _id: id })
    console.log("address is", oldaddress);
    res.render('updateaddress', { oldaddress })
}

const updateaddresspost = async (req, res) => {
    const id = req.params.id
    console.log(id);
    const oldaddress = await addresscollection.findByIdAndUpdate(id, {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        address: req.body.address,
        city: req.body.city,
        pincode: req.body.pincode,
        phone: req.body.phone,
    })
        .then(x => {
            // console.log('updated', x);
            res.redirect('/viewaddress')
        })
    console.log("address is", oldaddress);
    res.render('updateaddress', { oldaddress })
}
const deleteaddress = async (req, res) => {
    const id = req.params.id
    await addresscollection.findByIdAndDelete(id)
        .then(() => {
            console.log('deleted')
            res.redirect('/viewaddress')
        })
}



const updateprofile = async (req, res) => {
    try {
        const images = await profileimage.find({ userid: req.session.userid })
        const id = req.params.id
        await usercollection.findById(id)
            .then(x => {
                res.render('updateprofile', { userdata: x, profileimages: images })
            })

    } catch (error) {
        console.log(error);
    }
}

const updateprofilepost = async (req, res) => {
    try {
        const id = req.params.id
        const oldimg = await profileimage.findOne({ userid: req.session.userid })
        // console.log(oldimg);
        if (oldimg && oldimg.profilepic) {
            await profileimage.deleteOne({ userid: req.session.userid })
        }
        // console.log(req.file);
      if(req.file){
        const data = {
            userid: id,
            profilepic: req.file.path.substring(6)
        }
        await profileimage.insertMany([data])
            .then(x => {
                // console.log('insertted ',x);
            })
      }
        await usercollection.findByIdAndUpdate(id, {
            username: req.body.username,
            email: req.body.email
        })
            .then(x => {
               
                // res.render('updateprofile', { userdata: x, message: "updated profile" })
            })

            res.redirect('/userprofile')
    } catch (error) {
        console.log(error);
    }

}

const changepass = async (req, res) => {
    try {
        const userid = req.session.userid
        res.render('editpassword')
    } catch (error) {
        console.log(error);
    }
}
const changepasspost = async (req, res) => {
    try {
        const uid = req.session.userid; // Corrected typo 'uderid' to 'userid'
        const data = await usercollection.findById({ _id: uid });

        if (data.password === req.body.oldpass) {
            const newpass = req.body.newpass;
            // console.log('Value is ', req.body);
            // console.log('New Password:', newpass);
            await usercollection.findByIdAndUpdate({ _id: uid }, {
                password: req.body.newpass

            })
                .then(() => {
                    console.log('pass changed to ' + data.password);

                })
            res.redirect('/userprofile')
        } else {
            res.render('editpassword', { message: "The Old Password Is Not Match Please Try Again" });
        }
    } catch (error) {
        console.log(error);
    }
}

const viewordermore = async (req, res) => {
    try {
        const id = req.params.id;
        const pid = req.params.productid;
        console.log('values area', id, pid); 
        const order = await ordercollection.findById(id);
        let selectedProduct;
        for (const product of order.productcollection) {
            console.log('for of product are',product );
            if (product._id.toString() == pid) {
                selectedProduct = product;
                break;
            }
        }
        console.log('product is', selectedProduct);
        if (!selectedProduct) {
            console.log('Product not found');
            return res.status(404).send('Product not found');
        }
        console.log('Selected Product:', selectedProduct);
        const address = order.address;
        const coupen = order.discount;
        let newprice;
        if (coupen) {
            // Issue here: The variable 'discount' is an array, and you should access the first element to get the discount value
            const discount = await coupencollection.find({ coupencode: coupen }, { discount: 1 })
            newprice = (selectedProduct.price * selectedProduct.quantity) - discount[0].discount;
        }
        const deliveryaddress = await addresscollection.findById(address);
        res.render('viewordermore', { order, deliveryaddress, newprice, selectedProduct });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    } 
};



const invoice = async (req, res) => {
    try {
        const pid = req.params.prid;
        const orderId = req.params.id;
        console.log("Entered");

        const invoiceDetails = await usercollection.findOne({ _id: req.session.userid })
        console.log("Invoice", invoiceDetails);

        const specificOrder = await ordercollection.findById(orderId)
        console.log("Invoice", specificOrder);

        const useradddress=await addresscollection.findById(specificOrder.address)
        console.log("address", useradddress);

        const orderproduct=await productcollection.findOne({Productname:specificOrder.productname})

        let selectedProduct;
        for (const product of specificOrder.productcollection) {
            console.log('for of product are',product );
            if (product._id.toString() == pid) {
                selectedProduct = product;
                break;
            }
        }
        console.log();
        // Create a new PDF document
        const doc = new PDFDocument();

        // Set response headers to trigger a download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="invoice.pdf"');
        // Pipe the PDF document to the response
        doc.pipe(res);
        const imagePath = "public/img/ECART.png"; // Change this to the path of your image
        const imageWidth = 100; // Adjust image width based on your layout
        const imageX = 550 - imageWidth; // Adjust X-coordinate based on your layout
        const imageY = 50; // Adjust Y-coordinate to place the image at the top
        doc.image(imagePath, imageX, imageY, { width: imageWidth });
        // Move to the next section after the image
        doc.moveDown(1);

        // Add content to the PDF document
        doc.fontSize(16).text("Billing Details", { align: "center" });
        doc.moveDown(1);
        doc.fontSize(10).text("Order Details", { align: "center" });
        doc.text(`Order ID: ${orderId}`);
        doc.moveDown(0.3);
        doc.text(`Name: ${invoiceDetails.username || ""}`);
        doc.moveDown(0.3);
        doc.text(`Email: ${invoiceDetails.email || ""}`);
        doc.moveDown(0.3);


        doc.moveDown(0.3);
        doc.text(`Address: ${useradddress.address || ""}`);
        doc.moveDown(0.3);
        doc.text(`Payment Method: ${specificOrder.paymentmode || ""}`);
        console.log("kkkk");

        doc.moveDown(0.3);

        const headerY = 300; // Adjust this value based on your layout
        doc.font("Helvetica-Bold");
        doc.text("Name", 100, headerY, { width: 150, lineGap: 5 });
        doc.text("Status", 300, headerY, { width: 150, lineGap: 5 });
        doc.text("quantity", 400, headerY, { width: 150, lineGap: 5 });
      
        doc.text("Price", 500, headerY, { width: 50, lineGap: 5 });
        doc.font("Helvetica");

        // Table rows
        const contentStartY = headerY + 30; // Adjust this value based on your layout
        let currentY = contentStartY;
    console.log("lll");

        
            doc.text(selectedProduct.productName || "", 100, currentY, {
                width: 150,
                lineGap: 5,
            });

            doc.text(selectedProduct.status || "", 300, currentY, {
                width: 50,
                lineGap: 5,
            });
         
            doc.text(selectedProduct.quantity || "", 400, currentY, {
                width: 50,
                lineGap: 5,
            });
         

            doc.text(selectedProduct.price || "", 500, currentY, {
                width: 50,
                lineGap: 5,
            });
            console.log("Reached Here");

            // Calculate the height of the current row and add some padding
            const lineHeight = Math.max(
                doc.heightOfString(selectedProduct.productName || "", { width: 150 }),
                doc.heightOfString(selectedProduct.status || "", { width: 150 }),
               
                doc.heightOfString(selectedProduct.price || "", { width: 50 })
            );
            currentY += lineHeight + 10; // Adjust this value based on your layout
       
        doc.text(`Total Price: ${selectedProduct.price * selectedProduct.quantity  || ""}`, {
            width: 400, // Adjust the width based on your layout
            lineGap: 5,
        });


        // Set the y-coordinate for the "Thank you" section
        const separation = 50; // Adjust this value based on your layout
        const thankYouStartY = currentY + separation; // Update this line

        // Move to the next section
        doc.y = thankYouStartY; // Change this line

        // Move the text content in the x-axis
        const textX = 60; // Adjust this value based on your layout
        const textWidth = 500; // Adjust this value based on your layout
        doc
            .fontSize(16)
            .text(
                "Thank you for choosing E-Cart! We appreciate your support and are excited to have you as part of our  family.",
                textX,
                doc.y,
                { align: "left", width: textWidth, lineGap: 10 }
            );

        doc.end();
console.log("fine");
    } catch (error) {
        res.render("error");
    }
};



module.exports = {
    profileload,
    viewaddresss,
    vieworders,
    addaddress,
    updateaddress,
    deleteaddress,
    updateaddresspost,
    addaddresspost,
    updateprofile,
    updateprofilepost,
    changepass,
    changepasspost,
    viewordermore,
    invoice
}