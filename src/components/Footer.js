import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Flora AI</h3>
            <p>Your intelligent gardening companion</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#plants">Plants</a></li>
              <li><a href="#guides">Guides</a></li>
              <li><a href="#ai">AI Assistant</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>support@floraai.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 Flora AI Grow Guide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;