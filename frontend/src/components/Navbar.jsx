import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">RFQ Marketplace</Link>
      </div>
      <div className="navbar-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-link-primary">Sign Up</Link>
          </>
        )}
        {user && user.role === "BUYER" && (
          <>
            <Link to="/buyer/rfqs">My RFQs</Link>
            <Link to="/buyer/rfqs/new">Create RFQ</Link>
          </>
        )}
        {user && user.role === "SUPPLIER" && (
          <>
            <Link to="/supplier/browse">Browse RFQs</Link>
            <Link to="/supplier/quotations">My Quotations</Link>
          </>
        )}
        {user && (
          <span className="navbar-user">
            {user.company_name || user.username} <em>({user.role})</em>
          </span>
        )}
        {user && (
          <button className="btn-link" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
