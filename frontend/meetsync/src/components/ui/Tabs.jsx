import React, { useState } from 'react';

const Tabs = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  return (
    <div>
      {/* Tab Headers */}
      <div className="flex border-b-2 border-gray-200">
        {React.Children.map(children, (child, index) => {
          if (child.type !== Tab) return null;
          return (
            <div
              className={`py-2 px-4 cursor-pointer text-sm font-semibold ${
                activeTab === index
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              onClick={() => handleTabClick(index)}
            >
              {child.props.label}
            </div>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {React.Children.toArray(children)[activeTab]}
      </div>
    </div>
  );
};

const Tab = ({ children }) => <div>{children}</div>;

export { Tabs, Tab };
