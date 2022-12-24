const Product = require("../models/productModels");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors= require("../middleware/catchAsyncErrors");
const Apifeatures= require("../utils/apifeatures");
const cloudinary = require("cloudinary");

// --------------- Get All Product -------------

exports.getAllProducts =catchAsyncErrors(async (req,res,next)=>{
    const resultPerPage=8;
    // for Dashboard
    
    const docCount = new Apifeatures(Product.find(),req.query)
    .search()
    .filter()
    const productCount = await Product.countDocuments(docCount.query);
    const apiFeature = new Apifeatures(Product.find(),req.query)
    .filter()
    .pagination(resultPerPage)
    let products = await apiFeature.query;
    let filterProductCount = products.length;   
    
    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
        filterProductCount,
    });
});

// --------------- Get Product Details -------------

exports.getProductDetails=catchAsyncErrors(async(req,res,next)=>{
    const product =await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        product
    });
});

// -------------- getAllReviews --------------

exports.getProductReviews = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);
    
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews,
    });
    
});


// -------------- DeleteReview --------------

exports.deleteReview = catchAsyncErrors(async(req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    const reviews = product.reviews.filter(rev=>rev._id.toString()!= req.query.id.toString());
    let avg=0;
    reviews.forEach(rev=>{
        avg+=rev.rating
    });

    let ratings=0;
    if(reviews.length === 0){
        ratings=0;
    }
    else{
        ratings = avg/reviews.length;
    }


    const numOfReviews=reviews.length;

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews,
    },{new:true,runValidators:true,useFindAndModify:false})

    res.status(200).json({
        success:true,
    })
});

// -------------- Create New Review or Update the review ------------

exports.createProductReview= catchAsyncErrors(async(req,res,next)=>{

    const {rating,comments,productId} = req.body

    const review = {
        user:req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comments,
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user.id.toString());

    if(isReviewed){
        product.reviews.forEach(rev=>{
            if(rev.user.toString()===req.user.id.toString()){
                rev.rating=rating,
                rev.comments=comments
            }
        })
    }
    else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    let avg=0;
    product.reviews.forEach(rev=>{
        avg+=rev.rating
    });
    product.ratings = avg/product.reviews.length;

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
    })
});


// *************************** Admin Rights Section ********************

// -------------- Admin: Create Product --------------
exports.createProduct = catchAsyncErrors(async (req,res,next)=>{
    let images = [];
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
    const product=await Product.create(req.body);
    res.status(201).json({
        success:true,
        product
    });
})


// --------------- Admin: Update Product ----------------

exports.updateProduct =catchAsyncErrors(async (req,res,next)=>{
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    // Images Start Here
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  if (images !== undefined) {
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
  }

    product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false});
    res.status(200).json({
        success:true,
        product
    });
});

// ------------- Admin: deleteProduct ---------------

exports.deleteProduct =catchAsyncErrors(async(req,res,next)=>{
    const product =await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    // Deleting Product from Cloudinary
    for(let i=0;i<product.images.length;i++){
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }


    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product deleted Successfully"
    })  
});

exports.getAdminProducts =catchAsyncErrors(async (req,res,next)=>{
    const products = await Product.find();

    res.status(200).json({
        success:true,
        products,
    });
});
