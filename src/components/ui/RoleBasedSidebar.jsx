import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

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

  const filteredNavigation = navigationItems?.filter(item => item?.roles?.includes(userRole));

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      closeMobile();
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
      <button
        onClick={toggleMobile}
        className="mobile-menu-button"
        aria-label="Toggle mobile menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
      </button>
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

export default RoleBasedSidebar;