import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "../components/Icon";
import {
  getProductImage,
  useFallbackImage,
} from "../utils/productImage";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await API.get("/wishlist");

      setWishlist(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Wishlist could not load"
      );
    }
  }, []);

  useEffect(() => {
    fetchWishlist();

    window.addEventListener(
      "wishlist-updated",
      fetchWishlist
    );

    return () =>
      window.removeEventListener(
        "wishlist-updated",
        fetchWishlist
      );
  }, [fetchWishlist]);

  const removeWishlist = async (id) => {
    try {
      await API.delete(`/wishlist/${id}`);

      setWishlist((items) =>
        items.filter((item) => item._id !== id)
      );

      window.dispatchEvent(
        new Event("wishlist-updated")
      );

      toast.success("Removed from Wishlist");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not remove item"
      );
    }
  };

  return (
    <div className="wishlist-page">

      <h1>My Wishlist</h1>

      {wishlist.length === 0 ? (

        <div className="empty-state">
          <Icon name="heart" size={38} />

          <h2>
            Your Wishlist is Empty
          </h2>
        </div>

      ) : (

        <div className="products-container">

          {wishlist.map(
            (item) =>
              item.product && (

                <div
                  className="product-card"
                  key={item._id}
                  onClick={() =>
                    navigate(
                      `/product/${item.product._id}`
                    )
                  }
                >

                  <div className="product-media">

                    <img
                      src={getProductImage(
                        item.product.image
                      )}
                      onError={useFallbackImage}
                      alt={item.product.name}
                      className="product-image"
                    />

                  </div>

                  <div className="product-content">

                    <h3>
                      {item.product.name}
                    </h3>

                    <p className="product-description">
                      {item.product.description}
                    </p>

                    <p className="price">
                      ₹{item.product.price}
                    </p>

                    <button
                      className="btn btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWishlist(item._id);
                      }}
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
          )}

        </div>

      )}

    </div>
  );
}

export default Wishlist;