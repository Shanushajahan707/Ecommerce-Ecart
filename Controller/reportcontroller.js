const express = require('express');
const router = express.Router();
const ordercollection = require('../models/order')
const addresscollection = require('../models/address')
const ExcelJS = require('exceljs')
// const blobStream = require('blob-stream');
// const PDFDocument = require('pdfkit');
const PDFDocument  = require('pdfkit-table')

const reportpage = async (req, res) => {
  try {
    const dailyOrders = await ordercollection.aggregate([
      {
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderdate" } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);


    const { dates, orderCounts, totalOrderCount } = dailyOrders.reduce(
      (result, order) => {
        result.dates.push(order._id);
        result.orderCounts.push(order.orderCount);
        result.totalOrderCount += order.orderCount; 
        return result;
      },
      { dates: [], orderCounts: [], totalOrderCount: 0 }
    );
    console.log('count daily', dates, "", dailyOrders);




    const monthlyOrders = await ordercollection.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$orderdate" },
            month: { $month: "$orderdate" },
          },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Extract only the order counts
    const orderCount = monthlyOrders.map(order => order.orderCount);
    // console.log("count ", orderCount);
    // Now the 'orderCounts' array contains only the order counts for each month
    const monthlyData = monthlyOrders.reduce((result, order) => {
      const monthYearString = `${order._id.year}-${String(order._id.month).padStart(2, '0')}`;
      result.push({
        month: monthYearString,
        orderCount: order.orderCount,
      });
      return result;
    }, [])
    let monthdata = orderCount
    // console.log(totalOrderCount);
    const yearlyOrders = await ordercollection.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y", date: "$orderdate" } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const { years, orderCounts3, totalOrderCount3 } = yearlyOrders.reduce(
      (result, order) => {
        result.years.push(order._id);
        result.orderCounts3.push(order.orderCount);
        result.totalOrderCount3 += order.orderCount;
        return result;
      },
      { years: [], orderCounts3: [], totalOrderCount3: 0 }
    );


    // console.log("orders",totalOrderCount3,);
    console.log("monthky data");
    res.render('adminsalesreport', { dailyOrders, dates, orderCounts, monthdata, totalOrderCount3 });

  } catch (error) {
    console.error('Error fetching and aggregating orders:', error);
    res.status(500).send('Internal Server Error');
  }
};



const salesReport = async (req, res) => {
  try {
    const startdate = new Date(req.query.startingdate);
    const Endingdate = new Date(req.query.endingdate);
    Endingdate.setDate(Endingdate.getDate() + 1);

    const orderCursor = await ordercollection.aggregate([
      {
        $match: {
          orderdate: { $gte: startdate, $lte: Endingdate }
        }
      }
    ]);

    if (orderCursor.length === 0) {
      return res.redirect('/admin/salesreport');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    // Add data to the worksheet
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 15 },
      { header: 'Product Name', key: 'productname', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Order Date', key: 'orderdate', width: 18 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'City', key: 'city', width: 20 },      // Add City column
      { header: 'Pincode', key: 'pincode', width: 15 }, // Add Pincode column
      { header: 'Phone', key: 'phone', width: 15 }      // Add Phone column
    ];

    for (const orderItem of orderCursor) {
    for (const product  of orderItem.productcollection) {
      // Fetch address details based on the address ID
      const addressDetails = await addresscollection.findById(orderItem.address);
      
      worksheet.addRow({
        'username': orderItem.username,
        'productname': product.productName,
        'quantity': product.quantity,
        'price': product.price,
        'status': product.status,
        'orderdate': orderItem.orderdate,
        'address': addressDetails ? addressDetails.address : 'N/A',
        'city': addressDetails ? addressDetails.city : 'N/A',
        'pincode': addressDetails ? addressDetails.pincode : 'N/A',
        'phone': addressDetails ? addressDetails.phone : 'N/A'
      });
    }
  }

    // Generate the Excel file and send it as a response
    workbook.xlsx.writeBuffer().then((buffer) => {
      const excelBuffer = Buffer.from(buffer);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
      res.send(excelBuffer);
    });
  } catch (error) {
    console.error('Error creating or sending Excel file:', error);
    res.status(500).send('Internal Server Error');
  }
}; 


const pdfreport = async (req, res) => {
  try {
    const startingDate = new Date(req.query.startingdate);
    const endingDate = new Date(req.query.endingdate);

    // Fetch orders within the specified date range
    const orders = await ordercollection.find({
      orderdate: { $gte: startingDate, $lte: endingDate },
    });
    let addressDetails
    for(let address of orders){
        addressDetails = await addresscollection.findById(address.address);
      ;
    }
    console.log('sdfshf',addressDetails)
    // Create a PDF document
    const doc = new PDFDocument();
    const filename = "sales_report.pdf";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Add content to the PDF document
    doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });

    // Define the table data
    const tableData = {
      headers: [
        "Username",
        "Product Name",
        "Price",
        "Quantity",
        "Address",
        "City",
        "Pincode",
        "Phone",
      ],
      rows: orders.map((order) => [
        order.username,
        order.productcollection.map((product) => product.productName).join(", "),
        order.productcollection.map((product) => product.price).join(", "),
        order.productcollection.map((product) => product.quantity).join(", "),
        addressDetails.address,
        addressDetails.city,
        addressDetails.pincode,
        addressDetails.phone,
      ]),
    };

    // Draw the table
    await doc.table(tableData, {
      prepareHeader: () => doc.font("Helvetica-Bold"),
      prepareRow: () => doc.font("Helvetica"),
    });

    // Finalize the PDF document
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Internal Server Error");
  }
};





module.exports = {
  reportpage,
  salesReport,
  pdfreport
}