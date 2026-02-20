import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from './RoleBasedSidebar'; // Reusing the context hook
import Icon from '../AppIcon';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const CounsellorSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile } = useSidebar();
    const [isSettingsOpen, setIsSettingsOpen] = useState(location.pathname.includes('/counsellor/settings') || location.pathname.includes('/counsellor/profile'));

    const mainNavItems = [
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
            label: 'Requests',
            path: '/counsellor/requests',
            icon: 'Inbox',
            tooltip: 'View and manage appointment requests'
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
        }
    ];

    const settingsNavItems = [
        {
            label: 'Profile',
            path: '/counsellor/profile',
            icon: 'User',
            tooltip: 'Edit your professional profile'
        },
        {
            label: 'General',
            path: '/counsellor/settings/general',
            icon: 'Settings',
            tooltip: 'General application settings'
        },
        {
            label: 'Preferences',
            path: '/counsellor/settings/preferences',
            icon: 'Sliders',
            tooltip: 'Notification and display preferences'
        }
    ];

    const handleNavigation = (path) => {
        navigate(path);
        if (window.innerWidth < 1024) {
            closeMobile();
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            if (window.innerWidth < 1024) {
                closeMobile();
            }
        } catch (error) {
            console.error('Error signing out:', error);
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
                className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="sidebar-header shrink-0">
                    <div className="sidebar-logo">
                        <Icon name="Brain" size={28} color="#FFFFFF" />
                    </div>
                    {!isCollapsed && (
                        <span className="ml-3 text-white font-heading font-semibold text-lg">
                            Mind Connect
                        </span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="sidebar-nav">
                        {mainNavItems.map((item) => (
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

                        <div className="my-4 border-t border-gray-200/20 mx-4"></div>

                        {/* Collapsible Settings Menu */}
                        <div
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`sidebar-nav-item justify-between ${isSettingsOpen || location.pathname.includes('/counsellor/settings') || location.pathname.includes('/counsellor/profile') ? 'text-primary bg-primary/10' : ''}`}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="flex items-center gap-3">
                                <Icon name="Settings" size={20} />
                                <span className="font-medium">Settings</span>
                            </div>
                            <Icon name={isSettingsOpen ? "ChevronDown" : "ChevronRight"} size={16} />
                        </div>

                        {/* Settings Sub-items */}
                        {isSettingsOpen && (
                            <div className="ml-4 pl-2 border-l border-gray-200/20 space-y-1 mt-1 transition-all duration-200">
                                {settingsNavItems.map((item) => (
                                    <div
                                        key={item.path}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`sidebar-nav-item text-sm py-2 ${isActive(item.path) ? 'active text-primary font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <Icon name={item.icon} size={18} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </nav>
                </div>

                <div className="shrink-0 p-4 border-t border-gray-200/20">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center p-3 rounded-lg text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
                        title={isCollapsed ? 'Sign Out' : ''}
                    >
                        <Icon name="LogOut" size={20} />
                        {!isCollapsed && <span className="ml-3 font-medium">Sign Out</span>}
                    </button>

                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:flex mt-4 items-center justify-center w-full h-10 rounded-lg bg-black/20 hover:bg-black/30 transition-colors duration-150"
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
                    </button>
                </div>
            </aside>
        </>
    );
};

export default CounsellorSidebar;
