const Order = require("../models/orderModels");
const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user._id,
  });

  res.status(201).json({
    success:true,
    order,
  })
});


// get Single order
exports.getSingleOrder= catchAsyncErrors(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");

    if(!order){
        return next(new ErrorHandler("Order not found with this Id",404));
    }
    res.status(200).json({
        success:true,
        order,
    });
})

// get Logged in user order
exports.myOrders= catchAsyncErrors(async(req,res,next)=>{

    const orders = await Order.find({user:req.user.id});

    res.status(200).json({
        success:true,
        orders,
    });
});

// getAllOrder ---admin
exports.getAllOrders = catchAsyncErrors(async(req,res,next)=>{
  const orders = await Order.find();

  let totalAmount=0;

  orders.forEach((order)=>{
    totalAmount+=order.totalPrice;
  });

  res.status(200).json({
    success:true,
    totalAmount,
    orders,
  });

});

// updateOrder status ---admin
exports.updateOrderStatus = catchAsyncErrors(async(req,res,next)=>{
  const order = await Order.findById(req.params.id);

  if(!order){
    return next(new ErrorHandler("Order not found with this Id",404));
  }

  if(order.orderStatus === "Delivered"){
    return next(new ErrorHandler("You have already delivered this order",400));
  }

  if(req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      let product = await Product.findById(o.product);
      product.Stock-=quantity;

      await product.save({validateBeforeSave:false});
    });
  }

  order.orderStatus = req.body.status;
  if(req.body.status==="Delivered"){
    order.deliveredAt=Date.now()
  }


  await order.save({validateBeforeSave:false});
  res.status(200).json({
    success:true,
    message:"update Successfully"
  });

});

// Error
// async function updateStock(id,quantity){
//   let product = await Product.findById(id);
//   // console.log(product,quantity.product._id);
//   product.Stock-=quantity;

//   await product.save({validateBeforeSave:false});
// }

// deleteOrder ---admin
exports.deleteOrders = catchAsyncErrors(async(req,res,next)=>{
  const orders = await Order.findById(req.params.id);

  if(!orders){
    return next(new ErrorHandler("Order not found with this Id",404));
  }

  await orders.remove();

  res.status(200).json({
    success:true,
    message:"delete Successfully"
  });

});