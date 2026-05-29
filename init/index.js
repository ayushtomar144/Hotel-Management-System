const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const initdata = require("./data.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
.then(() => {
    console.log("connection successful");
})
.catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);

    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);

    console.log("data initialized");
}