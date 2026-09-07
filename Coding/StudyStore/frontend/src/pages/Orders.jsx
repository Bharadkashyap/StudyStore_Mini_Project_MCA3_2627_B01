import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
export default function Orders() {
  const [o, setO] = useState([]);
  const load = async () => {
    try {
      setO((await API.get("/orders/my")).data);
    } catch (e) {
      toast.error("Orders could not load");
    }
  };
  useEffect(() => {
    load();
  }, []);
  const cancel = async (id) => {
    if (!confirm("Cancel this order?")) return;
    try {
      await API.patch(`/orders/${id}/cancel`, {
        reason: "Cancelled by customer",
      });
      toast.success("Order cancelled");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Cannot cancel order");
    }
  };
  return (
    <div className="orders-page">
      <h1 className="orders-title">My Orders</h1>
      {!o.length ? (
        <div className="empty-orders">
          <h2>No Orders Yet</h2>
        </div>
      ) : (
        <div className="orders-grid">
          {o.map((x) => (
            <div className="order-card" key={x._id}>
              <div className="order-header">
                <div>
                  <h2>Order #{x._id.slice(-6)}</h2>
                  <p>{new Date(x.createdAt).toLocaleString()}</p>
                </div>
                <span
                  className={`status ${x.status.toLowerCase().replaceAll(" ", "-")}`}
                >
                  {x.status}
                </span>
              </div>
              {x.products.map((i) => (
                <div className="order-product" key={i._id}>
                  <span>
                    {i.product?.name} × {i.quantity}
                  </span>
                  <strong>₹{(i.product?.price || 0) * i.quantity}</strong>
                </div>
              ))}
              <div className="order-footer">
                <div>
                  <p>
                    {x.paymentMethod} · {x.paymentStatus}
                  </p>
                  <p>
                    {x.address?.city}, {x.address?.state}
                  </p>
                  {x.couponCode && (
                    <p>
                      Coupon: {x.couponCode} (−₹{x.discountAmount})
                    </p>
                  )}
                </div>
                <h2>₹{x.totalAmount}</h2>
              </div>
              {["Pending", "Confirmed"].includes(x.status) && (
                <button className="delete-btn" onClick={() => cancel(x._id)}>
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
