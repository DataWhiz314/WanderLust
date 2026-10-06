const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js"); 

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",")
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//index route
router.get("/",wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings })
}))

//new route
router.get("/new", isLoggedIn, (req,res)=>{
    console.log(req.user);
    res.render("listings/new.ejs")
});

//show route
router.get("/:id",wrapAsync(async (req,res)=>{
    let {id}= req.params;
    const allData = await Listing.findById(id).populate("reviews");
    if(!allData){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings")
    }
    res.render("listings/show.ejs",{ allData });
}));

//Create Route
router.post("/",validateListing,isLoggedIn,
        wrapAsync(async (req,res)=>{
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New Listing created!");
        res.redirect("/listings");
    })
);


//Edit Route
router.get("/:id/edit",isLoggedIn ,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested to edit does not exist!");
        return res.redirect("/listings")
    }
    res.render("listings/edit.ejs",{ listing })
}));

//Update route
router.put("/:id",validateListing,isLoggedIn,
    wrapAsync(async (req,res)=>{
        let {id}= req.params;
        console.log(req.body); 
        await Listing.findByIdAndUpdate(id, { ...req.body.listing});
        req.flash("success", "Listing Updated!");
        res.redirect(`/listings/${id}`);
    })
);

//destroy route
router.delete("/:id",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}= req.params;
    let del = await Listing.findByIdAndDelete(id);
    console.log(del);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
    })
);



module.exports = router;