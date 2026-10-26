import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Notification } from '../common/Notification';
import { useCaseContext } from '../../context/CaseContext';

export const Layout = ({ children }) => {
  const { notification, showNotification } = useCaseContext();

  return (
    <div className="flex h-screen w-full bg-[#EAF4FC] text-[#243447] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Notifications */}
      <Notification notification={notification} onClose={() => showNotification(null)} />
    </div>
  );
};
