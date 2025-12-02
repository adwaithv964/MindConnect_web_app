import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from './RoleBasedSidebar'; // Reusing the context hook
import Icon from '../AppIcon';

const CounsellorSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile } = useSidebar();

    const navigationItems = [
        {
            label: 'Dashboard',
            path: '/counsellor-dashboard',
            icon: 'LayoutDashboard',
            tooltip: 'Overview of your patients and appointments'
        },
        {
            label: 'Patient Records',
            path: '/counsellor/patients',
            icon: 'Users',
            tooltip: 'View and manage patient records'
        },
        {
            label: 'Schedule',
            path: '/counsellor/schedule',
            icon: 'Calendar',
            tooltip: 'Manage your availability and appointments'
        },
        {
            label: 'Consultation',
            path: '/counsellor/consultation',
            icon: 'Video',
            tooltip: 'Video consultation room'
        },
        {
            label: 'Profile',
            path: '/counsellor/profile',
            icon: 'User',
            tooltip: 'Edit your professional profile'
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 1024) {
            closeMobile();
        }
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                closeMobile();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [closeMobile]);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-primary to-secondary z-50 flex items-center px-4 shadow-md">
                <button
                    onClick={toggleMobile}
                    className="p-2 mr-3 text-white hover:bg-white/10 rounded-lg transition-colors"
                    aria-label="Toggle mobile menu"
                >
                    <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon name="Brain" size={20} color="#FFFFFF" />
                    </div>
                    <span className="text-white font-heading font-semibold text-lg">
                        Mind Connect
                    </span>
                </div>
            </div>

            {isMobileOpen && (
                <div
                    className="mobile-overlay"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}
            <aside
                className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Icon name="Brain" size={28} color="#FFFFFF" />
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-white font-heading font-semibold text-lg">
                            Mind Connect
                        </span>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navigationItems.map((item) => (
                        <div
                            key={item.path}
                            onClick={() => handleNavigation(item.path)}
                            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            role="button"
                            tabIndex={0}
                            title={isCollapsed ? item.tooltip : ''}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleNavigation(item.path);
                                }
                            }}
                        >
                            <Icon name={item.icon} size={20} />
                            <span className="font-medium">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-150"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
                </button>
            </aside>
        </>
    );
};

export default CounsellorSidebar;
