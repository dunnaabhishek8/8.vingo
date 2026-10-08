import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required:true
    },
    order:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required:true
    },
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        required:true
    },
    text:{
        type:String,
        default:"",
        maxlength:500
    }
}, { timestamps: true })

// One review per item per completed order — prevents duplicates at DB level
reviewSchema.index({ order: 1, item: 1 }, { unique: true })
reviewSchema.index({ item: 1, createdAt: -1 })
reviewSchema.index({ shop: 1, createdAt: -1 })

const Review=mongoose.model("Review",reviewSchema)
export default Review