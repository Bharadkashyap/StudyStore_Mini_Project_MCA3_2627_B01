import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Icon from "./Icon";
import { getProductImage, useFallbackImage } from "../utils/productImage";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    if (!userId) return;
    API.get(`/wishlist?user=${userId}`)
      .then((res) =>
        setWishlisted(
          res.data.some((item) => item.product?._id === product._id),
        ),
      )
      .catch(() => {});
  }, [product._id, userId]);

  const addToCart = async () => {
    if (!userId) return toast.error("Please login first");
    try {
      await API.post("/cart", {
        user: userId,
        product: product._id,
        quantity: 1,
      });
      window.dispatchEvent(new Event("cart-updated"));
      toast.success("Product added to cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

  const toggleWishlist = async (e) => {
    e.stopPropagation();
    if (!userId) return toast.error("Please login first");
    try {
      const res = await API.post("/wishlist/toggle", {
        user: userId,
        product: product._id,
      });
      setWishlisted(res.data.active);
      toast.success(res.data.message);
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Wishlist update failed");
    }
  };

  return (
    <article
      className="product-card"
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="product-media">
        <img
          src={getProductImage(product.image)}
          onError={useFallbackImage}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <button
          className={`heart-btn ${wishlisted ? "active" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={toggleWishlist}
        >
          <Icon name="heart" />
        </button>
      </div>
      <div className="product-content">
        <span className="product-category">
          {product.category || "Student Essential"}
        </span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <span className="price">₹{product.price}</span>
          <span className={product.stock > 0 ? "stock-pill" : "stock-pill out"}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        <button
          className="btn btn-primary product-button"
          onClick={(e) => {
            e.stopPropagation();
            addToCart();
          }}
          disabled={product.stock <= 0}
        >
          <Icon name="cart" />
          Add to Cart
        </button>
      </div>
    </article>
  );
}
export default ProductCard;
