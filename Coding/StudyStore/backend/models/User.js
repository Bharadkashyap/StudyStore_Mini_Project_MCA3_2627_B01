const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    resetPasswordToken: {
    type: String,
    default: ""
},

resetPasswordExpire: {
    type: Date
},

    phone: {
    type: String,
    default: ""
},

address: {
    type: String,
    default: ""
},

city: {
    type: String,
    default: ""
},

state: {
    type: String,
    default: ""
},

pincode: {
    type: String,
    default: ""
},
    role:{
        type:String,
        enum:[ "user","admin" ],
        default:"user"
    }
},
    {
        timestamps:true
    }

)
module.exports=mongoose.model("User",userSchema);