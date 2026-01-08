import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=4')] bg-cover bg-center bg-no-repeat bg-blend-overlay">
      <div className="w-full max-w-4xl bg-black/90 text-zinc-300 soulslike-border min-h-[600px] flex flex-col relative overflow-hidden backdrop-blur-sm">
        {/* Header/Decorations */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-900 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-900 to-transparent opacity-50"></div>
        
        {children}
      </div>
    </div>
  );
};

export default Layout;