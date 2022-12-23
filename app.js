const express = require("express");
const errorMiddleware=require('./middleware/error');
const cookieParser = require("cookie-parser"); 
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require('dotenv');

const app=express();

//config
dotenv.config({path:"backend/config/config.env"});

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());
app.use(cors());
// Route imports
const productRoute=require("./routes/productRoute");
const userRoute=require("./routes/userRoutes");
const orderRoute=require("./routes/orderRoutes");
const paymentRoute=require("./routes/paymentRoute");

app.use('/api/v1',productRoute);
app.use('/api/v1',userRoute);
app.use('/api/v1',orderRoute);
app.use('/api/v1',paymentRoute);

// Midddleware for error
app.use(errorMiddleware);

module.exports=app;