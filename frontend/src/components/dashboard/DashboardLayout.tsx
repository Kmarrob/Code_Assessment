// frontend/src/components/dashboard/DashboardLayout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from './DashboardSidebar.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  companyId?: string;
  showBack?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  companyId,
  showBack = true
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'rep') {
      navigate('/rep');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar companyId={companyId} onBack={showBack ? handleBack : undefined} />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
};