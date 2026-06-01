import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./ForgottenPassword.css";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const token = params.get("token");
    const uid = params.get("uid");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        try {
            const res = await axios.post("http://127.0.0.1:8081/api/reset-password/", {
                token: token,
                uid: uid,
                password: password
            });

            alert("✅ " + res.data.message);
            navigate("/loginpage");  // Redirect to login

        } catch (error) {
            alert("❌ " + (error.response?.data?.error || "Something went wrong"));
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h2 className="login-title">Reset Password</h2>
                <p className="login-subtitle">Enter your new password</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button className="login-btn" type="submit">
                        Reset Password
                    </button>
                </form>

            </div>
        </div>
    );
}
