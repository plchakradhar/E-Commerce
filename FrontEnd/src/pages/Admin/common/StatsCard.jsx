import React from "react";

const StatsCard = ({ icon: Icon, label, value, color, description }) => { // eslint-disable-line no-unused-vars
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: color }}>
        <Icon />
      </div>
      <div className="stat-info">
        <h3>{label}</h3>
        <p className="stat-number">{value}</p>
        {description && <p className="stat-description">{description}</p>}
      </div>
    </div>
  );
};

export default StatsCard;