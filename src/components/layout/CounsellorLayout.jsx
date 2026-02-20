import React, { useEffect, useState } from 'react';
import { SidebarProvider } from '../ui/RoleBasedSidebar';
import CounsellorSidebar from '../ui/CounsellorSidebar';
import SOSFloatingButton from '../ui/SOSFloatingButton';
import { useNavigate, useLocation } from 'react-router-dom';

const CounsellorLayout = ({ children }) => {
    const handleEmergency = () => {
        console.log('Emergency SOS triggered');
        // Implement emergency logic here if needed
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background">
                <CounsellorSidebar />
                <main className="main-content">
                    {children}
                </main>
                <SOSFloatingButton onEmergency={handleEmergency} />
            </div>
        </SidebarProvider>
    );
};

export default CounsellorLayout;
