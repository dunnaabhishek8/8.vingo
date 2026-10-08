import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },
    type:{
        type:String,
        enum:["percent","flat"],
        required:true
    },
    value:{
        type:Number,
        required:true,
        min:1
    },
    minOrderAmount:{
        type:Number,
        default:0
    },
    maxDiscount:{
        type:Number,
        default:null
    },
    expiresAt:{
        type:Date,
        required:true
    },
    usageLimit:{
        type:Number,
        default:null
    },
    usedCount:{
        type:Number,
        default:0
    },
    firstOrderOnly:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, { timestamps: true })

const Coupon=mongoose.model("Coupon",couponSchema)
export default Coupon