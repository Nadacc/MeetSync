import React from "react";

const Input = ({ type = "text", value, onChange, placeholder, className = "", ...props }) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${className}`}
      {...props}
    />
  );
};

export default Input;
