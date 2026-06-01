import { useState } from "react";
import axios from "axios";
import "./ForgottenPassword.css";

export default function ForgottenPassword() {
    const [email, setEmail] = useState("");

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     try {
    //         const res = await axios.post("http://127.0.0.1:8000/api/forgot-password/", {
    //             email: email
    //         });

    //         alert("📩 " + res.data.message);

    //     } catch (error) {
    //         alert("❌ " + (error.response?.data?.error || "Something went wrong"));
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://127.0.0.1:8081/api/forgot-password/", {
                email: email
            });

            // ✅ Auto redirect to reset page
            const resetUrl = res.data.reset_url;
            window.location.href = resetUrl;

        } catch (error) {
            alert("❌ " + (error.response?.data?.error || "Something went wrong"));
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Forgot Password</h2>
                <p className="login-subtitle">Enter your registered email to receive a reset link.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button className="login-btn" type="submit">
                        Send Reset Link
                    </button>
                </form>

                <div className="login-links">
                    <a href="/loginpage">Back to Login</a>
                    <a href="/register">Create Account</a>
                </div>
            </div>
        </div>
    );
}
