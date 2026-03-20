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

  function handleLogin(id, name) {
    setUserId(id);
    setUsername(name);
    localStorage.setItem("userId", id);
    localStorage.setItem("username", name);
  }

  function handleLogout() {
    setUserId(null);
    setUsername(null);
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
  }

  return (
    <BrowserRouter>
      {userId ? (
        <div className="app-layout">
          <Navbar username={username} onLogout={handleLogout} />
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
