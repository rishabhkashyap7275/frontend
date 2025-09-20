import React, { useState, useContext } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { StoreContext } from "../Context/StoreContext";


import { useNavigate } from "react-router-dom";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { token, user, setToken, setUser } = useContext(StoreContext);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackId, setTrackId] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  const handleTrackOrder = (e) => {
    e.preventDefault();
    if (trackId.trim()) {
      setShowTrackModal(false);
      navigate(`/track/${trackId.trim()}`);
      setTrackId("");
    }
  };

  return (
    <div className="navbar">
      <Link to="/">
        <div className="logo">
          <h2>
            <span>A</span>llenhouse
            <span> E</span>atery
          </h2>
        </div>
      </Link>
      <ul className="navbar-menu">
        <Link
          to="/"
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>
        <a
          href="#explore-menu"
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </a>
        <a
          href="#app-download"
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          Mobile App
        </a>
        <a
          href="#footer"
          onClick={() => setMenu("contact-us")}
          className={menu === "contact-us" ? "active" : ""}
        >
          Contact Us
        </a>
      </ul>
  <div className="navbar-right">
        <Link to="/search" className="search-link">
          <img src={assets.search_icon} alt="Search" />
        </Link>
        <div className="navbar-search-icon">
          <Link to="/cart">
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className="dot"></div>
        </div>
        
        {token && user ? (
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Hi, {user.name}!</span>
              <span className="user-email">{user.email}</span>
            </div>
            <div className="user-actions">
              <Link to="/profile" className="profile-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="signin-btn">
            Sign In
          </button>
        )}
      </div>

    </div>
  );
};

export default Navbar;
