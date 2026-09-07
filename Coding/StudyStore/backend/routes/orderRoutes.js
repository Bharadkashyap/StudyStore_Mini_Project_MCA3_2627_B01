const r=require('express').Router();const c=require('../controllers/orderController');const {protect,adminOnly}=require('../middleware/authMiddleware');
r.post('/',protect,c.createOrder);r.get('/my',protect,c.getMyOrders);r.patch('/:id/cancel',protect,c.cancelOrder);r.get('/',protect,adminOnly,c.getOrders);r.put('/:id',protect,adminOnly,c.updateOrderStatus);module.exports=r;
