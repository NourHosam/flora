import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import AiAssistant from './components/AiAssistant';
import About from './components/About';
import Guides from './components/Guides';
import DiseaseDetection from './components/DiseaseDetection';
import CropRecommendation from './components/CropRecommendation';

function App() {
    const [activeTab, setActiveTab] = useState('home');

    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <>
                        <Hero />
                        <Features />
                    </>
                );
            case 'about':
                return <About />;
            case 'disease-detection':
                return <DiseaseDetection />;
            case 'crop-recommendation':
                return <CropRecommendation />;
            case 'guides':
                return <Guides />;
            case 'ai':
                return <AiAssistant />;
            default:
                return (
                    <>
                        <Hero />
                        <Features />
                    </>
                );
        }
    };

    return (
        <div className="App">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}

export default App;