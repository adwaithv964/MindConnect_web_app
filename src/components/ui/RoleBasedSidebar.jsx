import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

const RoleBasedSidebar = ({ userRole = 'patient' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCollapsed, isMobileOpen, toggleCollapse, toggleMobile, closeMobile } = useSidebar();

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/patient-dashboard',
      icon: 'LayoutDashboard',
      roles: ['patient', 'counsellor', 'admin'],
      tooltip: 'View your wellness overview and daily check-in'
    },
    {
      label: 'Mood Tracker',
      path: '/mood-tracker',
      icon: 'Heart',
      roles: ['patient'],
      tooltip: 'Track your daily emotional state and patterns'
    },
    {
      label: 'Wellness Hub',
      path: '/wellness-hub',
      icon: 'Sparkles',
      roles: ['patient'],
      tooltip: 'Access guided activities and therapeutic exercises'
    },
    {
      label: 'Appointments',
      path: '/appointment-booking',
      icon: 'Calendar',
      roles: ['patient', 'counsellor'],
      tooltip: 'Schedule and manage counselling sessions'
    },
    {
      label: 'Resources',
      path: '/resource-library',
      icon: 'BookOpen',
      roles: ['patient', 'counsellor'],
      tooltip: 'Browse educational content and support materials'
    },
    {
      label: 'Care Management',
      path: '/counsellor-dashboard',
      icon: 'Users',
      roles: ['counsellor', 'admin'],
      tooltip: 'Monitor patient progress and coordinate treatment'
    }
  ];

  const settingsItems = [
    {
      label: 'Profile',
      path: '/settings/profile',
      icon: 'User',
      tooltip: 'Edit your profile'
    },
    {
      label: 'General',
      path: '/settings/general',
      icon: 'Settings',
      tooltip: 'General settings'
    },
    {
      label: 'Preferences',
      path: '/settings/preferences',
      icon: 'Sliders',
      tooltip: 'Preferences'
    }
  ];

  const filteredNavigation = navigationItems?.filter(item => item?.roles?.includes(userRole));

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

  const isActive = (path) => location?.pathname === path;

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
            {filteredNavigation?.map((item) => (
              <div
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`sidebar-nav-item ${isActive(item?.path) ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                title={isCollapsed ? item?.tooltip : ''}
                onKeyDown={(e) => {
                  if (e?.key === 'Enter' || e?.key === ' ') {
                    handleNavigation(item?.path);
                  }
                }}
              >
                <Icon name={item?.icon} size={20} />
                <span className="font-medium">{item?.label}</span>
              </div>
            ))}

            <div className="my-4 border-t border-gray-200/20 mx-4"></div>

            {!isCollapsed && (
              <div className="px-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Settings
              </div>
            )}

            {settingsItems.map((item) => (
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
            className="hidden lg:flex mt-4 absolute bottom-6 left-1/2 -translate-x-1/2 items-center justify-center w-10 h-10 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-150"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={20} />
          </button>
        </div>
      </aside>
    </>
  );
};
export default RoleBasedSidebar;