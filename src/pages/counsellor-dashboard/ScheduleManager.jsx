import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '../../components/ui/RoleBasedSidebar';
import RoleBasedSidebar from '../../components/ui/RoleBasedSidebar';
import BreadcrumbTrail from '../../components/ui/BreadcrumbTrail';

const ScheduleManager = () => {
    // Mock data for now, replace with API calls later
    const [availability, setAvailability] = useState([
        { day: 'Monday', slots: ['09:00 - 10:00', '11:00 - 12:00'] },
        { day: 'Wednesday', slots: ['14:00 - 15:00'] }
    ]);

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-background">
                <RoleBasedSidebar userRole="counsellor" />
                <main className="main-content">
                    <BreadcrumbTrail />
                    <h1 className="text-3xl font-bold mb-6">Schedule Manager</h1>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Your Availability</h2>
                        <div className="space-y-4">
                            {availability.map((daySlot, index) => (
                                <div key={index} className="border-b pb-4">
                                    <h3 className="font-medium text-lg">{daySlot.day}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {daySlot.slots.map((slot, idx) => (
                                            <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                            Add Availability
                        </button>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default ScheduleManager;
