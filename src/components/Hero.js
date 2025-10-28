import React from 'react';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <div 
        className="hero-background"
        style={{
          backgroundImage: "url('/assets/hero-farming.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      <div className="container">
        <div className="hero-content">
          <h2 >Grow Your Plants Smarter with Flora </h2>
          <p>
            Your personal AI-powered gardening assistant that helps you 
            cultivate healthy, thriving plants with expert guidance.
          </p>
      
        </div>
        
        <div className="hero-image">
          <div className="plant-card">
            <div className="plant-img monstera-img"></div>
            <h3>Growing strong</h3>
            <p>full of life under your care</p>
            <div className="plant-status">
              <span className="status-good">✓ Healthy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;