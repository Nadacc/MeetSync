import React from 'react';

const Header = ({ title }) => {
  return (
    <div className="px-6 py-4 border-b bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
  );
};

export default Header;
