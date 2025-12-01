import React, { useState } from 'react';
import Icon from '../AppIcon';

const SOSFloatingButton = ({ onEmergency }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    
    if (onEmergency) {
      onEmergency();
    } else {
      window.location.href = 'tel:988';
    }

    setTimeout(() => setIsPressed(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={`sos-button ${isPressed ? 'scale-95' : ''}`}
      aria-label="Emergency SOS - Call crisis helpline"
      title="Emergency SOS - Immediate crisis support"
    >
      <Icon name="Phone" size={24} color="currentColor" />
    </button>
  );
};

export default SOSFloatingButton;