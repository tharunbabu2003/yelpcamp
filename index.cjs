const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground.cjs');
const wrapAsync = require('./utils/catchAsync.js')
const expressError = require('./utils/expressError.js')
const Joi = require('joi')
const {campgroundSchema} = require('./schemas.js')

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');


const validateCampground = (req , res , next) =>{
    const { error }= campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg , 400)
    }
    else{
        next()
    }
}

app.engine('ejs' , ejsMate)
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , 'views'))

// app.use(...) => any function inisde of app.use() will be applied to all the requests

app.use(express.urlencoded({extended : true}))
app.use(methodOverride("_method"));

app.get("/" , (req,res)=>{
    res.send("welcome to yelpcamp")
})

// Show All campgrounds //

app.get("/campgrounds" , wrapAsync(async(req,res , next)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index' ,{ campgrounds })
}))

// Show campgrounds ends //

// Creating campground //

app.get("/campgrounds/new" , (req,res)=>{
    res.render("campgrounds/new")
})

app.post("/campgrounds" , validateCampground , wrapAsync(async(req,res , next)=>{
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
}))

// End of creating campground //

// Show selected campground ( based on id )

app.get("/campgrounds/:id" , wrapAsync(async(req,res , next)=>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    res.render("campgrounds/show",{ campground })
}))

// Show selected campground ends //

// Edit a campground //

app.get("/campgrounds/:id/edit" , wrapAsync(async(req,res , next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit' , { campground })
}))

app.put("/campgrounds/:id" ,validateCampground , wrapAsync(async(req,res , next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id , { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Edit campground ends //

// Delete campground //

app.delete("/campgrounds/:id" , wrapAsync(async(req,res,next)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}))

// Delete campground ends //

// Error Handlers //
app.all('*' , (req , res , next)=>{
    next(new expressError('Page not found' , 404))
})

app.use((err , req , res , next)=>{
    const { statusCode = 500  , msg = 'Server side error' } = err
    if(!err.msg) err.msg = "Something wrong"
    res.render("error" , {err})
})

// Error Handlers ends //
app.listen(3001 , ()=>{
    console.log("port : 3001");
})