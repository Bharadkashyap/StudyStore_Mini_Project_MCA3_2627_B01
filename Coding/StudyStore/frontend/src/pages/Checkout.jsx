import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
import { getProductImage, useFallbackImage } from "../utils/productImage";

export default function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "Cash On Delivery",
  });

  // =========================
  // LOAD CART + USER PROFILE
  // =========================
  useEffect(() => {
    const loadCheckout = async () => {
      try {
        const [cartResponse, profileResponse] = await Promise.all([
          API.get("/cart"),
          API.get("/users/profile"),
        ]);

        setCart(cartResponse.data);

        const user = profileResponse.data;

        setForm((current) => ({
          ...current,
          name: user.name || "",
          phone: user.phone || "",
          address: user.address || "",
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
        }));
      } catch (error) {
        console.error("Checkout load error:", error);

        toast.error(error.response?.data?.message || "Checkout could not load");
      }
    };

    loadCheckout();
  }, []);

  // =========================
  // TOTAL
  // =========================
  const subtotal = cart.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0,
  );

  const total = Math.max(0, subtotal - discount);

  // =========================
  // INPUT CHANGE
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================
  // ADDRESS PAYLOAD
  // =========================
  const addressPayload = () => ({
    name: form.name,
    phone: form.phone,
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
  });

  // =========================
  // VALIDATION
  // =========================
  const validateCheckout = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      toast.error("Complete delivery address");
      return false;
    }

    if (!/^\d{10}$/.test(form.phone.trim())) {
      toast.error("Enter a valid 10 digit phone number");
      return false;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error("Enter a valid 6 digit pincode");
      return false;
    }

    if (!cart.length) {
      toast.error("Your cart is empty");
      return false;
    }

    if (total < 1) {
      toast.error("Order amount must be at least ₹1");
      return false;
    }

    return true;
  };

  // =========================
  // APPLY COUPON
  // =========================
  const applyCoupon = async () => {
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      const response = await API.post("/coupons/validate", {
        code: coupon,
        total: subtotal,
      });

      setDiscount(response.data.discount);

      setCoupon(response.data.code);

      toast.success(`Coupon applied: ₹${response.data.discount} off`);
    } catch (error) {
      setDiscount(0);

      toast.error(error.response?.data?.message || "Invalid coupon");
    }
  };

  // =========================
  // REMOVE COUPON
  // =========================
  const removeCoupon = () => {
    setCoupon("");
    setDiscount(0);

    toast.success("Coupon removed");
  };

  // =========================
  // CASH ON DELIVERY
  // =========================
  const placeCodOrder = async () => {
    await API.post("/orders", {
      address: addressPayload(),
      paymentMethod: "Cash On Delivery",
      couponCode: coupon,
    });

    toast.success("Order placed successfully");

    window.dispatchEvent(new Event("cart-updated"));

    navigate("/orders");
  };

  // =========================
  // RAZORPAY ONLINE PAYMENT
  // =========================
  const placeOnlineOrder = async () => {
    if (!window.Razorpay) {
      setBusy(false);

      toast.error("Razorpay checkout could not load");

      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKeyId) {
      setBusy(false);

      toast.error("VITE_RAZORPAY_KEY_ID is missing in frontend .env");

      return;
    }

    try {
      // Step 1:
      // Create Razorpay order
      // from backend
      const { data } = await API.post("/create-order", {
        address: addressPayload(),
        couponCode: coupon,
      });

      // =========================
      // RAZORPAY OPTIONS
      // =========================
      const options = {
        key: razorpayKeyId,

        amount: data.amount,

        currency: data.currency,

        name: "StudyStore",

        description: "StudyStore Order Payment",

        order_id: data.order_id,

        // Customer details
        prefill: {
          name: form.name,

          contact: form.phone,
        },

        // Optional order information
        notes: {
          address: form.address,

          city: form.city,

          state: form.state,

          pincode: form.pincode,
        },

        // =========================
        // PAYMENT SUCCESS
        // =========================
        handler: async (response) => {
          try {
            setBusy(true);

            // Step 3:
            // Verify payment
            // from backend
            await API.post("/verify-payment", {
              attempt_id: data.attempt_id,

              razorpay_payment_id: response.razorpay_payment_id,

              razorpay_order_id: response.razorpay_order_id,

              razorpay_signature: response.razorpay_signature,
            });

            toast.success("Payment successful. Order placed!");

            window.dispatchEvent(new Event("cart-updated"));

            navigate("/orders");
          } catch (error) {
            console.error("Payment verification error:", error);

            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setBusy(false);
          }
        },

        // =========================
        // USER CLOSE PAYMENT WINDOW
        // =========================
        modal: {
          ondismiss: () => {
            setBusy(false);

            toast("Payment cancelled. Your cart is unchanged.");
          },
        },

        // Razorpay color
        theme: {
          color: "#4f46e5",
        },
      };

      // IMPORTANT:
      // NO config.display here.
      // So Razorpay can show
      // UPI + Cards +
      // Net Banking + more.

      const razorpay = new window.Razorpay(options);

      // =========================
      // PAYMENT FAILED
      // =========================
      razorpay.on("payment.failed", (response) => {
        setBusy(false);

        console.error("Razorpay payment failed:", response.error);

        toast.error(
          response.error?.description || "Payment failed. Please try again.",
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Razorpay order creation error:", error);

      setBusy(false);

      toast.error(
        error.response?.data?.message || "Unable to start online payment",
      );
    }
  };

  // =========================
  // PLACE ORDER
  // =========================
  const placeOrder = async () => {
    if (!validateCheckout()) {
      return;
    }

    try {
      setBusy(true);

      if (form.paymentMethod === "Online Payment") {
        await placeOnlineOrder();
        return;
      }

      await placeCodOrder();
    } catch (error) {
      console.error("Place order error:", error);

      setBusy(false);

      toast.error(error.response?.data?.message || "Order failed");
    } finally {
      if (form.paymentMethod !== "Online Payment") {
        setBusy(false);
      }
    }
  };

  return (
    <div className="checkout-page">
      {/* =========================
          PAGE HEADING
      ========================== */}
      <div className="checkout-heading">
        <span className="checkout-badge">SECURE CHECKOUT</span>

        <h1>Complete your order</h1>

        <p>
          Enter your delivery details, choose payment and review your items.
        </p>
      </div>

      <div className="checkout-layout">
        {/* =========================
            LEFT SIDE
        ========================== */}
        <section className="checkout-left">
          <div className="checkout-section-heading">
            <div>
              <span className="checkout-step">1</span>

              <div>
                <h2>Delivery Details</h2>

                <p>
                  Your profile details are filled automatically. You can edit
                  them here.
                </p>
              </div>
            </div>
          </div>

          <form
            className="checkout-form"
            onSubmit={(event) => {
              event.preventDefault();
              placeOrder();
            }}
          >
            {/* NAME + PHONE */}
            <div className="checkout-row">
              <div className="checkout-field">
                <label htmlFor="checkout-name">Full Name</label>

                <input
                  id="checkout-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-phone">Phone Number</label>

                <input
                  id="checkout-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10 digit phone number"
                  maxLength="10"
                  required
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="checkout-field">
              <label htmlFor="checkout-address">Complete Address</label>

              <textarea
                id="checkout-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House / flat, street, landmark"
                required
              />
            </div>

            {/* CITY + STATE + PINCODE */}
            <div className="checkout-row three-column">
              <div className="checkout-field">
                <label htmlFor="checkout-city">City</label>

                <input
                  id="checkout-city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-state">State</label>

                <input
                  id="checkout-state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-pincode">Pincode</label>

                <input
                  id="checkout-pincode"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6 digit pincode"
                  maxLength="6"
                  required
                />
              </div>
            </div>

            {/* =========================
                PAYMENT METHOD
            ========================== */}
            <div className="payment-section">
              <div className="payment-title-row">
                <div>
                  <h3>Payment Method</h3>

                  <p>Choose one payment option</p>
                </div>

                <span className="secure-chip">Secure Payment</span>
              </div>

              <div className="payment-options">
                {/* COD */}
                <label
                  className={`payment-card ${
                    form.paymentMethod === "Cash On Delivery" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash On Delivery"
                    checked={form.paymentMethod === "Cash On Delivery"}
                    onChange={handleChange}
                  />

                  <span className="payment-icon">₹</span>

                  <span className="payment-copy">
                    <strong>Cash on Delivery</strong>

                    <small>Pay when your order arrives</small>
                  </span>

                  <span className="payment-radio-dot" />
                </label>

                {/* ONLINE PAYMENT */}
                <label
                  className={`payment-card ${
                    form.paymentMethod === "Online Payment" ? "active" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online Payment"
                    checked={form.paymentMethod === "Online Payment"}
                    onChange={handleChange}
                  />

                  <span className="payment-icon upi-icon">₹</span>

                  <span className="payment-copy">
                    <strong>Online Payment</strong>

                    <small>UPI, Cards, Net Banking & more</small>
                  </span>

                  <span className="payment-radio-dot" />
                </label>
              </div>

              {form.paymentMethod === "Online Payment" && (
                <div className="upi-note">
                  Pay securely using Razorpay. Available payment methods may
                  include UPI, Cards, Net Banking and more.
                </div>
              )}
            </div>
          </form>
        </section>

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <aside className="checkout-right">
          <div className="checkout-section-heading">
            <div>
              <span className="checkout-step">2</span>

              <div>
                <h2>Order Summary</h2>

                <p>Review your items before payment.</p>
              </div>
            </div>
          </div>

          {cart.length > 0 ? (
            <>
              {/* PRODUCTS */}
              <div className="checkout-summary-products">
                {cart.map((item) => (
                  <div className="summary-item" key={item._id}>
                    <div className="summary-product">
                      <div className="checkout-image-box">
                        {item.product?.image ? (
                          <img
                            className="checkout-product-image"
                            src={getProductImage(item.product.image)}
                            alt={item.product?.name}
                            onError={useFallbackImage}
                          />
                        ) : (
                          <span className="checkout-no-image">No Image</span>
                        )}
                      </div>

                      <div className="summary-product-info">
                        <h4>{item.product?.name}</h4>

                        <p>
                          ₹{item.product?.price || 0} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <strong>
                      ₹{(item.product?.price || 0) * item.quantity}
                    </strong>
                  </div>
                ))}
              </div>

              {/* COUPON */}
              <div className="coupon-section">
                <label htmlFor="coupon">Coupon Code</label>

                <div className="coupon-entry">
                  <input
                    id="coupon"
                    value={coupon}
                    disabled={discount > 0}
                    onChange={(event) =>
                      setCoupon(event.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon"
                  />

                  <button
                    type="button"
                    className={discount > 0 ? "coupon-remove" : "coupon-apply"}
                    onClick={discount > 0 ? removeCoupon : applyCoupon}
                  >
                    {discount > 0 ? "Remove" : "Apply"}
                  </button>
                </div>

                {discount > 0 && (
                  <p className="coupon-success">
                    ✓ {coupon} applied — ₹{discount} saved
                  </p>
                )}
              </div>

              {/* PRICE */}
              <div className="price-breakdown">
                <div>
                  <span>Subtotal</span>

                  <strong>₹{subtotal}</strong>
                </div>

                {discount > 0 && (
                  <div className="discount-line">
                    <span>Discount</span>

                    <strong>−₹{discount}</strong>
                  </div>
                )}

                <div className="delivery-line">
                  <span>Delivery</span>

                  <strong>FREE</strong>
                </div>
              </div>

              {/* TOTAL */}
              <div className="checkout-grand-total">
                <span>Total</span>

                <strong>₹{total}</strong>
              </div>

              {/* BUTTON */}
              <button
                type="button"
                className="place-order-btn"
                disabled={busy || !cart.length}
                onClick={placeOrder}
              >
                {busy
                  ? "Please wait..."
                  : form.paymentMethod === "Online Payment"
                    ? `Pay ₹${total} Online`
                    : "Place COD Order"}
              </button>

              <p className="checkout-security-note">
                Your payment information is processed securely by Razorpay.
                StudyStore does not store your card, UPI or banking details.
              </p>
            </>
          ) : (
            <div className="checkout-empty">
              <p>Your cart is empty.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
