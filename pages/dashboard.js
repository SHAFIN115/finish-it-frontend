// pages/dashboard.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Dashboard() {
  const [user, setUser] = useState({ name: "User", email: "" });
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" });
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    streak: 7
  });

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
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

  // Load tasks and calculate stats
  const loadDashboardData = async () => {
    setTasksLoading(true);
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
        setTasks(data.tasks);
        calculateStats(data.tasks);
      } else {
        console.error("Failed to load tasks:", data.message);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      // If token is invalid, redirect to login
      if (error.message.includes('401')) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } finally {
      setTasksLoading(false);
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (taskList) => {
    const total = taskList.length;
    const completed = taskList.filter(task => task.status === 'completed').length;
    const inProgress = taskList.filter(task => task.status === 'in_progress').length;
    const todo = taskList.filter(task => task.status === 'todo').length;

    setStats({
      totalTasks: total,
      completedTasks: completed,
      inProgressTasks: inProgress,
      todoTasks: todo,
      streak: 7 // This would come from your backend
    });
  };

  // Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newTask)
      });

      const data = await response.json();
      console.log("Task creation response:", data);

      if (data.success) {
        setNewTask({ title: "", description: "", priority: "medium" });
        loadDashboardData(); // Refresh tasks
      } else {
        alert(data.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Error creating task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Update task status (toggle completion)
  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          ...task,
          status: newStatus
        })
      });

      const data = await response.json();
      console.log("Task update response:", data);

      if (data.success) {
        loadDashboardData(); // Refresh tasks
      } else {
        alert(data.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task. Please try again.");
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();
      console.log("Task deletion response:", data);

      if (data.success) {
        loadDashboardData(); // Refresh tasks
      } else {
        alert(data.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task. Please try again.");
    }
  };

  // Start editing task
  const startEditing = (task) => {
    setEditingTask({ ...task });
  };

  // Update existing task
  const updateTask = async () => {
    if (!editingTask.title.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(editingTask)
      });

      const data = await response.json();
      console.log("Task update response:", data);

      if (data.success) {
        setEditingTask(null);
        loadDashboardData(); // Refresh tasks
      } else {
        alert(data.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task. Please try again.");
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed": return { color: "success", icon: "check-circle", text: "Completed" };
      case "in_progress": return { color: "warning", icon: "clock", text: "In Progress" };
      case "todo": return { color: "secondary", icon: "circle", text: "To Do" };
      default: return { color: "secondary", icon: "circle", text: "Unknown" };
    }
  };

  const completionPercentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

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
                <p className="header-subtitle">Let's make today productive</p>
              </div>
            </div>
            <div className="header-right">
              <button className="btn btn-primary" onClick={() => document.getElementById('addTaskForm').scrollIntoView()}>
                <i className="fas fa-plus me-2"></i>
                New Task
              </button>
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
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.inProgressTasks}</h3>
                    <p>In Progress</p>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="stat-card gradient-4">
                  <div className="stat-icon">
                    <i className="fas fa-fire"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{stats.streak}</h3>
                    <p>Day Streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
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
                        <span className="stat-label">Completion Rate</span>
                        <span className="stat-value">{completionPercentage}%</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">In Progress</span>
                        <span className="stat-value">{stats.inProgressTasks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="dashboard-card" id="addTaskForm">
                <div className="card-header">
                  <h5>
                    <i className="fas fa-plus me-2"></i>
                    Add New Task
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={addTask}>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Task title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <textarea
                        className="form-control"
                        placeholder="Description (optional)"
                        rows="3"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <select
                        className="form-control"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      className="btn btn-primary w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-2"></i>
                          Add Task
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="dashboard-card">
            <div className="card-header">
              <h5>
                <i className="fas fa-list me-2"></i>
                Your Tasks
              </h5>
              <button 
                onClick={loadDashboardData} 
                className="btn btn-outline-primary btn-sm"
                disabled={tasksLoading}
              >
                {tasksLoading ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className="fas fa-sync-alt"></i>
                )}
              </button>
            </div>
            <div className="card-body p-0">
              {tasksLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center p-4">
                  <i className="fas fa-tasks fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No tasks yet. Create your first task above!</p>
                </div>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => {
                    const statusBadge = getStatusBadge(task.status);
                    return (
                      <div key={task.id} className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}>
                        <div className="task-checkbox">
                          <input
                            type="checkbox"
                            id={`task-${task.id}`}
                            checked={task.status === 'completed'}
                            onChange={() => toggleTaskStatus(task)}
                          />
                          <label htmlFor={`task-${task.id}`}></label>
                        </div>
                        <div className="task-content">
                          {editingTask && editingTask.id === task.id ? (
                            <div>
                              <input
                                type="text"
                                className="form-control mb-2"
                                value={editingTask.title}
                                onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                              />
                              <textarea
                                className="form-control mb-2"
                                rows="2"
                                value={editingTask.description || ''}
                                onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                              />
                              <select
                                className="form-control mb-2"
                                value={editingTask.priority}
                                onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                              <div className="d-flex gap-2">
                                <button className="btn btn-success btn-sm" onClick={updateTask}>
                                  <i className="fas fa-check"></i>
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingTask(null)}>
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h6 className="task-title">{task.title}</h6>
                              {task.description && (
                                <p className="task-description text-muted small">{task.description}</p>
                              )}
                              <div className="task-meta">
                                <span className={`priority-badge priority-${task.priority}`}>
                                  {task.priority.toUpperCase()}
                                </span>
                                <span className={`badge bg-${statusBadge.color}`}>
                                  <i className={`fas fa-${statusBadge.icon} me-1`}></i>
                                  {statusBadge.text}
                                </span>
                                {task.created_at && (
                                  <span className="created-date">
                                    <i className="fas fa-calendar me-1"></i>
                                    {new Date(task.created_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                        {!editingTask || editingTask.id !== task.id ? (
                          <div className="task-actions">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => startEditing(task)}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteTask(task.id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}