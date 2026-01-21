import { useState } from 'react';
import { Dashboard } from '../components/Dashboard';
import { XAIPanel } from '../components/XAIPanel';
import { Geography } from '../components/Geography';
import { WhatIfSimulator } from '../components/WhatIfSimulator';
import { Sidebar } from '../components/Sidebar';
import { Customer } from '../types';
import { useAuth } from '@shared/contexts/AuthContext';

export function HomePage() {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState<'dashboard' | 'geography' | 'simulator'>('dashboard');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isXAIPanelOpen, setIsXAIPanelOpen] = useState(false);

    const handleViewExplanation = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsXAIPanelOpen(true);
    };

    const handleCloseXAIPanel = () => {
        setIsXAIPanelOpen(false);
        setTimeout(() => setSelectedCustomer(null), 300);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                currentView={currentView}
                onNavigate={setCurrentView}
                onLogout={logout}
                userRole={user?.username || 'Usuario'}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {currentView === 'dashboard' && (
                    <Dashboard onViewExplanation={handleViewExplanation} />
                )}
                {currentView === 'geography' && <Geography />}
                {currentView === 'simulator' && <WhatIfSimulator />}
            </div>

            {/* XAI Panel Drawer */}
            <XAIPanel
                customer={selectedCustomer}
                isOpen={isXAIPanelOpen}
                onClose={handleCloseXAIPanel}
            />
        </div>
    );
}
