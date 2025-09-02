import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Softer emerald auras to match landing */}
      <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] bg-emerald-500/5 blur-3xl rounded-full" />
      <div className="absolute bottom-[-8rem] right-[-8rem] w-[38rem] h-[38rem] bg-emerald-400/5 blur-3xl rounded-full" />

      {/* Subtle grid mask */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    </div>
  );
};
