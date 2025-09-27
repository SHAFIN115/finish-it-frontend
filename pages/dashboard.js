// pages/dashboard.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Dashboard() {
  const [user, setUser] = useState({ name: "User", email: "" });
  const [recentTasks, setRecentTasks] = useState([]);
  const [quote, setQuote] = useState("Welcome back! Ready to tackle your goals?");
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    streak: 7,
    productivityScore: 85
  });
  const [loading, setLoading] = useState(false);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setQuote(getMotivationalQuote());
    loadDashboardData();
  }, []);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // API Headers
  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    };
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Tasks loaded:", data);

      if (data.success && data.tasks) {
        processDashboardData(data.tasks);
      } else {
        console.error("Failed to load tasks:", data.message);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      if (error.message.includes('401')) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Process data for dashboard
  const processDashboardData = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const todo = tasks.filter(task => task.status === 'todo').length;

    // Get recent tasks (last 5)
    const recent = tasks
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    // Get upcoming deadlines (next 7 days)
    const upcoming = tasks
      .filter(task => task.due_date && new Date(task.due_date) > new Date())
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 3);

    setRecentTasks(recent);
    setUpcomingDeadlines(upcoming);
    setStats({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      todoTasks: todo,
      streak: calculateStreak(tasks),
      productivityScore: calculateProductivityScore(tasks)
    });
  };

  // Calculate streak based on completed tasks
  const calculateStreak = (tasks) => {
    // Simple streak calculation - in real app, this would be more sophisticated
    const completedTasks = tasks.filter(task => task.status === 'completed');
    return completedTasks.length > 0 ? Math.min(completedTasks.length, 30) : 0;
  };

  // Calculate productivity score
  const calculateProductivityScore = (tasks) => {
    if (tasks.length === 0) return 0;

    const completed = tasks.filter(task => task.status === 'completed').length;
    const highPriorityCompleted = tasks.filter(task =>
      task.status === 'completed' && task.priority === 'high'
    ).length;

    let score = (completed / tasks.length) * 100;

    // Bonus for completing high priority tasks
    if (highPriorityCompleted > 0) {
      score += Math.min(highPriorityCompleted * 5, 20);
    }

    return Math.min(Math.round(score), 100);
  };

  // Quick action - mark task as completed
  const completeTask = async (taskId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'completed'
        })
      });

      const data = await response.json();
      if (data.success) {
        loadDashboardData(); // Refresh dashboard
      }
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "danger";
      case "medium": return "warning";
      case "low": return "success";
      default: return "secondary";
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: { bg: "#fff5f5", color: "#c53030", text: "HIGH" },
      medium: { bg: "#fffaf0", color: "#dd6b20", text: "MEDIUM" },
      low: { bg: "#f0fff4", color: "#276749", text: "LOW" }
    };
    return colors[priority] || colors.medium;
  };

  const completionPercentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  // Get motivational quote based on productivity
  const getMotivationalQuote = () => {
    const quotes = [
      "The secret of getting ahead is getting started.",
      "Don't count the days, make the days count.",
      "Productivity is never an accident. It is always the result of a commitment to excellence.",
      "Small daily improvements are the key to staggering long-term results.",
      "Your future is created by what you do today, not tomorrow."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  return (
    <>
      <Head>
        <title>Dashboard - Finish-It</title>
        <meta name="description" content="Your personal productivity dashboard to track and manage your goals." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/styles/dashboard.css" />
      </Head>

      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <Link href="/" className="brand-logo">
              <i className="fas fa-rocket me-2"></i>
              Finish-It
            </Link>
          </div>

          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </a>
            <Link href="/tasks" className="nav-item">
              <i className="fas fa-tasks"></i>
              <span>Tasks</span>
            </Link>
            <a href="#" className="nav-item">
              <i className="fas fa-project-diagram"></i>
              <span>Projects</span>
            </a>
            <a href="#" className="nav-item">
              <i className="fas fa-chart-line"></i>
              <span>Analytics</span>
            </a>
            <a href="#" className="nav-item">
              <i className="fas fa-calendar"></i>
              <span>Calendar</span>
            </a>
            <a href="#" className="nav-item">
              <i className="fas fa-cog"></i>
              <span>Settings</span>
            </a>
          </nav>

          <div className="sidebar-footer">
            <button onClick={logout} className="btn btn-outline-light btn-sm w-100">
              <i className="fas fa-sign-out-alt me-2"></i>
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-left">
              <button className="btn btn-link sidebar-toggle d-lg-none">
                <i className="fas fa-bars"></i>
              </button>
              <div>
                <h1 className="header-title">Welcome back!</h1>
                <p className="header-subtitle">{quote}</p>
              </div>
            </div>
            <div className="header-right">
              <Link href="/tasks" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                New Task
              </Link>
              <div className="user-avatar">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User" />
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="stats-section">
            <div className="row g-4">
              <div className="col-xl-3 col-md-6">
                <div className="stat-card gradient-1">
                  <div className="stat-icon">
                    <i className="fas fa-tasks"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.totalTasks}</h3>
                    <p>Total Tasks</p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card gradient-2">
                  <div className="stat-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.completedTasks}</h3>
                    <p>Completed</p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card gradient-3">
                  <div className="stat-icon">
                    <i className="fas fa-fire"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.streak}</h3>
                    <p>Day Streak</p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card gradient-4">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.productivityScore}%</h3>
                    <p>Productivity Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress and Quick Actions Section */}
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="dashboard-card">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-chart-pie me-2"></i>
                    Progress Overview
                  </h5>
                </div>
                <div className="card-body">
                  <div className="progress-overview">
                    <div className="progress-circle">
                      <div className="progress-value">{completionPercentage}%</div>
                      <svg className="progress-svg" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="54" stroke="#e1e8ff" strokeWidth="8" fill="transparent" />
                        <circle
                          cx="60"
                          cy="60"
                          r="54"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${completionPercentage * 3.39}, 339`}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="progress-stats">
                      <div className="stat-item">
                        <span className="stat-label">Tasks Completed</span>
                        <span className="stat-value">{stats.completedTasks}/{stats.totalTasks}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-value">{stats.inProgressTasks}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">To Do</span>
                        <span className="stat-value">{stats.todoTasks}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Productivity</span>
                        <span className="stat-value">{stats.productivityScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="dashboard-card">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-bolt me-2"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="d-grid gap-3">
                    <Link href="/tasks" className="btn btn-primary">
                      <i className="fas fa-plus me-2"></i>
                      Create New Task
                    </Link>
                    <Link href="/tasks?filter=in_progress" className="btn btn-outline-primary">
                      <i className="fas fa-play-circle me-2"></i>
                      Continue Working
                    </Link>
                    <button className="btn btn-outline-secondary" onClick={loadDashboardData}>
                      <i className="fas fa-sync-alt me-2"></i>
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Upcoming Deadlines */}
          <div className="row g-4">
            {/* Recent Tasks */}
            <div className="col-lg-6">
              <div className="dashboard-card">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-clock me-2"></i>
                    Recent Tasks
                  </h5>
                  <Link href="/tasks" className="btn btn-sm btn-outline-primary">
                    View All
                  </Link>
                </div>
                <div className="card-body p-0">
                  {loading ? (
                    <div className="text-center p-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : recentTasks.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="fas fa-tasks fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No recent tasks</p>
                      <Link href="/tasks" className="btn btn-sm btn-primary">
                        Create Your First Task
                      </Link>
                    </div>
                  ) : (
                    <div className="recent-tasks-list">
                      {recentTasks.map((task) => {
                        const priority = getPriorityBadge(task.priority);
                        return (
                          <div key={task.id} className="recent-task-item">
                            <div className="task-info">
                              <h6 className="task-title">{task.title}</h6>
                              <div className="task-meta">
                                <span
                                  className="priority-badge"
                                  style={{
                                    background: priority.bg,
                                    color: priority.color,
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.7rem',
                                    fontWeight: '600'
                                  }}
                                >
                                  {priority.text}
                                </span>
                                <span className="task-status">
                                  <i className={`fas fa-${task.status === 'completed' ? 'check-circle text-success' : task.status === 'in_progress' ? 'clock text-warning' : 'circle text-secondary'} me-1`}></i>
                                  {task.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            {task.status !== 'completed' && (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => completeTask(task.id)}
                                title="Mark as completed"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="col-lg-6">
              <div className="dashboard-card">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-calendar-alt me-2"></i>
                    Upcoming Deadlines
                  </h5>
                </div>
                <div className="card-body p-0">
                  {upcomingDeadlines.length === 0 ? (
                    <div className="text-center p-4">
                      <i className="fas fa-calendar fa-2x text-muted mb-3"></i>
                      <p className="text-muted">No upcoming deadlines</p>
                    </div>
                  ) : (
                    <div className="deadlines-list">
                      {upcomingDeadlines.map((task) => {
                        const daysUntilDue = Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                        const isUrgent = daysUntilDue <= 1;
                        const isSoon = daysUntilDue <= 3;

                        return (
                          <div key={task.id} className={`deadline-item ${isUrgent ? 'urgent' : ''}`}>
                            <div className="deadline-info">
                              <h6 className="deadline-title">{task.title}</h6>
                              <div className="deadline-meta">
                                <span className={`due-date ${isUrgent ? 'text-danger' : isSoon ? 'text-warning' : 'text-muted'}`}>
                                  <i className="fas fa-clock me-1"></i>
                                  {isUrgent ? 'Due today!' : `Due in ${daysUntilDue} days`}
                                </span>
                              </div>
                            </div>
                            <div className="deadline-actions">
                              <Link href={`/tasks`} className="btn btn-sm btn-outline-primary">
                                View
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Tips */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="dashboard-card">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-lightbulb me-2"></i>
                    Productivity Tip
                  </h5>
                </div>
                <div className="card-body">
                  <div className="productivity-tip">
                    <p className="mb-0">
                      <strong>Tip of the day:</strong> Break large tasks into smaller, manageable chunks.
                      Completing these smaller tasks will give you a sense of progress and keep you motivated!
                    </p>
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