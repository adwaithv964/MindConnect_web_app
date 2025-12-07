import React from 'react';
import { SidebarProvider } from '../ui/RoleBasedSidebar';
import RoleBasedSidebar from '../ui/RoleBasedSidebar';
import SOSFloatingButton from '../ui/SOSFloatingButton';

const PatientLayout = ({ children }) => {
    const handleEmergency = () => {
        const confirmed = window.confirm(
            "You're about to call the National Suicide Prevention Lifeline (988).\n\nThis is a free, confidential crisis support service available 24/7.\n\nPress OK to proceed with the call."
        );
        if (confirmed) {
            window.location.href = 'tel:988';
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background">
                <RoleBasedSidebar userRole="patient" />
                <main className="main-content">
                    {children}
                </main>
                <SOSFloatingButton onEmergency={handleEmergency} />
            </div>
        </SidebarProvider>
    );
};

export default PatientLayout;
