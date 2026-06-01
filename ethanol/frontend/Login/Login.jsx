import { useState } from "react";
import axios from "axios";
import "./Login.css";
import flamingoLogo from "../src/assets/flamingo.png";
import { useNavigate } from "react-router-dom";

export default function Login({ onSignIn }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://127.0.0.1:8081/api/login/",
                {
                    email: form.email,
                    password: form.password,
                }
            );

            alert("✅ Login successful!");

            const userData = {
                uid: response.data.uid,
                fullname: response.data.fullname,
                email: response.data.email,
                profilePic: response.data.profilePic || null,
            };

            // Save user
            localStorage.setItem("user", JSON.stringify(userData));

            // Pass to parent (App.jsx)
            onSignIn(userData);

            // ✅ Redirect after login
            navigate("/");   // This goes to http://localhost:5173

        } catch (error) {
            alert("❌ " + (error.response?.data?.error || "Login failed"));
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-logo-wrapper">
                    <img src={flamingoLogo} className="login-logo-img" alt="logo" />
                    <h2 className="login-logo-text">Go-Flamingo Connect...</h2>
                </div>

                <h3 className="login-title">Welcome Back</h3>
                <p className="login-subtitle">Please sign in to your account</p>

                <form onSubmit={handleSubmit} className="login-form">
                    <label className="login-label">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="login-input"
                        placeholder="Enter your email"
                        required
                    />

                    <label className="login-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="login-input"
                        placeholder="Enter password"
                        required
                    />

                    <button type="submit" className="login-btn">
                        Sign In
                    </button>
                </form>

                <div className="login-footer">
                    <a className="forgot-link" href="/forgottenpassword">
                        Forgot Password?
                    </a>
                    <p className="create-account-text">
                        Don't have an account?{" "}
                        <a className="create-link" href="/register">Create New Account</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
