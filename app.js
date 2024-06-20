if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}
require('dotenv').config();
console.log(process.env.SECRET);
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing");
const path=require("path");
const listings=require("./routes/listing.js");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapasync.js");
const ExpressError=require("./utils/expresserror.js");
const {listingSchema,reviewSchema}=require("./schema.js");
const review = require("./models/review.js");
const Review = require("./models/review.js");
const reviewRouter=require("./routes/review.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const LocalStratergy=require("passport-local");
const User=require("./models/user.js");
const user=require("./routes/user.js");
const dbUrl=process.env.ATLASDB_URL;
//const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"
main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
})
const store=MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:"mysupersecretcode"
    },
    touchAfter:24*3600,
})
store.on("error",()=>{
    console.log("error in mongo",err);
})
const sessionOptions={
    store,
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}

app.get("/",(req,res)=>{
    res.send("hi i am root");
});
app.use(session(sessionOptions));
app.use(flash());
//before done by 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
  
passport.deserializeUser(User.deserializeUser());
  
  

//flash before routes
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
})
app.get("/testListing",async (req,res)=>{
    let sampleListing=new Listing({
        title:"my new Villa",
        description:"by the beach",
        price:1200,
        location:"Calangute,Goa",
        country:"India",
    });
    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
});
app.get("/demouser",async(req,res)=>{
    let fakeuser=new User({
        email:"student@gmail.com",
        username:"delta-student"
    });
    let registereduser=await User.register(fakeuser,"helloworld");
    res.send(registereduser)
})
app.listen(8080,()=>{
    console.log("server is listening to port 8080");

});
app.get("/listings",async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
    })
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use("/listings",listings);
app.use("/",user);

app.get("/listings")
async function main(){
    await mongoose.connect(dbUrl);
}
app.use("/listings/:id/reviews",reviewRouter);
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})
app.put("/listings/:id",async(req,res)=>{
    let {id}=req.params;
   await Listing.findByIdAndUpdate(id,{...req.body.listing})
res.redirect("/listings");
})
//update route

//pull operator of mongoose
//by it it sees then delete it 
// app.use((err,req,res,next)=>{
//     let {statusCode=500,message="something went wrong"}=err;
//     res.status(statusCode).send(message);
//     res.render("error.ejs");
// })
//post route
//npm i passport  and npm install passport-local 
//passport local mongoose

