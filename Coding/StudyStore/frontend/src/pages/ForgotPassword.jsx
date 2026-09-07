import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

function ForgotPassword() {

  const [email, setEmail] = useState("");

  const sendResetLink = async (e) => {

    e.preventDefault();

    try {

      const res = await API.post("/users/forgot-password", {
        email
      });

      toast.success(res.data.message);

      setEmail("");

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );

    }

  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2>Forgot Password</h2>

        <form onSubmit={sendResetLink}>

          <input
            type="email"
            placeholder="Enter Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <br /><br />

          <button type="submit">
            Send Reset Link
          </button>

        </form>

      </div>

    </div>

  );

}

export default ForgotPassword;