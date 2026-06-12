// =============================================
// WANDERLUST - Main Application File (app.js)
// =============================================
// Yeh file poori Express application ka core hai.
// Sabhi routes, middleware, aur database connection
// yahan se manage hote hain.


// -----------------------------------------------
// STEP 1: Required packages import karna
// -----------------------------------------------

const express = require("express");
// Express ek web framework hai — HTTP requests handle karta hai

const app = express();
// Express ka ek instance banaya — yahi hamari poori app hai

const mongoose = require("mongoose");
// Mongoose, MongoDB ko Node.js se connect karne ki library hai

const Listing = require("./models/listing.js");
// Hamara apna Listing model — MongoDB ki "listings" collection
// se interact karta hai (schema yahan define hota hai)

const Review = require("./models/reviews.js");
//hmara apna review model


const path = require("path");
// Node.js ka built-in module — file/folder paths banane ke liye

const ejsMate = require("ejs-mate");
// EJS ka upgrade — isse layouts/partials support milta hai
// (ek common boilerplate.ejs sab pages mein use ho sakti hai)

const methodOverride = require("method-override");
// HTML forms sirf GET aur POST support karte hain.
// Yeh middleware forms ko PUT aur DELETE bhi karne deta hai
// URL mein ?_method=PUT likhke

const wrapAsync = require("./utils/wrapAsync");
// Hamara custom utility:
// async functions mein agar error aaye to automatically
// next(err) call karta hai — try-catch likhna nahi padta

const ExpressError = require("./utils/ExpressError");
// Hamari custom Error class:
// statuscode aur message dono saath rakh sakti hai
// e.g. new ExpressError(404, "Page Not Found")

const { listingSchema,reviewSchema } = require("./schema.js");
const reviews = require("./models/reviews.js");
// Joi validation schema — define karta hai ki req.body ka
// data kaisa hona chahiye (required fields, types, etc.)


const listingRouter =require("./routes/listing.js");
//express s jo routes bnae unko yaha pr require kr liya

const reviewRouter=require("./routes/review.js");

// -----------------------------------------------
// STEP 2: MongoDB se connect karna
// -----------------------------------------------

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// Local MongoDB ka URL — "wanderlust" naam ka database use hoga
// 127.0.0.1 = localhost, 27017 = MongoDB ka default port

main()
    .then(() => {
        console.log("connection successful");
        // Database se connection ho gaya
    })
    .catch((err) => {
        console.log(err);
        // Connection fail hua to error console mein dikhega
    });

async function main() {
    await mongoose.connect(MONGO_URL);
    // Mongoose ko batao ki is URL pe MongoDB se baat karo
    // await isliye kyunki yeh kaam time leta hai
}


// -----------------------------------------------
// STEP 3: View Engine setup karna
// -----------------------------------------------

app.engine("ejs", ejsMate);
// Express ko batao ki .ejs files render karne ke liye
// ejsMate use karo (normal ejs ki jagah)

app.set("view engine", "ejs");
// Default view engine EJS set kiya — ab res.render("file")
// automatically "file.ejs" dhundhega

app.set("views", path.join(__dirname, "views"));
// Views folder ka exact path batao — __dirname = current folder
// path.join safely OS-specific path banata hai

// -----------------------------------------------
// STEP 4: Global Middleware lagana
// -----------------------------------------------
// Middleware = woh code jo EVERY request se pehle chalta hai

app.use(express.static(path.join(__dirname, "public")));
// "public" folder ki files directly serve karo
// e.g. /public/style.css -> browser /style.css se access kare

app.use(express.urlencoded({ extended: true }));
// HTML form ka data (req.body) parse karne ke liye zaroori hai
// Bina is ke req.body hamesha undefined rahega

app.use(methodOverride("_method"));
// Form mein ?_method=PUT ya ?_method=DELETE likho
// Express use wo request PUT/DELETE ki tarah treat karega


app.use("/listings",listingRouter );
//y routes wala hai jaha pr bhi listings aayega vaha pr y use kro

app.use("/listings/:id/review",reviewRouter);

// -----------------------------------------------
// STEP 6: Routes
// -----------------------------------------------
// Routes = kaun sa URL aane pe kya karna hai


// Root Route — sirf test ke liye
app.get("/", (req, res) => {
    res.send("Hi, I am root of Wanderlust");
});


// --- INDEX ROUTE ---
// GET /listings -> saari listings dikhao
// validateListing NAHI lagaya — GET mein req.body nahi hota
app.get("/listings", wrapAsync(async (req, res) => {
    // MongoDB se saari listings fetch karo
    const allListings = await Listing.find({});

    // "listings/index.ejs" render karo, data saath bhejo
    res.render("listings/index.ejs", { allListings });
}));

// -----------------------------------------------
// STEP 7: 404 Handler
// -----------------------------------------------
// Koi bhi route match nahi hua to yahan aata hai
// app.use bina route ke = sab unmatched requests pakadta hai

app.use((req, res, next) => {
    // Custom 404 error create karke error middleware ko bhejo
    next(new ExpressError(404, "Page Not Found"));
});


// -----------------------------------------------
// STEP 8: Global Error Handling Middleware
// -----------------------------------------------
// Yeh 4 parameters wala function = error middleware
// Koi bhi next(err) call kare, yahan aata hai

app.use((err, req, res, next) => {
    // Error se statuscode aur message nikalo
    // Default values: 500 aur "Something Went Wrong"
    let {
        statuscode = 500,
        message = "Something Went Wrong"
    } = err;

    // IMPORTANT: pehle status code set karo, PHIR render karo
    // Bina res.status() ke browser ko hamesha 200 milta tha
    res.status(statuscode).render("error.ejs", { message });
});


// -----------------------------------------------
// STEP 9: Server start karna
// -----------------------------------------------

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
    // Ab browser mein http://localhost:8080 kholo
});