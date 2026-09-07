const mongoose=require('mongoose');
const schema=new mongoose.Schema({email:{type:String,required:true,index:true},otpHash:{type:String,required:true},expiresAt:{type:Date,required:true}},{timestamps:true});
schema.index({expiresAt:1},{expireAfterSeconds:0});
module.exports=mongoose.model('RegistrationOtp',schema);
