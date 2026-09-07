import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";
export default function Register() {
  const nav = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    state: "Gujarat",
    pincode: "",
    otp: "",
  });
  const change = (e) => setF({ ...f, [e.target.name]: e.target.value });
  const sendOtp = async () => {
    if (!f.email) return toast.error("Enter email first");
    try {
      setBusy(true);
      await API.post("/users/send-register-otp", { email: f.email });
      setOtpSent(true);
      toast.success("OTP sent to email");
    } catch (e) {
      toast.error(e.response?.data?.message || "OTP failed");
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await API.post("/users/register", f);
      toast.success("Registration successful");
      nav("/login");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <h2>Create Account</h2>
        <p>
          Register once and your delivery details will be ready at checkout.
        </p>
        <form onSubmit={submit}>
          <input
            name="name"
            value={f.name}
            onChange={change}
            placeholder="Full Name"
            required
          />
          <input
            type="email"
            name="email"
            value={f.email}
            onChange={change}
            placeholder="Email"
            required
          />
          <input
            name="phone"
            value={f.phone}
            onChange={change}
            placeholder="10 digit mobile"
            maxLength="10"
            required
          />
          <input
            type="password"
            name="password"
            value={f.password}
            onChange={change}
            placeholder="Strong Password"
            required
          />
         <textarea
  name="address"
  value={f.address}
  onChange={change}
  placeholder="Enter your address"
  rows="3"
  required
/>
          <div className="checkout-row">
            <input
              name="city"
              value={f.city}
              onChange={change}
              placeholder="City"
              required
            />
            <input
              name="state"
              value={f.state}
              onChange={change}
              placeholder="State"
              required
            />
          </div>
          <input
            name="pincode"
            value={f.pincode}
            onChange={change}
            placeholder="6 digit pincode"
            maxLength="6"
            required
          />
          {otpSent && (
            <input
              name="otp"
              value={f.otp}
              onChange={change}
              placeholder="Enter 6 digit email OTP"
              maxLength="6"
              required
            />
          )}
          <button type="button" onClick={sendOtp} disabled={busy}>
            {otpSent ? "Resend OTP" : "Send Email OTP"}
          </button>
          {otpSent && (
            <button type="submit" disabled={busy}>
              {busy ? "Please wait..." : "Verify OTP & Register"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
