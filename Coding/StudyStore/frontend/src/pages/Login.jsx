import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {

    e.preventDefault();

    try {

      const res = await API.post("/users/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("role", res.data.role);

      toast.success("Login Successful");

      setEmail("");
      setPassword("");

      if (res.data.role === "admin") {
  navigate("/admin");
} else {
  navigate("/");
}

      setTimeout(() => {
        window.location.reload();
      }, 300);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Invalid Email or Password"
      );

      setPassword("");
    }

  };

  return (

    <div className="auth-container">

      <div className="auth-card">

        <h2>Login</h2>

        <form onSubmit={loginUser}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <p
            onClick={() => navigate("/forgot-password")}
            style={{
              textAlign: "right",
              margin: "8px 0 15px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Forgot Password?
          </p>

          <button type="submit">
            Login
          </button>

          <p style={{ marginTop: "15px", textAlign: "center" }}>
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              style={{
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Register
            </span>
          </p>

        </form>

      </div>

    </div>

  );

}

export default Login;
