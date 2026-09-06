import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/Login.css";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!form.email || !form.password) {
            setError("Please fill in both email and password.");
            return;
        }
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (response.ok) {
                // 🟢 FIXED: Ab har user ki unique ID, Name, aur Details properly save hongi
                localStorage.setItem("token", data.token || "temporary-token");
                localStorage.setItem("role", data.role);
                localStorage.setItem("userId", data.id);       // 👈 Ye line sabse important hai!
                localStorage.setItem("userName", data.name);   // 👈 Ye bhi!
                localStorage.setItem("email", data.email);     // 👈 Ye bhi!

                if (data.role === "ADMIN") navigate("/admin/dashboard");
                else if (data.role === "DOCTOR") navigate("/doctor/dashboard");
                else if (data.role === "RECEPTIONIST") navigate("/receptionist/dashboard");
                else navigate("/patient/dashboard");
            } else {
                setError(data.message || "Invalid email or password.");
            }
        } catch (err) {
            setError("Server connected nahi hai. Please backend check karein.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-form-side">
                    <div className="auth-form-top">
                        <h1 className="auth-title">Sign in</h1>
                        <div className="auth-brand-mini"><span className="auth-brand-mini-dot" />SmartQueue</div>
                    </div>

                    <div onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(e); }}>
                        {error && <div className="auth-error" style={{background: '#ffebebeb', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px'}}>{error}</div>}

                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input name="email" type="email" className="auth-input" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="off" required />
                        </div>
                        <div className="auth-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="auth-label">Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '12px', color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    name="password"
                                    type="text"
                                    className="auth-input"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    style={{
                                        WebkitTextSecurity: showPassword ? 'none' : 'disc',
                                        paddingRight: '55px'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        color: '#059669',
                                        fontWeight: '600',
                                        padding: '4px 6px'
                                    }}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>
                        <button type="button" onClick={handleSubmit} className="auth-submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </div>
                    <p className="auth-mobile-switch">New patient? <a href="/register">Create account</a></p>
                </div>
                <div className="auth-panel-side">
                    <div className="auth-panel-badge"><div className="auth-panel-badge-inner" /></div>
                    <h2>Welcome to SmartQueue</h2>
                    <p>New patient? Create an account to book your spot and skip the wait.</p>
                    <a href="/register" className="auth-panel-pill">Create account</a>
                </div>
            </div>
        </div>
    );
}