// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./App.css";
// Pages
import HomeRouteing from "../Home/HomeRouteing";
import Login from "../Login/Login";
import Register from "../Login/Register";
import ForgottenPassword from "../Login/ForgottenPassword";
import ResetPassword from "../Login/ResetPassword";
// Components
import Home from "../Home/HomeRouteing";
import EthanolMegaDashboard from "../ConnectingNav/EthanolMegaDashboard";
import Navbar from "../Home_Page_frontend_style/Navbar";
import Footer from "../Home_Page_frontend_style/Footer";
import MolassesDashboard from "../ConnectingNav/MolassesDashboard";
import Alertpage from "../Alert/Alertpage";
import Settings from "../setting/settings";
import ReadingForm from "../Problemetic/ReadingForm";
import HistoryDashboard from "../ConnectingNav/HistoryDashboard";

export default function App() {

  const [user, setUser] = useState(null);

  // Load saved user from localStorage at app start
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // On successful login
  const handleSignIn = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Logout
  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
  };


  return (
    <Router>
      {/* If NOT logged in → Always show Login page */}
      {!user ? (
        <Routes>
          <Route path="" element={<Login onSignIn={handleSignIn} />} />
          <Route path="/loginpage" element={<Login onSignIn={handleSignIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgottenpassword" element={<ForgottenPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

        </Routes>
      ) : (
        <>
          {/* Navbar Profile Menu */}

          {/* Routes available only if logged in */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />

            {/* If you want full dashboard routing */}
            <Route path="/dashboard" element={<HomeRouteing />} />
            <Route path="nexusdash" element={<><Navbar /> <ReadingForm /> <Footer /></>} />
            <Route path="EthanolNavDash" element={<><Navbar /> <EthanolMegaDashboard /> <Footer /></>} />
            <Route path="MolassesNavDash" element={<><Navbar /> <MolassesDashboard /> <Footer /></>} />
            <Route path="Alertdash" element={<><Navbar /> <Alertpage /> <Footer /></>} />
            <Route path="Settingsdash" element={<><Navbar /> <Settings /> <Footer /></>} />
            <Route path="historyDashboard" element={<><Navbar /> <HistoryDashboard /> <Footer /></>} />

          </Routes>
        </>
      )}
    </Router>
  );
}
