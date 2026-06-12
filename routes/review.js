const express = require("express");
const router = express.Router({ mergeParams: true });//merge krne k liye k liye parent aur child ko

const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError");

const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");
const cookie=require('cookie-parser');
//------------------------------------------------------------------------------------------------------------------------------------

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, error.details[0].message);
  } else {
    next();
  }
};
// IMPORTANT: Yeh middleware sirf POST aur PUT routes pe lagao
// GET routes pe req.body empty hota hai — wahan validate mat karo

//Review ka route

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let review = new Review(req.body.review);
    listing.reviews.push(review); //y line hmare listing array m jo reviews naam ki aray hai usme push kr ri

    await review.save();
    await listing.save();
    res.redirect(`/listings/${id}`);
  }),
);

//delete review
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
  }),
);

//------------------------------------------------------------------------------------------------------------------------------------
module.exports = router;
