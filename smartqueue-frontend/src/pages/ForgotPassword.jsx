import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "../styles/Login.css";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Password updated successfully! Redirecting to login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.message || "Failed to reset password.");
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
                        <h1 className="auth-title">Reset Password</h1>
                        <div className="auth-brand-mini"><span className="auth-brand-mini-dot" />SmartQueue</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {message && <div style={{background: '#dcfce7', color: '#15803d', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px'}}>{message}</div>}
                        {error && <div className="auth-error" style={{background: '#ffebebeb', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px'}}>{error}</div>}

                        <div className="auth-field">
                            <label className="auth-label">Registered Email</label>
                            <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="auth-field">
                            <label className="auth-label">New Password</label>
                            <input type="password" className="auth-input" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>

                        <button type="submit" className="auth-submit" disabled={loading}>
                            {loading ? "Updating..." : "Reset Password"}
                        </button>
                    </form>

                    <p className="auth-mobile-switch">Remember password? <Link to="/login">Sign in</Link></p>
                </div>

                <div className="auth-panel-side">
                    <div className="auth-panel-badge"><div className="auth-panel-badge-inner" /></div>
                    <h2>Password Reset</h2>
                    <p>Set a new password for your SmartQueue account to safely log back in.</p>
                    <Link to="/login" className="auth-panel-pill">Back to Sign in</Link>
                </div>
            </div>
        </div>
    );
}