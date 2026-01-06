import React from "react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div className="admin-loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;