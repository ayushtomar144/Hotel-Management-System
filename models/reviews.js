const mongoose=require("mongoose");

const Schema=mongoose.Schema;

const reviewSchema= new Schema({
    comment:String,
    rating:{
        min:1,
        max:5
    },
    createdAt:Date.now()
});

const review=mongoose.model("review",reviewSchema);