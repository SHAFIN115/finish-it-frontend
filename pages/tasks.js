// pages/tasks.js
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";

export default function Tasks() {
  const [user, setUser] = useState({ name: "User", email: "" });
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", status: "todo" });
  const [loading, setLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("created_desc");
  const [viewMode, setViewMode] = useState("list"); // list or grid
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    loadTasks();
  }, []);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, searchQuery, filterStatus, filterPriority, sortBy]);

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

  // Load tasks
  const loadTasks = async () => {
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
      setTasksLoading(false);
    }
  };

  // Filter and sort tasks
  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    // Sort tasks
    switch (sortBy) {
      case "created_desc":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "created_asc":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "title_asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title_desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        filtered.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        break;
      case "status":
        const statusOrder = { todo: 3, in_progress: 2, completed: 1 };
        filtered.sort((a, b) => statusOrder[b.status] - statusOrder[a.status]);
        break;
      default:
        break;
    }

    setFilteredTasks(filtered);
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
        setNewTask({ title: "", description: "", priority: "medium", status: "todo" });
        setShowAddModal(false);
        loadTasks(); // Refresh tasks
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

  // Update task status
  const updateTaskStatus = async (task, newStatus) => {
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
      if (data.success) {
        loadTasks();
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
      if (data.success) {
        loadTasks();
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
      if (data.success) {
        setEditingTask(null);
        loadTasks();
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

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterPriority("all");
    setSortBy("created_desc");
  };

  return (
    <>
      <Head>
        <title>Tasks - Finish-It</title>
        <meta name="description" content="Manage all your tasks in one place" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/styles/dashboard.css" />
        <link rel="stylesheet" href="/styles/tasks.css" />
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
            <Link href="/dashboard" className="nav-item">
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </Link>
            <a href="#" className="nav-item active">
              <i className="fas fa-tasks"></i>
              <span>Tasks</span>
            </a>
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
          <header className="tasks-header">
            <div className="header-left">
              <div>
                <h1 className="header-title">Tasks</h1>
                <p className="header-subtitle">Manage all your tasks in one place</p>
              </div>
            </div>
            <div className="header-right">
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                New Task
              </button>
            </div>
          </header>

          {/* Filters and Search */}
          <div className="filters-section">
            <div className="row g-3 align-items-center">
              <div className="col-md-4">
                <div className="search-box">
                  <i className="fas fa-search"></i>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="created_desc">Latest First</option>
                  <option value="created_asc">Oldest First</option>
                  <option value="title_asc">Title A-Z</option>
                  <option value="title_desc">Title Z-A</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="col-md-2">
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                  <button
                    className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={clearFilters}
                    title="Clear Filters"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Content */}
          <div className="tasks-content">
            {tasksLoading ? (
              <div className="text-center p-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading tasks...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-tasks fa-4x text-muted mb-4"></i>
                <h4>No tasks found</h4>
                <p className="text-muted">
                  {tasks.length === 0 
                    ? "Create your first task to get started!" 
                    : "Try adjusting your filters or search query."
                  }
                </p>
                {tasks.length === 0 && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowAddModal(true)}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Create Task
                  </button>
                )}
              </div>
            ) : (
              <div className={`tasks-grid ${viewMode}`}>
                {filteredTasks.map((task) => {
                  const statusBadge = getStatusBadge(task.status);
                  return (
                    <div key={task.id} className={`task-card ${task.status}`}>
                      {editingTask && editingTask.id === task.id ? (
                        <div className="task-edit-form">
                          <input
                            type="text"
                            className="form-control mb-3"
                            value={editingTask.title}
                            onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                          />
                          <textarea
                            className="form-control mb-3"
                            rows="3"
                            value={editingTask.description || ''}
                            onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                            placeholder="Description..."
                          />
                          <div className="row mb-3">
                            <div className="col-6">
                              <select
                                className="form-select"
                                value={editingTask.priority}
                                onChange={(e) => setEditingTask({...editingTask, priority: e.target.value})}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                              </select>
                            </div>
                            <div className="col-6">
                              <select
                                className="form-select"
                                value={editingTask.status}
                                onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                              >
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button className="btn btn-success btn-sm flex-fill" onClick={updateTask}>
                              <i className="fas fa-check me-1"></i>
                              Save
                            </button>
                            <button className="btn btn-secondary btn-sm flex-fill" onClick={() => setEditingTask(null)}>
                              <i className="fas fa-times me-1"></i>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="task-header">
                            <div className="task-status">
                              <span className={`status-indicator ${task.status}`}></span>
                            </div>
                            <div className="task-actions">
                              <div className="dropdown">
                                <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                  <i className="fas fa-ellipsis-v"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    <button className="dropdown-item" onClick={() => updateTaskStatus(task, 'todo')}>
                                      <i className="fas fa-circle me-2"></i>
                                      To Do
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item" onClick={() => updateTaskStatus(task, 'in_progress')}>
                                      <i className="fas fa-clock me-2"></i>
                                      In Progress
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item" onClick={() => updateTaskStatus(task, 'completed')}>
                                      <i className="fas fa-check-circle me-2"></i>
                                      Completed
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li>
                                    <button className="dropdown-item" onClick={() => startEditing(task)}>
                                      <i className="fas fa-edit me-2"></i>
                                      Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button className="dropdown-item text-danger" onClick={() => deleteTask(task.id)}>
                                      <i className="fas fa-trash me-2"></i>
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          
                          <div className="task-content">
                            <h5 className="task-title">{task.title}</h5>
                            {task.description && (
                              <p className="task-description">{task.description}</p>
                            )}
                          </div>
                          
                          <div className="task-footer">
                            <div className="task-meta">
                              <span className={`priority-badge priority-${task.priority}`}>
                                {task.priority.toUpperCase()}
                              </span>
                              <span className={`badge bg-${statusBadge.color}`}>
                                <i className={`fas fa-${statusBadge.icon} me-1`}></i>
                                {statusBadge.text}
                              </span>
                            </div>
                            {task.created_at && (
                              <div className="task-date">
                                <i className="fas fa-calendar me-1"></i>
                                {new Date(task.created_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-plus me-2"></i>
                  Add New Task
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={addTask}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Task Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter task title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      placeholder="Enter task description (optional)"
                      rows="3"
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    />
                  </div>
                  <div className="row">
                    <div className="col-6">
                      <label className="form-label">Priority</label>
                      <select
                        className="form-select"
                        value={newTask.priority}
                        onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={newTask.status}
                        onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus me-2"></i>
                        Create Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
}