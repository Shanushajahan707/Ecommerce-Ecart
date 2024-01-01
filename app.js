
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const cartRouter = require('./routes/cart');
const profileRouter = require('./routes/profile')
const orderRouter = require('./routes/order')
const paymentRouter = require('./routes/payment')
const reportRouter = require('./routes/report')
const coupenRouter = require('./routes/coupen')
const offerRouter = require('./routes/offer')
const nocache = require('nocache');
const server = require('./server')
require('dotenv').config();
// const Razorpay=require('razorpay')
const app = express();
app.use(nocache())
const port = process.env.PORT || 3000
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, 'layout')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/', cartRouter);
app.use('/', profileRouter)
app.use('/', orderRouter)
app.use('/', paymentRouter)
app.use('/', reportRouter)
app.use('/', coupenRouter)
app.use('/', offerRouter)

app.listen(port, (err) => {
  if (!err) {
    console.log(`port connected at http://localhost:${port} `);
  }
  console.log(err);
})

// // error handler
app.use(function(req, res, next) {
  res.status(404);
  res.render('error');
});

// Error-handling middleware
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  console.log(err);
  res.render('error');
});




module.exports = app;
