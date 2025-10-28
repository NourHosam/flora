import React from 'react';


const Guides = () => {
  const guideSections = [
    {
      title: "How to Use a Plant Care Guide",
      color: "#2e7d32",
      items: [
        "🌿 Difficulty Level: Is it beginner-friendly or for experienced gardeners?",
        "🌞 Light Requirements: How much sun does it really need?",
        "💧 Watering Schedule: How often and how much?",
        "🪴 Soil & Potting: What kind of soil and pot drainage is best?",
        "🌤️ Humidity & Temperature: What is its ideal climate?",
        "🌱 Feeding (Fertilizing): What kind of food and how often?",
        "🐛 Common Problems: What to watch for and how to fix it."
      ]
    },
    {
      title: "Tutorial: How to Repot a Houseplant (Step-by-Step)",
      color: "#388e3c",
      steps: [
        { step: "Water the Plant", description: "Water your plant a day or two before repotting." },
        { step: "Remove the Plant", description: "Turn the plant sideways and slide it out gently." },
        { step: "Loosen the Roots", description: "Tease roots apart to encourage new growth." },
        { step: "Remove Old Soil", description: "Shake off old soil from the roots." },
        { step: "Prepare the New Pot", description: "Add a layer of fresh soil at the bottom." },
        { step: "Position the Plant", description: "Place it centered in the new pot." },
        { step: "Add New Soil", description: "Fill in around with new mix and firm gently." },
        { step: "Water Thoroughly", description: "Deeply water to help it settle." },
        { step: "Aftercare", description: "Keep in indirect light and avoid fertilizer for 1 month." }
      ],
      signs: [
        "🪴 Roots are growing out of the drainage holes.",
        "⚖️ The plant is top-heavy and tips over easily.",
        "💧 The plant dries out very quickly after watering.",
        "🌱 It hasn’t produced new growth in a long time.",
        "🌿 Dense web of roots circling the inside of the pot."
      ]
    }
  ];

  return (
    <section className="guides-section">
      <div className="container">
        <div className="guides-header">
          <h1>🌻 Growing Guides</h1>
          <p>Comprehensive plant care guides and tutorials</p>
        </div>

        <div className="guides-grid">
          {guideSections.map((section, index) => (
            <div key={index} className="guide-card">
              <div className="card-header" style={{ backgroundColor: section.color }}>
                <h2>{section.title}</h2>
              </div>

              <div className="card-content">
                {section.items && (
                  <>
                    <h3 className="sub-title">📗 Key Categories</h3>
                    <div className="points-grid">
                      {section.items.map((item, idx) => (
                        <div key={idx} className="point-card">{item}</div>
                      ))}
                    </div>
                  </>
                )}

                {section.steps && (
                  <>
                    <h3 className="sub-title">📋 Step-by-Step Guide</h3>
                    <div className="points-grid">
                      {section.steps.map((s, idx) => (
                        <div key={idx} className="point-card">
                          <strong>{idx + 1}. {s.step}</strong><br />
                          <span className="desc">{s.description}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {section.signs && (
                  <>
                    <h3 className="sub-title">🔄 Signs of Repotting</h3>
                    <div className="points-grid">
                      {section.signs.map((sign, idx) => (
                        <div key={idx} className="point-card">{sign}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="closing-message">
          <span className="happy-growing">🌼 Happy Growing!</span>
        </div>
      </div>
    </section>
  );
};

export default Guides;
