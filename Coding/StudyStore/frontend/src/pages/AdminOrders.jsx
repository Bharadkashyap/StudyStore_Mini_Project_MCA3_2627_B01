import { useEffect, useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await API.get("/orders");
    setOrders(res.data);
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/${id}`, { status });

      toast.success("Status Updated Successfully");

      fetchOrders();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="admin-orders-page">

      <div className="admin-orders-header">
        <div>
          <span className="admin-orders-eyebrow">
            ADMIN PANEL
          </span>

          <h1>Manage Orders</h1>

          <p>
            View customer orders and update their delivery status.
          </p>
        </div>

        <div className="admin-order-count">
          <strong>{orders.length}</strong>
          <span>Total Orders</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="admin-orders-empty">
          <h2>No Orders Found</h2>

          <p>
            Customer orders will appear here after an order is placed.
          </p>
        </div>
      ) : (

        <div className="admin-orders-grid">

          {orders.map((order) => (

            <div
              className="admin-order-card"
              key={order._id}
            >

              <div className="admin-order-top">

                <div>
                  <span className="admin-order-label">
                    ORDER
                  </span>

                  <h2>
                    #{order._id.slice(-6)}
                  </h2>
                </div>

                <span
                  className={`admin-order-status ${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>

              </div>


              <div className="admin-order-info">

                <div className="admin-info-item">

                  <span>Customer</span>

                  <strong>
                    {order.user?.name || "Unknown Customer"}
                  </strong>

                </div>


                <div className="admin-info-item">

                  <span>Amount</span>

                  <strong>
                    ₹{order.totalAmount}
                  </strong>

                </div>

              </div>


              <div className="admin-status-section">

                <label>
                  Update Order Status
                </label>

                <select
                  value={order.status}
                  onChange={(e) =>
                    updateStatus(
                      order._id,
                      e.target.value
                    )
                  }
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>

                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default AdminOrders;
