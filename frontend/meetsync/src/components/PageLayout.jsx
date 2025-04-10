import React from 'react';
import Topbar from './Topbar';
import Header from '../ui/Header';

const PageLayout = ({ title, children }) => {
  return (
    <div className="w-full">
      <Topbar />
      <Header title={title} />
      <div className="p-6">{children}</div>
    </div>
  );
};

export default PageLayout;
