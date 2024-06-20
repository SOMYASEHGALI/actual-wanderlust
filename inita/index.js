

const mongoose = require("mongoose");
const listings = require("./data.js");
const initData=require("./data.js");
const Listing = require("../models/listing.js");

//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl="mongodb+srv://somyasehgal91:iTSksetXCIZbkDdF@cluster0.bufs8ve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// console.log(listings);
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


const axios = require('axios');

const mapboxAccessToken = 'pk.eyJ1IjoiZGVsdGEtc3R1ZHVlbnQiLCJhIjoiY2xvMDk0MTVhMTJ3ZDJrcGR5ZDFkaHl4ciJ9.Gj2VU1wvxc7rFVt5E4KLOQ';

async function geocodeLocation(location) {
    try {
        const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json`, {
            params: {
                access_token: mapboxAccessToken
            }
        });
        const result = response.data.features[0];
        const coordinates = result.geometry.coordinates;
        return { type: "Point", coordinates };
    } catch (error) {
        console.error('Error geocoding location:', location, error);
        return null;
    }
}

async function addGeometryToEachListing(listings) {
    try {
        const updatedListings = [];
        for (const listing of listings) {
            const geometry = await geocodeLocation(listing.location);
            const updatedListing = { ...listing, geometry };
            updatedListings.push(updatedListing);
        }
        return updatedListings;
    } catch (error) {
        console.error('Error adding geometry to listings:', error);
    }
}

addGeometryToEachListing(listings.data)
    .then(updatedListings => initDB(updatedListings))
    .catch(error => console.error('Error:', error));


const initDB = async () => {
   await Listing.deleteMany({});
  initData.data=initData.data.map((obj)=>({...obj,owner:'66740515bacefabafeaaad67'})) 
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
