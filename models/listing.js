const mongoose=require("mongoose");

const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
 image: {
    filename: String,
    url: String
},


        price:{
    type: Number,
    required: true
},
        location:String,
        country:String,
        reviews:{
            type:Schema.Types.ObjectId,
            ref:"Review",
        }
});

const Listing1=mongoose.model("Listing",listingSchema);
module.exports=Listing1;