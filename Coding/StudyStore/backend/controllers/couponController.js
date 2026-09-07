const Coupon=require('../models/Coupon');
function discount(c,total){let d=c.type==='percent'?total*c.value/100:c.value;if(c.maxDiscount>0)d=Math.min(d,c.maxDiscount);return Math.min(total,Math.round(d));}
exports.validateCoupon=async(req,res)=>{const code=String(req.body.code||'').trim().toUpperCase(), total=Number(req.body.total||0); const c=await Coupon.findOne({code,active:true,expiresAt:{$gt:new Date()}}); if(!c)return res.status(404).json({message:'Invalid or expired coupon'}); if(total<c.minOrder)return res.status(400).json({message:`Minimum order ₹${c.minOrder} required`}); const d=discount(c,total);res.json({valid:true,code:c.code,discount:d,total:total-d});};
exports.createCoupon=async(req,res)=>{try{res.status(201).json(await Coupon.create(req.body))}catch(e){res.status(400).json({message:e.message})}};
exports.getCoupons=async(req,res)=>res.json(await Coupon.find().sort({createdAt:-1}));
exports.deleteCoupon=async(req,res)=>{await Coupon.findByIdAndDelete(req.params.id);res.json({message:'Coupon deleted'})};
exports.getDiscount=discount;
