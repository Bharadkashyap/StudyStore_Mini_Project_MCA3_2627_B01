import { Link } from "react-router-dom";
import Icon from "./Icon";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-inner">

        <div>
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark">
              <Icon name="book" size={22} />
            </span>

            <span>StudyStore</span>
          </Link>

          <p>
            Your trusted online destination for stationery,
            books, and essential student products.
          </p>
        </div>

        <div className="footer-links">

          <Link to="/">Home</Link>

          <Link to="/orders">Orders</Link>

          <Link to="/wishlist">Wishlist</Link>

          <Link to="/cart">Cart</Link>

          <Link to="/profile">Profile</Link>

        </div>

      </div>

      <div className="footer-bottom">

        <span>
          © 2026 StudyStore. All rights reserved.
        </span>

        <span>
           &nbsp;•&nbsp; Developed by{" "}
          <strong>Dhaval, Chirag & Kashyap</strong>
        </span>

      </div>

    </footer>
  );
}

export default Footer;
