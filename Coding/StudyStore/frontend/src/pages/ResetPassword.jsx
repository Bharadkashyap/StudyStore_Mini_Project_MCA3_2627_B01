import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function ResetPassword() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [password, setPassword] = useState("");

  const resetPassword = async (e) => {

    e.preventDefault();

    try {

      const res = await API.put(
        `/users/reset-password/${token}`,
        { password }
      );

      toast.success(res.data.message);

      navigate("/login");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed To Reset Password"
      );

    }

  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2>Reset Password</h2>

        <form onSubmit={resetPassword}>

          <input
            type="password"
            placeholder="Enter New Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <br /><br />

          <button type="submit">
            Reset Password
          </button>

        </form>

      </div>

    </div>

  );

}

export default ResetPassword;