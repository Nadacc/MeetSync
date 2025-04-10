import React from "react";

const TextArea = ({ value, onChange, placeholder, className = "", rows = 4 }) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
    />
  );
};

export default TextArea;
