import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/Register.css";

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "", email: "", password: "", phone: "", age: "", gender: "", address: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Path updated to /auth/register to match SecurityConfig rules
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    age: parseInt(form.age, 10) || 0
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration Successful! Redirecting to Login...");
                navigate("/login");
            } else {
                setError(data.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Server connected nahi hai. Please backend check karein.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reg-page">
            <div className="reg-card">
                <div className="reg-form-side">
                    <div className="reg-form-top">
                        <h1 className="reg-title">Create Account</h1>
                        <div className="reg-brand-mini"><span className="reg-brand-mini-dot" />SmartQueue</div>
                    </div>

                    {error && <div className="auth-error" style={{background: '#ffebebeb', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px'}}>{error}</div>}

                    <form onSubmit={handleSubmit} className="reg-grid-form" autoComplete="off">
                        <div className="reg-field full-width">
                            <label className="reg-label">Full Name</label>
                            <input name="name" type="text" className="reg-input" placeholder="John Doe" value={form.name} onChange={handleChange} autoComplete="off" required />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Email Address</label>
                            <input name="email" type="email" className="reg-input" placeholder="john@example.com" value={form.email} onChange={handleChange} autoComplete="off" required />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Phone Number</label>
                            <input name="phone" type="tel" className="reg-input" placeholder="9876543210" value={form.phone} onChange={handleChange} autoComplete="off" required />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Password</label>
                            <input name="password" type="password" className="reg-input" placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="new-password" required />
                        </div>
                        <div className="reg-field">
                            <label className="reg-label">Age</label>
                            <input name="age" type="number" className="reg-input" placeholder="25" value={form.age} onChange={handleChange} required />
                        </div>
                        <div className="reg-field full-width">
                            <label className="reg-label">Gender</label>
                            <select name="gender" className="reg-input reg-select" value={form.gender} onChange={handleChange} required>
                                <option value="" disabled>Select Gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="reg-field full-width">
                            <label className="reg-label">Residential Address</label>
                            <input name="address" type="text" className="reg-input" placeholder="Street, City" value={form.address} onChange={handleChange} required />
                        </div>
                        <button type="submit" className="reg-submit full-width" disabled={loading}>
                            {loading ? "Registering..." : "Register as Patient"}
                        </button>
                    </form>
                    <p className="reg-footer-text">Already have an account? <a href="/login" className="reg-link">Sign In</a></p>
                </div>
                <div className="reg-panel-side">
                    <div className="reg-panel-badge"><div className="reg-panel-badge-inner" /></div>
                    <h2>Save Your Time</h2>
                    <p>Join SmartQueue today to track real-time OPD metrics and skip the wait.</p>
                </div>
            </div>
        </div>
    );
}