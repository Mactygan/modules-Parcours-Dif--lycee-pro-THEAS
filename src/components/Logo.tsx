import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIyt0bOjTWA8mmaHdcuSWi4WlKu4mFh0BrGw&s"
        alt="Bannière"
        className="h-16 w-auto" // Ajuster la taille de la bannière
      />
      <span className="text-2xl font-semibold">Parcours Différenciés LP THEAS</span>
    </div>
  );
};

export default Logo;
