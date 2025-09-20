// pages/index.js
import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Finish-It - Turn Your Ideas Into Reality</title>
        <meta name="description" content="The ultimate productivity app to help you complete your projects and achieve your goals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/styles/home.css" />
      </Head>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          {/* Navigation */}
          <nav className="navbar navbar-expand-lg navbar-light mb-5">
            <div className="container-fluid px-0">
              <Link href="/" className="navbar-brand brand-logo">
                <i className="fas fa-rocket me-2"></i>
                Finish-It
              </Link>
              <div className="d-none d-lg-flex">
                <a href="#features" className="nav-link me-4">Features</a>
                <a href="#about" className="nav-link me-4">About</a>
                <a href="#contact" className="nav-link">Contact</a>
              </div>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="row align-items-center min-vh-75">
            <div className="col-lg-6">
              <div className="hero-content">
                <h1 className="hero-title mb-4">
                  Turn Your <span className="gradient-text">Dreams</span> Into <span className="gradient-text">Reality</span>
                </h1>
                <p className="hero-subtitle mb-5">
                  Stop procrastinating. Start achieving. The smart way to break down big goals and actually complete them.
                </p>
                <div className="hero-buttons">
                  <Link href="/signup" className="btn btn-primary btn-hero me-3 mb-3">
                    <i className="fas fa-rocket me-2"></i>
                    Get Started Free
                  </Link>
                  <Link href="/login" className="btn btn-outline-primary btn-hero mb-3">
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-visual">
                <div className="floating-card card-1">
                  <i className="fas fa-check-circle"></i>
                  <span>Task Completed!</span>
                </div>
                <div className="floating-card card-2">
                  <i className="fas fa-trophy"></i>
                  <span>Goal Achieved!</span>
                </div>
                <div className="floating-card card-3">
                  <i className="fas fa-fire"></i>
                  <span>Streak: 15 days</span>
                </div>
                <div className="main-visual">
                  <i className="fas fa-bullseye"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section py-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-5">
              <h2 className="section-title">Why Choose Finish-It?</h2>
              <p className="section-subtitle">Everything you need to turn procrastination into productivity</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon gradient-bg-1">
                  <i className="fas fa-tasks"></i>
                </div>
                <h4>Smart Breakdown</h4>
                <p>Transform overwhelming projects into bite-sized, actionable tasks you can actually complete.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon gradient-bg-2">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h4>Track Progress</h4>
                <p>Beautiful visualizations and milestone celebrations keep you motivated every step of the way.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card h-100">
                <div className="feature-icon gradient-bg-3">
                  <i className="fas fa-bolt"></i>
                </div>
                <h4>Beat Procrastination</h4>
                <p>Smart reminders and focus techniques to keep you on track and moving forward daily.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}