import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/Login.css";

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false); // Remember me ke liye state
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Page load hote hi check karega agar pehle se koi email saved hai
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail");
        if (savedEmail) {
            setForm((prev) => ({ ...prev, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleCheckboxChange = (e) => {
        setRememberMe(e.target.checked);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await response.json();

            if (response.ok) {
                // Real JWT Token aur Role localStorage me save ho rahe hain
                localStorage.setItem("token", data.token);
                localStorage.setItem("role", data.role);

                // Remember me logic execution
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", form.email);
                } else {
                    localStorage.removeItem("rememberedEmail");
                }

                // Role ke mutabik correct dashboard pr redirect karega
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

                    <form onSubmit={handleSubmit}>
                        {error && <div className="auth-error" style={{background: '#ffebebeb', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px'}}>{error}</div>}

                        <div className="auth-field">
                            <label className="auth-label">Email</label>
                            <input name="email" type="email" className="auth-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                        </div>

                        <div className="auth-field">
                            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                                <a href="/forgot-password" style={{ fontSize: '12px', color: '#10b981', textDecoration: 'none', fontWeight: '500' }}>Forgot password?</a>
                            </div>
                            <input name="password" type="password" className="auth-input" placeholder="Password" value={form.password} onChange={handleChange} required />
                        </div>

                        {/* Remember Me Checkbox Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', marginTop: '-5px' }}>
                            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={handleCheckboxChange} style={{ cursor: 'pointer', accentColor: '#10b981' }} />
                            <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#4b5563', cursor: 'pointer', userSelect: 'none' }}>Remember me</label>
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
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