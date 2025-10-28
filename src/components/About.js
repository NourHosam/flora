import React from 'react';


const About = () => {
  const teamMembers = [
    { name: "Mai Mohamed" },
    { name: "Shahd Hesham" },
    { name: "Nour Hossam" },
    { name: "Selvia Nasser" }
  ];

  return (
    <div className="about-page">
      {/* Header Section */}
      <section className="about-header">
        <div className="container">
          <div className="header-content">
            <div className="project-badge">
              <span className="badge-icon">🌿</span>
              Graduation Project 2025
            </div>
            <h1>About Flora</h1>
            <p className="header-description">
  AI-powered web application 
            </p>
          </div>
        </div>
      </section>

      {/* Project Overview */}
      <section className="project-overview">
        <div className="container">
          <div className="overview-card">
            <h1>Project Overview</h1>
            <p>
              Flora is an intelligent farming companion designed to empower farmers and agricultural 
              professionals with cutting-edge AI technology. Our system combines two powerful machine 
              learning models to provide comprehensive support for crop cultivation and plant health management.
            </p>
            <p>
              By leveraging advanced computer vision and predictive analytics, Flora helps to:<br/>
🌱 Reduce crop losses<br/>
⏳ Save time<br/>
📈 Support smarter farming decisions<br/>
🌿 Lead to healthier plants and improved productivity<br/>
🏡 Empower home growers to start gardening, identify plant diseases, and learn how to care for their plants<br/>
            </p>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="key-features">
        <div className="container">
          <div className="section-header">
            <h2>Key Features</h2>
            <p>two powerful AI models working together for comprehensive farming support</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon target-icon">
                🎯
              </div>
              <h3>Disease Detection Model</h3>
              <ul>
                <li>• The model shows us whether the plant is healthy or diseased through the image of the plant</li>
                <li>• It can reach a confidence score of 95%</li>
                <li>• Deep learning CNN architecture</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon zap-icon">
                ⚡
              </div>
              <h3>Crop Recommendation Model</h3>
              <ul>
                <li>• Analyzes environmental parameters</li>
                <li>• Provides recommendations for the best crop</li>
                <li>• Considers soil nutrients and climate</li>
                <li>•It achieves a prediction accuracy of over 95%</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className="section-header">
            <div className="team-badge">
              <span className="badge-icon">👥</span>
              Meet the Team
            </div>
            <h2>Our Team</h2>
            <p>A dedicated group of students passionate about agriculture and technology</p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  <span className="avatar-initials">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3>{member.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="tech-stack">
        <div className="container">
          <div className="tech-card">
            <h2>Technology Stack</h2>
            
            <div className="tech-grid">
              <div className="tech-category">
                <h3>Machine Learning</h3>
                <ul>
                  <li>• TensorFlow / PyTorch for model training</li>
                  <li>• CNN architecture for image classification</li>
                  <li>• XGBoost for crop recommendation</li>
                  <li>• SHAP for model interpretability</li>
                </ul>
              </div>

              <div className="tech-category">
                <h3>Web Technologies</h3>
                <ul>
                  <li>• React with TypeScript</li>
                  <li>• CSS for styling</li>
                  <li>• Responsive design principles</li>
                  <li>• Modern UI/UX best practices</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <div className="container">
          <div className="impact-card">
            <h2>Our Impact</h2>
            <p>
              Flora aims to bridge the gap between traditional farming practices and modern technology. 
              By providing accessible AI-powered tools, we help farmers make informed decisions that lead to:
            </p>
            
            <div className="impact-stats">
              <div className="stat-card">
                <p className="stat-number">30%</p>
                <p className="stat-label">Reduced Crop Loss</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">25%</p>
                <p className="stat-label">Increased Yield</p>
              </div>
              <div className="stat-card">
                <p className="stat-number">40%</p>
                <p className="stat-label">Better Decision Making</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;