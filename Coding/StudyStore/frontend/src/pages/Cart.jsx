import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import {
  getProductImage,
  useFallbackImage,
} from "../utils/productImage";
import "./Cart.css";

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const nav = useNavigate();

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const res = await API.get("/cart");

      setItems(res.data || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
        "Cart could not load"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const qty = async (item, newQuantity) => {
    try {
      // Update backend
      await API.patch(`/cart/${item._id}`, {
        quantity: newQuantity,
      });

      // Update UI locally without reloading cart
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem._id === item._id
            ? {
                ...currentItem,
                quantity: newQuantity,
              }
            : currentItem
        )
      );

      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
        "Quantity update failed"
      );
    }
  };

  const remove = async (id) => {
    try {
      await API.delete(`/cart/${id}`);

      toast.success("Removed");

      // Remove directly from UI
      setItems((currentItems) =>
        currentItems.filter((item) => item._id !== id)
      );

      window.dispatchEvent(new Event("cart-updated"));
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
        "Item could not be removed"
      );
    }
  };

  const total = items.reduce(
    (total, item) =>
      total +
      (item.product?.price || 0) * item.quantity,
    0
  );

  if (loading) {
    return (
      <div className="cart-container">
        <h2>Loading cart...</h2>
      </div>
    );
  }

  return (
    <div className="cart-container">

      <h2 className="cart-title">
        My Cart
      </h2>

      {!items.length ? (

        <div className="empty-cart">

          <h3>Your cart is empty</h3>

          <button
            type="button"
            className="continue-shopping-btn"
            onClick={() => nav("/")}
          >
            Continue Shopping
          </button>

        </div>

      ) : (

        <>
          <div className="cart-items-list">

            {items.map((item) => (

              <div
                className="cart-item"
                key={item._id}
              >

                {/* Product Image */}
                <div className="cart-image-box">

                  <img
                    src={getProductImage(
                      item.product?.image
                    )}
                    onError={useFallbackImage}
                    className="cart-product-image"
                    alt={item.product?.name || "Product"}
                  />

                </div>


                {/* Product Details */}
                <div className="cart-item-details">

                  <h3>
                    {item.product?.name}
                  </h3>

                  <p>
                    ₹{item.product?.price} each
                  </p>


                  {/* Quantity */}
                  <div className="quantity-control">

                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        qty(
                          item,
                          item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {item.quantity}
                    </strong>

                    <button
                      type="button"
                      disabled={
                        item.quantity >=
                        item.product?.stock
                      }
                      onClick={() =>
                        qty(
                          item,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>


                  <p>
                    Subtotal:{" "}
                    <strong>
                      ₹
                      {(item.product?.price || 0) *
                        item.quantity}
                    </strong>
                  </p>

                </div>


                {/* Remove */}
                <button
                  type="button"
                  className="remove-cart-btn"
                  onClick={() =>
                    remove(item._id)
                  }
                >
                  Remove
                </button>

              </div>

            ))}

          </div>


          {/* Cart Summary */}
          <div className="cart-summary">

            <h2>
              Grand Total: ₹{total}
            </h2>

            <button
              type="button"
              className="buy-btn"
              onClick={() =>
                nav("/checkout")
              }
            >
              Proceed To Checkout
            </button>

          </div>

        </>

      )}

    </div>
  );
}
