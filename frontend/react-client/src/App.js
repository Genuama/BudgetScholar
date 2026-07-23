import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import './App.css';

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddTransaction from "./pages/AddTransaction";
import AddBudget from "./pages/AddBudget";

function App() {
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const [name, setName] = useState(() => localStorage.getItem("name"));
  const[sidebarOpen, setSidebarOpen] = useState(false);
  
  function handleLogin(id, username, name) {
    setUserId(id);
    setUsername(username);
    setName(name);
    localStorage.setItem("userId", id);
    localStorage.setItem("username", username);
    localStorage.setItem("name", name);
  }

  function handleLogout() {
    setUserId(null);
    setUsername(null);
    setName(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("name");
  }

  return (
    <BrowserRouter>
      {userId ? (
        <div className="app-layout">
          <Navbar name={name} username={username} onLogout={handleLogout} />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/dashboard" element={<Dashboard userId={userId} />} />
                <Route path="/add-transaction" element={<AddTransaction userId={userId} />} />
                <Route path="/add-budget" element={<AddBudget userId={userId} />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
