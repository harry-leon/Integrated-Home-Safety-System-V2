import React from 'react';

const UserAvatar = ({
  src,
  name,
  size = 'w-10 h-10',
  innerClassName = '',
  className = '',
  ringClassName = '',
}) => {
  const initials = (name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full p-[1.5px] ${className}`}>
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary-fixed-dim to-secondary opacity-90 ${ringClassName}`}
        style={{ boxShadow: '0 0 18px color-mix(in srgb, var(--color-primary) 35%, transparent)' }}
      />
      <div className={`relative ${size} rounded-full overflow-hidden bg-surface-container-highest border border-white/10`}>
        {src ? (
          <img src={src} alt={name || 'User avatar'} className={`w-full h-full object-cover ${innerClassName}`} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-container via-primary-fixed to-secondary-fixed flex items-center justify-center text-on-primary-container">
            <span className="text-xs font-black tracking-wide">{initials}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAvatar;
