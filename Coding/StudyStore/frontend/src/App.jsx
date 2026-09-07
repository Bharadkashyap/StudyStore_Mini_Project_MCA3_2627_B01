import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import AdminOrders from "./pages/AdminOrders";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import BackToTop from "./components/BackToTop";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Footer from "./components/Footer";

import { Routes, Route } from "react-router-dom";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>

  <Route path="/" element={<Home />} />

  <Route path="/product/:id" element={<ProductDetails />} />

  <Route
    path="/wishlist"
    element={
      <ProtectedRoute role="user">
        <Wishlist />
      </ProtectedRoute>
    }
  />

  <Route
    path="/checkout"
    element={
      <ProtectedRoute role="user">
        <Checkout />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route path="/login" element={<Login />} />

  <Route path="/register" element={<Register />} />

  <Route
    path="/cart"
    element={
      <ProtectedRoute role="user">
        <Cart />
      </ProtectedRoute>
    }
  />

  <Route
    path="/orders"
    element={
      <ProtectedRoute role="user">
        <Orders />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin"
    element={
      <ProtectedRoute role="admin">
        <Admin />
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin-orders"
    element={
      <ProtectedRoute role="admin">
        <AdminOrders />
      </ProtectedRoute>
    }
  />

  <Route
    path="/forgot-password"
    element={<ForgotPassword />}
  />

  <Route
    path="/reset-password/:token"
    element={<ResetPassword />}
  />

</Routes>      <BackToTop />

      <Footer />
    </>
    
  );
}

export default App;