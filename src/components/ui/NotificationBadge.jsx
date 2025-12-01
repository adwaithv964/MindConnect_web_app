import React from 'react';

const NotificationBadge = ({ count = 0, maxCount = 99, className = '' }) => {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <span 
      className={`notification-badge ${className}`}
      aria-label={`${count} unread notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;