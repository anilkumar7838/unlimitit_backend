const App =require('./app');
const dotenv = require('dotenv');
const connectDatabase=require("./config/database");
const cloudinary = require("cloudinary")

// Handling Uncaught Exception
process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught Exception");
    process.exit(1);
});


//config
dotenv.config({path:"backend/config/config.env"});

// Connecting to database
connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINRAY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

const server=App.listen(process.env.PORT,()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection",err=>{
    console.log(`"Error": ${err.message}`)
    console.log("Shutting down the server due to unhandled Promise Rejection"
    );
    server.close(()=>{
        process.exit(1);
    });
});
