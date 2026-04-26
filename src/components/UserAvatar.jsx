import React, { useState } from 'react';
import defaultAvatar from '../assets/default-avatar.svg';

const UserAvatar = ({
  src,
  name,
  size = 'w-10 h-10',
  innerClassName = '',
  className = '',
  ringClassName = '',
}) => {
  const [hasImageError, setHasImageError] = useState(false);
  const avatarSrc = !hasImageError && src ? src : defaultAvatar;

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full p-[1.5px] ${className}`}>
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary-fixed-dim to-secondary opacity-90 ${ringClassName}`}
        style={{ boxShadow: '0 0 18px color-mix(in srgb, var(--color-primary) 35%, transparent)' }}
      />
      <div className={`relative ${size} rounded-full overflow-hidden bg-surface-container-highest border border-white/10`}>
        <img
          src={avatarSrc}
          alt={name || 'User avatar'}
          className={`w-full h-full object-cover ${innerClassName}`}
          onError={() => setHasImageError(true)}
        />
      </div>
    </div>
  );
};

export default UserAvatar;
