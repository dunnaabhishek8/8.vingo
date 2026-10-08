import mongoose from "mongoose";

const deliveryAssignmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    shopOrderId:{
         type: mongoose.Schema.Types.ObjectId,
         required:true
    },
    brodcastedTo:[
        {
         type: mongoose.Schema.Types.ObjectId,
         ref:"User"
    }
    ],
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
         ref:"User",
         default:null
    },
    status:{
        type:String,
        enum:["brodcasted","assigned","completed","cancelled"],
        default:"brodcasted"
    }
    ,
    acceptedAt:Date
}, { timestamps: true })

deliveryAssignmentSchema.index({ status: 1, createdAt: -1 })
deliveryAssignmentSchema.index({ assignedTo: 1, status: 1 })

const DeliveryAssignment=mongoose.model("DeliveryAssignment",deliveryAssignmentSchema)
export default DeliveryAssignment