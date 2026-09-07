import{useEffect,useState}from'react';
import{useParams,useNavigate}from'react-router-dom';
import ProductCard from'../components/ProductCard';
import toast from'react-hot-toast';
import API from'../services/api';
import{getProductImage,useFallbackImage}from'../utils/productImage';

export default function ProductDetails(){

const{id}=useParams(),nav=useNavigate();

const[p,setP]=useState(null),
[related,setRelated]=useState([]),
[reviews,setReviews]=useState([]),
[rating,setRating]=useState(5),
[comment,setComment]=useState(''),
[isWishlisted,setIsWishlisted]=useState(false);


const load=async()=>{

try{

const[x,all,r]=await Promise.all([
API.get(`/products/${id}`),
API.get('/products'),
API.get(`/reviews/${id}`)
]);

setP(x.data);

setRelated(
all.data
.filter(
a=>a.category===x.data.category&&a._id!==id
)
.slice(0,4)
);

setReviews(r.data);

}catch(e){

toast.error('Product could not load');

}

};


const checkWishlist=async()=>{

try{

const userId=localStorage.getItem('userId');

if(!userId){
return;
}

const res=await API.get(
`/wishlist?user=${userId}`
);

const wishlistItems=res.data||[];

const item=wishlistItems.find(
item=>item.product?._id===id
);

setIsWishlisted(!!item);

}catch(e){

console.error(
'Wishlist check error:',
e
);

}

};


useEffect(()=>{

load();
checkWishlist();

},[id]);


const add=async()=>{

try{

await API.post('/cart',{
product:id,
quantity:1
});

toast.success('Added to cart');

window.dispatchEvent(
new Event('cart-updated')
);

}catch(e){

if(e.response?.status===401){

nav('/login');

}else{

toast.error(
e.response?.data?.message||
'Could not add'
);

}

}

};


const toggleWishlist=async()=>{

try{

const userId=localStorage.getItem('userId');

if(!userId){

nav('/login');
return;

}

const res=await API.post(
'/wishlist/toggle',
{
user:userId,
product:id
}
);


setIsWishlisted(
res.data.active
);


toast.success(
res.data.message||
(
res.data.active
?'Added to Wishlist'
:'Removed from Wishlist'
)
);


}catch(e){

if(e.response?.status===401){

nav('/login');

}else{

toast.error(
e.response?.data?.message||
'Wishlist update failed'
);

}

}

};


const review=async e=>{

e.preventDefault();

try{

await API.post(`/reviews/${id}`,{

rating:Number(rating),
comment

});

toast.success('Review saved');

setComment('');

load();

}catch(e){

toast.error(
e.response?.data?.message||
'Review failed'
);

}

};


if(!p)

return(
<h2
style={{
textAlign:'center',
margin:'100px'
}}
>
Loading...
</h2>
);


return <>

<div className="product-details-container">

<div className="product-details-left">

<img
src={getProductImage(p.image)}
onError={useFallbackImage}
alt={p.name}
className="details-image"
/>


<div className="details-buttons">

<button
className="cart-btn"
onClick={add}
>
Add To Cart
</button>


<button
className="buy-btn"
onClick={async()=>{

await add();
nav('/cart');

}}
>
Buy Now
</button>


<button
className="wishlist-btn"
onClick={toggleWishlist}
type="button"
>
{isWishlisted
?'♥ Remove from Wishlist'
:'♡ Add to Wishlist'}
</button>

</div>

</div>


<div className="product-details-right">

<h1>{p.name}</h1>


<div className="rating">

★ {Number(p.averageRating||0).toFixed(1)} / 5

<span>
({p.reviewCount||0} reviews)
</span>

</div>


<h2 className="details-price">
₹ {p.price}
</h2>


<p className="stock">
In Stock ({p.stock})
</p>


<p>
<strong>Category:</strong> {p.category}
</p>


<hr/>


<h3>Description</h3>

<p>{p.description}</p>


<div className="extra-info">

<p>Fast Delivery</p>
<p>Secure Checkout</p>
<p>Cash On Delivery</p>
<p>PayPal Ready</p>

</div>

</div>

</div>


<section className="review-section">

<h2>Customer Reviews</h2>


<form
className="review-form"
onSubmit={review}
>


<select
value={rating}
onChange={e=>setRating(e.target.value)}
>

{[5,4,3,2,1].map(n=>

<option
key={n}
value={n}
>
{n} Star{n>1?'s':''}
</option>

)}

</select>


<textarea
value={comment}
onChange={e=>setComment(e.target.value)}
placeholder="Write your review"
required
/>


<button>
Submit Review
</button>


<small>
Only customers whose order was delivered can review.
</small>

</form>


<div className="reviews-list">

{reviews.map(r=>

<article
className="review-card"
key={r._id}
>

<strong>
{r.user?.name||'Customer'} · {'★'.repeat(r.rating)}
</strong>


<p>
{r.comment}
</p>


<small>
{new Date(r.createdAt).toLocaleDateString()}
</small>

</article>

)}

</div>

</section>


<section className="related-section">

<h2 className="related-title">
You May Also Like
</h2>


<div className="products-container">

{related.map(x=>

<ProductCard
key={x._id}
product={x}
/>

)}

</div>

</section>

</>;

}
