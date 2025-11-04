import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";

import "./App.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import About from "./components/About";
import Guides from "./components/Guides";
import DiseaseDetection from "./components/DiseaseDetection";
import CropRecommendation from "./components/CropRecommendation";
import AiAssistant from "./components/AiAssistant";

import Login from "./components/Login";
import Register from "./components/Register";

function AppContent() {
  const [activeTab, setActiveTab] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    if (!token && location.pathname !== "/login" && location.pathname !== "/register") {
      navigate("/login");
    }
  }, [location, navigate]);

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <><Hero /><Features /></>;
      case "about": return <About />;
      case "disease-detection": return <DiseaseDetection />;
      case "crop-recommendation": return <CropRecommendation />;
      case "guides": return <Guides />;
      case "ai": return <AiAssistant />;
      default: return <><Hero /><Features /></>;
    }
  };

  return (
    <div className="App">
      {location.pathname !== "/login" && location.pathname !== "/register" && (
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={renderContent()} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}