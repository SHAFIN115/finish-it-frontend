// pages/signup.js
import { useState } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    
    // Check password strength
    if (e.target.name === "password") {
      checkPasswordStrength(e.target.value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) {
      setPasswordStrength("weak");
    } else if (password.length < 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      setPasswordStrength("medium");
    } else if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
      setPasswordStrength("strong");
    } else {
      setPasswordStrength("medium");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate passwords match
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        }),
      });

      const text = await res.text();
      console.log("Raw response:", text);

      try {
        const data = JSON.parse(text);
        console.log("Parsed JSON:", data);
        
        if (data.success) {
          setMessage("Account created successfully! Redirecting to login...");
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          setMessage(data.message || "Signup failed. Please try again.");
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        setMessage("Server response error. Please try again.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Error connecting to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak": return "danger";
      case "medium": return "warning";
      case "strong": return "success";
      default: return "secondary";
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Finish-It</title>
        <meta name="description" content="Create your Finish-It account and start achieving your goals today." />
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
                <h2 className="brand-title">Start Your Journey!</h2>
                <p className="brand-subtitle">
                  Join thousands of achievers who are turning their dreams into reality. Your success story starts here.
                </p>
                <div className="floating-elements">
                  <div className="floating-icon icon-1">
                    <i className="fas fa-star"></i>
                  </div>
                  <div className="floating-icon icon-2">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div className="floating-icon icon-3">
                    <i className="fas fa-crown"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Signup Form */}
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
                    <h1 className="form-title">Create Account</h1>
                    <p className="form-subtitle">Fill in your details to get started</p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                      <label htmlFor="name" className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control form-control-custom"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

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

                    <div className="form-group mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control form-control-custom"
                        placeholder="Create a strong password"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                      {form.password && (
                        <div className="mt-2">
                          <div className={`password-strength text-${getPasswordStrengthColor()}`}>
                            <small>
                              <i className={`fas fa-shield-${passwordStrength === 'strong' ? 'check' : 'alt'} me-1`}></i>
                              Password strength: <strong>{passwordStrength.toUpperCase()}</strong>
                            </small>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        <i className="fas fa-lock me-2"></i>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="form-control form-control-custom"
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      {form.confirmPassword && form.password !== form.confirmPassword && (
                        <small className="text-danger mt-1 d-block">
                          <i className="fas fa-exclamation-circle me-1"></i>
                          Passwords do not match
                        </small>
                      )}
                    </div>

                    <div className="form-check mb-4">
                      <input className="form-check-input" type="checkbox" id="agreeTerms" required />
                      <label className="form-check-label" htmlFor="agreeTerms">
                        I agree to the <Link href="/terms" className="auth-link">Terms of Service</Link> and{' '}
                        <Link href="/privacy" className="auth-link">Privacy Policy</Link>
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary btn-custom w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-user-plus me-2"></i>
                          Create Account
                        </>
                      )}
                    </button>

                    {message && (
                      <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} text-center`} role="alert">
                        <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                        {message}
                      </div>
                    )}

                    <div className="divider">
                      <span>or sign up with</span>
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
                    <p>Already have an account? <Link href="/login" className="auth-link">Sign in here</Link></p>
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