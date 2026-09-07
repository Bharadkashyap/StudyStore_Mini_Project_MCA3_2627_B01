const r=require('express').Router(); const c=require('../controllers/couponController'); const {protect,adminOnly}=require('../middleware/authMiddleware');
r.post('/validate',protect,c.validateCoupon); r.get('/',protect,adminOnly,c.getCoupons); r.post('/',protect,adminOnly,c.createCoupon); r.delete('/:id',protect,adminOnly,c.deleteCoupon); module.exports=r;
