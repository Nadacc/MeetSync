import React from "react";

const Button = ({ children, onClick, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
