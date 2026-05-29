
// Express framework import
const express = require("express");

// Express app create
const app = express();

// Mongoose import for MongoDB connection
const mongoose = require("mongoose");

// Listing model import
const Listing = require("./models/listing.js");

// Path module import
const path = require("path");

// ejs-mate import for layouts support
const ejsMate = require("ejs-mate");


// MongoDB URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


// ----------------------
// MongoDB Connection
// ----------------------

// Calling main function
main()
.then(() => {
    console.log("connection successful");
})
.catch((err) => {
    console.log(err);
});

// Async function to connect MongoDB
async function main() {
    await mongoose.connect(MONGO_URL);
}


// ----------------------
// Server Start
// ----------------------

app.listen(8080, () => {
    console.log("server is listening at port 8080");
});


// ----------------------
// EJS & Layout Setup
// ----------------------

// ejs-mate ko enable karna
app.engine("ejs", ejsMate);

// View engine set karna
app.set("view engine", "ejs");

// Views folder ka path set karna
app.set("views", path.join(__dirname, "views"));


// ----------------------
// Middleware
// ----------------------

// Static files (CSS, JS, Images) serve karne ke liye
app.use(express.static(path.join(__dirname, "/public")));

// Method override future me PUT/DELETE requests ke liye
// app.use(methodOverride("_method"));


// ----------------------
// Routes
// ----------------------


// Root Route
// Browser me "/" open karoge toh ye response aayega
app.get("/", (req, res) => {
    res.send("hi am root of wanderlust");
});


// ----------------------
// Index Route
// Saari listings show karega
// ----------------------

app.get("/listings", async (req, res) => {

    // Database se saari listings fetch karna
    const allListings = await Listing.find({});

    // listings/index.ejs render karna
    // aur data bhejna
    res.render("listings/index.ejs", { allListings });
});




//to create new route y sirf render krega new page ko
app.get("/listings/new",async (req,res)=>{
    res.render("listings/new.ejs");
});


// Form data read karne ke liye 
 app.use(express.urlencoded({ extended: true }));
//nya route jo data ko add kre

// Create Route
// Form data database me save karega

app.post("/listings", async (req, res) => {

    // Form data access karna
    const newListing = req.body.new_listing;

    // New document create karna
    const new_listing = new Listing(newListing);

    // Database me save karna
    await new_listing.save();

    console.log("new listing saved");

    // Listings page pe redirect
    res.redirect("/listings");

});






// ----------------------
// Show Route
// Ek particular listing ki details show karega
// ----------------------

app.get("/listings/:id", async (req, res) => {

    // URL se id nikalna
    const { id } = req.params;

    // Database se single listing find karna
    const Listing_data = await Listing.findById(id);

    // show.ejs render karna
    // aur listing data bhejna
    res.render("listings/show.ejs", { Listing_data });
});



const methodOverride = require("method-override");
app.use(methodOverride("_method"));




//delete route
app.delete("/listings/:id",async(req,res)=>{
    const {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
});



// Edit Route
// Existing listing ka edit form open karega

app.get("/listings/:id/edit", async (req, res) => {

    // URL se id lena
    const { id } = req.params;

    // Database se particular listing find karna
    const edit_listing = await Listing.findById(id);

    // edit.ejs page render karna
    // aur listing data bhejna
    res.render("listings/edit.ejs", { edit_listing });

});


