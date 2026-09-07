import { useEffect, useState } from "react";
import API from "../services/api";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Icon from "./Icon";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  useEffect(() => {
    const loadCartCount = async () => {
      const userId = localStorage.getItem("userId");
      if (!token || !userId) {
        setCartCount(0);
        return;
      }

      try {
        const res = await API.get(`/cart?user=${userId}`);
        const count = (Array.isArray(res.data) ? res.data : []).reduce(
          (total, item) => total + Number(item.quantity || 1),
          0,
        );
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();
    window.addEventListener("cart-updated", loadCartCount);
    return () => window.removeEventListener("cart-updated", loadCartCount);
  }, [token]);

  const closeMenu = () => setMenuOpen(false);
  const navClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  const logout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    closeMenu();
    navigate("/");
    setTimeout(() => window.location.reload(), 200);
  };

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">
            <Icon name="book" size={22} />
          </span>
          <span>StudyStore</span>
        </Link>

        <button
          className="menu-btn"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={24} />
        </button>

        <div className={`nav-panel ${menuOpen ? "active" : ""}`}>
        <ul className="nav-links">
  {role !== "admin" && (
    <>
      <li>
        <NavLink className={navClass} to="/" onClick={closeMenu}>
          <Icon name="home" />
          Home
        </NavLink>
      </li>

      <li>
        <NavLink className={navClass} to="/cart" onClick={closeMenu}>
          <Icon name="cart" />
          Cart <span className="nav-count">{cartCount}</span>
        </NavLink>
      </li>

      <li>
        <NavLink className={navClass} to="/orders" onClick={closeMenu}>
          <Icon name="package" />
          Orders
        </NavLink>
      </li>

      <li>
        <NavLink className={navClass} to="/wishlist" onClick={closeMenu}>
          <Icon name="heart" />
          Wishlist
        </NavLink>
      </li>
    </>
  )}

  {role === "admin" && (
    <>
      <li>
        <NavLink className={navClass} to="/admin" onClick={closeMenu}>
          <Icon name="admin" />
          Admin
        </NavLink>
      </li>

      <li>
        <NavLink
          className={navClass}
          to="/admin-orders"
          onClick={closeMenu}
        >
          <Icon name="package" />
          Manage
        </NavLink>
      </li>
    </>
  )}
</ul>

          <div className="nav-actions">
            {token ? (
              <>
                <NavLink
                  className="profile-link"
                  to="/profile"
                  onClick={closeMenu}
                >
                  <Icon name="user" />
                  <span>{name || "Profile"}</span>
                </NavLink>
                <button className="btn btn-outline btn-small" onClick={logout}>
                  <Icon name="logout" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-ghost btn-small"
                  to="/login"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  className="btn btn-primary btn-small"
                  to="/register"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {menuOpen && (
        <button
          className="nav-overlay"
          aria-label="Close navigation"
          onClick={closeMenu}
        />
      )}
    </header>
  );
}
export default Navbar;
