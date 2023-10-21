const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('../models/campground.cjs');
const cities = require('./cities')
const {places , descriptors } = require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

const sample = array => array[Math.floor(Math.random()*array.length)];
const seedDB = async()=>{
    await Campground.deleteMany({});
    for(let i=0 ; i<50 ; i++){
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            location : `${cities[random1000].city}  , ${cities[random1000].state}`,
            title : `${sample(descriptors)} ${sample(places)}` , 
            image : "https://source.unsplash.com/random/?campgrounds",
            description : "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio natus voluptates inventore iste, ipsa ipsum quibusdam praesentium corrupti neque harum nulla mollitia molestiae delectus minus omnis! Omnis velit repudiandae fugiat.",
            price

        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})