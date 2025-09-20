// pages/login.js
import { useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Login successful! Redirecting...");
        // Save token in localStorage
        localStorage.setItem("token", data.token);
        // Redirect to dashboard or home
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setMessage(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      setMessage("Error connecting to server. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Finish-It</title>
        <meta name="description" content="Sign in to your Finish-It account and continue achieving your goals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/styles/auth.css" />
      </Head>

      <div className="auth-section">
        <div className="container-fluid">
          <div className="row min-vh-100">
            {/* Left Side - Branding */}
            <div className="col-lg-6 d-none d-lg-flex auth-brand-side">
              <div className="brand-content">
                <Link href="/" className="brand-logo mb-4">
                  <i className="fas fa-rocket me-2"></i>
                  Finish-It
                </Link>
                <h2 className="brand-title">Welcome Back!</h2>
                <p className="brand-subtitle">
                  Ready to continue your journey? Sign in and keep crushing your goals.
                </p>
                <div className="floating-elements">
                  <div className="floating-icon icon-1">
                    <i className="fas fa-target"></i>
                  </div>
                  <div className="floating-icon icon-2">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="floating-icon icon-3">
                    <i className="fas fa-rocket"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="col-lg-6 auth-form-side">
              <div className="auth-form-container">
                {/* Mobile Brand */}
                <div className="d-lg-none text-center mb-4">
                  <Link href="/" className="brand-logo mobile-brand">
                    <i className="fas fa-rocket me-2"></i>
                    Finish-It
                  </Link>
                </div>

                <div className="auth-form">
                  <div className="text-center mb-4">
                    <h1 className="form-title">Sign In</h1>
                    <p className="form-subtitle">Enter your credentials to access your account</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="fas fa-envelope me-2"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control form-control-custom"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label htmlFor="password" className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control form-control-custom"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">
                          Remember me
                        </label>
                      </div>
                      <Link href="/forgot-password" className="forgot-link">
                        Forgot password?
                      </Link>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-custom w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>

                    {message && (
                      <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} text-center`} role="alert">
                        <i className={`fas ${message.includes('successful') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                        {message}
                      </div>
                    )}

                    <div className="divider">
                      <span>or continue with</span>
                    </div>

                    <div className="social-login">
                      <button type="button" className="btn btn-social btn-google">
                        <i className="fab fa-google me-2"></i>
                        Google
                      </button>
                      <button type="button" className="btn btn-social btn-github">
                        <i className="fab fa-github me-2"></i>
                        GitHub
                      </button>
                    </div>
                  </form>

                  <div className="auth-footer text-center mt-4">
                    <p>Don't have an account? <Link href="/signup" className="auth-link">Sign up here</Link></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}