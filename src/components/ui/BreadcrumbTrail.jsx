import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = ({ customPaths = null }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathMap = {
    '/patient-dashboard': 'Dashboard',
    '/mood-tracker': 'Mood Tracker',
    '/wellness-hub': 'Wellness Hub',
    '/appointment-booking': 'Appointments',
    '/resource-library': 'Resources',
    '/counsellor-dashboard': 'Care Management'
  };

  const generateBreadcrumbs = () => {
    if (customPaths) {
      return customPaths;
    }

    const pathSegments = location?.pathname?.split('/')?.filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments?.forEach((segment) => {
      currentPath += `/${segment}`;
      const label = pathMap?.[currentPath] || segment?.charAt(0)?.toUpperCase() + segment?.slice(1)?.replace(/-/g, ' ');
      breadcrumbs?.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      {breadcrumbs?.map((crumb, index) => (
        <div key={crumb?.path} className="breadcrumb-item">
          {index < breadcrumbs?.length - 1 ? (
            <>
              <a
                onClick={() => handleNavigation(crumb?.path)}
                onKeyDown={(e) => {
                  if (e?.key === 'Enter' || e?.key === ' ') {
                    handleNavigation(crumb?.path);
                  }
                }}
                tabIndex={0}
                role="button"
              >
                {crumb?.label}
              </a>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </>
          ) : (
            <span className="active">{crumb?.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default BreadcrumbTrail;