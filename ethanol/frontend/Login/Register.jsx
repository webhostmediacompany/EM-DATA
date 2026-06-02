import { useState } from "react";
import { api } from "../Problemetic/api";
import { useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullname: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        try {
            const response = await api.post("/register/", {
                fullname: formData.fullname,
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                alert("✅ Registration successful!");
                navigate("/loginpage");  // redirect to login page
            } else {
                alert("❌ " + (response.data.error || "Unknown error"));
            }
        } catch (error) {
            alert("❌ " + (error.response?.data?.error || "Server error"));
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Full Name</label>
                        <input type="text" name="fullname" required value={formData.fullname} onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label>Confirm Password</label>
                        <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} />
                    </div>

                    <button type="submit">Register</button>
                </form>

                <div className="login-links">
                    <a href="/loginpage">Already have an account?</a>
                    <a href="/forgottenpassword">Forgot Password?</a>
                </div>
            </div>
        </div>
    );
}
