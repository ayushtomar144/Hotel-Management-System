// Express framework import
const express = require("express");
const app = express();

// MongoDB
const mongoose = require("mongoose");

// Model
const Listing = require("./models/listing.js");

// Path
const path = require("path");

// EJS Mate
const ejsMate = require("ejs-mate");

// Method Override
const methodOverride = require("method-override");

// Custom Utilities
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");

// MongoDB URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";


// ----------------------
// Database Connection
// ----------------------

main()
    .then(() => {
        console.log("connection successful");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}


// ----------------------
// View Engine Setup
// ----------------------

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ----------------------
// Middleware
// ----------------------

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Form Data Parser
app.use(express.urlencoded({ extended: true }));

// PUT & DELETE requests support
app.use(methodOverride("_method"));


// ----------------------
// Routes
// ----------------------

// Root Route
app.get("/", (req, res) => {
    res.send("Hi, I am root of Wanderlust");
});


// ----------------------
// Index Route
// ----------------------

app.get("/listings", wrapAsync(async (req, res) => {

    const allListings = await Listing.find({});

    res.render("listings/index.ejs", { allListings });

}));


// ----------------------
// New Route
// ----------------------

app.get("/listings/new", (req, res) => {

    res.render("listings/new.ejs");

});


// ----------------------
// Create Route
// ----------------------

app.post("/listings", wrapAsync(async (req, res) => {

    const newListing = req.body.new_listing;

    const new_listing = new Listing(newListing);

    await new_listing.save();

    console.log("New Listing Saved");

    res.redirect("/listings");

}));


// ----------------------
// Show Route
// ----------------------

app.get("/listings/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const Listing_data = await Listing.findById(id);

    res.render("listings/show.ejs", { Listing_data });

}));


// ----------------------
// Edit Route
// ----------------------

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {

    const { id } = req.params;

    const edit_listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { edit_listing });

}));


// ----------------------
// Update Route
// ----------------------

app.put("/edit_listings/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    await Listing.findByIdAndUpdate(
        id,
        req.body.new_edit_listing,
        { new: true }
    );

    res.redirect(`/listings/${id}`);

}));


// ----------------------
// Delete Route
// ----------------------

app.delete("/listings/:id", wrapAsync(async (req, res) => {

    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");

}));


// ----------------------
// 404 Route
// ----------------------

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});


// ----------------------
// Error Middleware
// ----------------------

app.use((err, req, res, next) => {

    let {
        statuscode = 500,
        message = "Something Went Wrong"
    } = err;

    res.render("error.ejs",{message});
    //res.status(statuscode).send(message);

});


// ----------------------
// Server Start
// ----------------------

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});