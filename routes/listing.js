const express=require('express');
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { listingSchema,reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");
const Listing = require("../models/listing.js");


// -----------------------------------------------
// STEP 5: Validation Middleware banana
// -----------------------------------------------
const validateListing = (req, res, next) => {
    // Joi schema se req.body ko validate karo
    // { error } destructure karke sirf error nikala
    const { error } = listingSchema.validate(req.body);

    if (error) {
        // Agar validation fail hui to 400 error throw karo
        // error.details[0].message = human-readable error message
        throw new ExpressError(400, error.details[0].message);
    } else {
        // Data sahi hai to aage jao (next middleware/route)
        next();
    }
};


// --- NEW ROUTE ---
// GET /listings/new -> nayi listing banana ka form dikhao
// Koi database call nahi — sirf form render karna hai
// NOTE: Yeh route /listings/:id se UPAR hona zaroori hai
// warna Express "new" ko ek :id samajh lega
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});


// --- CREATE ROUTE ---
// POST /listings -> form submit hone pe nayi listing save karo
// validateListing lagaya — POST mein req.body aata hai
router.post("/", validateListing, wrapAsync(async (req, res) => {
    // req.body.new_listing mein form ka data hota hai
    // (form ke inputs ka name="new_listing[title]" etc. hona chahiye)

    // Mongoose model ka nayi instance banao
    const newListing = new Listing(req.body.listing);

    newListing.image = {
        url: req.body.listing.image,
        filename: "default"
    };

    // Database mein save karo — await isliye kyunki async operation hai
    await newListing.save();

    console.log("New Listing Saved");

    // Save hone ke baad listings page pe redirect karo
    res.redirect("/listings");
}));
// --- SHOW ROUTE ---
// GET /listings/:id -> ek specific listing ki detail dikhao
// :id = URL mein koi bhi value aa sakti hai (MongoDB ObjectId)
// router.get("/:id", wrapAsync(async (req, res) => {
//     // URL se id nikalo
//     const { id } = req.params;

//     // Us id ki listing MongoDB se dhundo
//     const Listing_data = await Listing.findById(id).populate("reviews");

//     // Detail page render karo
//     res.render("listings/show.ejs", { Listing_data });
// }));


router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    const Listing_data = await Listing.findById(id).populate("reviews");

    console.log(Listing_data.image);

    res.render("listings/show.ejs", { Listing_data });
}));



// --- EDIT ROUTE ---
// GET /listings/:id/edit -> edit form dikhao (pehle se bhara hua)
router.get("/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;

    // Purani values form mein dikhane ke liye pehle fetch karo
    const edit_listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { edit_listing });
     
}));






// --- UPDATE ROUTE ---
// PUT /listings/:id -> edited data save karo
// validateListing lagaya — PUT mein bhi req.body aata hai
// IMPORTANT: URL consistent rakha /listings/:id
// (pehle /edit_listings/:id tha jo galat tha)
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;

    // findByIdAndUpdate: id se dhundo aur nayi values se update karo
    // req.body.listing mein form ka updated data hoga
    // { new: true } = updated document return karo (purana nahi)

    req.body.listing.image = {
        url: req.body.listing.image,
        filename: "default"
    };

    await Listing.findByIdAndUpdate(
        id,
        req.body.listing,
        { returnDocument: "after" }
    );

    // Update ke baad us listing ka show page dikhao
    res.redirect(`/listings/${id}`);
}));

// --- DELETE ROUTE ---
// DELETE /listings/:id -> listing delete karo
// validateListing nahi lagaya — delete mein body validate nahi karni
router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;

    // Database se permanently delete karo
    await Listing.findByIdAndDelete(id);

    // Delete ke baad saari listings pe wapas jao
    res.redirect("/listings");
}));



module.exports=router;