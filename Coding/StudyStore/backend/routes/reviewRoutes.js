const r=require('express').Router(); const c=require('../controllers/reviewController'); const {protect}=require('../middleware/authMiddleware');
r.get('/:productId',c.getReviews); r.post('/:productId',protect,c.saveReview); module.exports=r;
