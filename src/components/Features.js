import React from 'react';

const Features = () => {
  const features = [
    {
      icon: '🌱',
      title: 'Plant Identification',
      description: 'Identify any plant instantly with our AI technology.'
    },
    {
      icon: '🐛',
      title: 'Disease Detection',
      description: 'Identify and treat plant problems early.'
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <h2>Why Choose Flora AI?</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;