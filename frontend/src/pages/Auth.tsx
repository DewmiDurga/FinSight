import { useState } from "react";
import { supabase } from "../lib/supabase";

/* ─── Types ─────────────────────────────────────────────── */
type AuthMode = "login" | "register";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/* ─── Helper: password strength bar ──────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="auth-strength-bar"
            style={{ background: i <= score ? colors[score] : undefined }}
          />
        ))}
      </div>
      <span style={{ color: colors[score], fontSize: 11, fontWeight: 600 }}>
        {labels[score]}
      </span>
    </div>
  );
}

/* ─── Main Auth Component ────────────────────────────────── */
function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setSuccess("");
    setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
  };

  /* ── Login ─────────────────────────────────────────────── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // App.tsx detects the session via onAuthStateChange — no redirect needed
  };

  /* ── Register ───────────────────────────────────────────── */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          // This gets stored in auth.users.raw_user_meta_data
          // and the DB trigger reads it to populate profiles.full_name
          full_name: form.fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess("Account created! Check your email to confirm your address, then sign in.");
    // Shift to login view after a short delay
    setTimeout(() => switchMode("login"), 3000);
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <span className="auth-brand-icon">💹</span>
          <h1>FinSight</h1>
        </div>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Welcome back — sign in to continue"
            : "Create your account to get started"}
        </p>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            id="auth-tab-login"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign In
          </button>
          <button
            type="button"
            id="auth-tab-register"
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="auth-form" id="login-form">
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="auth-message auth-error">⚠ {error}</p>}
            {success && <p className="auth-message auth-success">✓ {success}</p>}

            <button
              id="login-submit"
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Sign In"}
            </button>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="auth-form" id="register-form">
            <div className="auth-field">
              <label htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Jane Smith"
                value={form.fullName}
                onChange={update("fullName")}
                autoComplete="name"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={update("password")}
                autoComplete="new-password"
                required
              />
              <PasswordStrength password={form.password} />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="auth-message auth-error">⚠ {error}</p>}
            {success && <p className="auth-message auth-success">✓ {success}</p>}

            <button
              id="register-submit"
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : "Create Account"}
            </button>
          </form>
        )}

        <p className="auth-footer-note">
          {mode === "login" ? (
            <>Don't have an account?{" "}
              <button type="button" className="auth-link" onClick={() => switchMode("register")}>
                Register free
              </button>
            </>
          ) : (
            <>Already registered?{" "}
              <button type="button" className="auth-link" onClick={() => switchMode("login")}>
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Auth;
