import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  angle: number;
  twinklePhase: number;
  isShootingStar?: boolean;
  trailOpacity?: number;
}

export const StarField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 6000);
      
      for (let i = 0; i < starCount; i++) {
        const isShootingStar = Math.random() < 0.02;
        stars.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: isShootingStar ? Math.random() * 3 + 2 : Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          speed: isShootingStar ? Math.random() * 3 + 2 : Math.random() * 0.3 + 0.1,
          angle: isShootingStar ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2,
          twinklePhase: Math.random() * Math.PI * 2,
          isShootingStar,
          trailOpacity: 1
        });
      }
      
      starsRef.current = stars;
    };

    const animate = (currentTime: number) => {
      if (!ctx || !canvas) return;
      
      timeRef.current = currentTime * 0.001; // Convert to seconds
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      starsRef.current.forEach((star, index) => {
        if (star.isShootingStar) {
          // Shooting star behavior
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          star.trailOpacity! *= 0.995;
          
          // Reset shooting star when it goes off screen or fades
          if (star.x < -50 || star.x > canvas.width + 50 || 
              star.y < -50 || star.y > canvas.height + 50 || 
              star.trailOpacity! < 0.1) {
            star.x = Math.random() * canvas.width;
            star.y = Math.random() * canvas.height;
            star.trailOpacity = 1;
            star.angle = Math.random() * Math.PI * 2;
          }
          
          // Draw shooting star trail
          const trailLength = 20;
          for (let i = 0; i < trailLength; i++) {
            const trailX = star.x - Math.cos(star.angle) * i * 2;
            const trailY = star.y - Math.sin(star.angle) * i * 2;
            const trailOpacity = (star.trailOpacity! * (1 - i / trailLength)) * 0.8;
            
            ctx.save();
            ctx.globalAlpha = trailOpacity;
            ctx.fillStyle = i < 5 ? '#5c7cfa' : '#ffffff';
            ctx.shadowColor = '#5c7cfa';
            ctx.shadowBlur = star.size;
            ctx.beginPath();
            ctx.arc(trailX, trailY, star.size * (1 - i / trailLength), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } else {
          // Regular star behavior
          star.x += Math.cos(star.angle) * star.speed;
          star.y += Math.sin(star.angle) * star.speed;
          
          // Wrap around screen edges
          if (star.x < 0) star.x = canvas.width;
          if (star.x > canvas.width) star.x = 0;
          if (star.y < 0) star.y = canvas.height;
          if (star.y > canvas.height) star.y = 0;
          
          // Enhanced twinkle effect
          star.twinklePhase += 0.02 + star.speed * 0.01;
          const twinkle = (Math.sin(star.twinklePhase) + 1) * 0.5;
          star.opacity = 0.3 + twinkle * 0.7;
          
          // Draw regular star
          ctx.save();
          ctx.globalAlpha = star.opacity;
          
          // Color variation based on size
          if (star.size > 1.5) {
            ctx.fillStyle = '#5c7cfa';
            ctx.shadowColor = '#5c7cfa';
          } else if (star.size > 1) {
            ctx.fillStyle = '#7c3aed';
            ctx.shadowColor = '#7c3aed';
          } else {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
          }
          
          ctx.shadowBlur = star.size * 3;
          
          // Draw star with sparkle effect for larger stars
          if (star.size > 1.2 && twinkle > 0.7) {
            // Draw sparkle rays
            const rayLength = star.size * 4;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.lineWidth = 0.5;
            ctx.lineCap = 'round';
            
            for (let i = 0; i < 4; i++) {
              const angle = (i * Math.PI) / 2 + star.twinklePhase;
              ctx.beginPath();
              ctx.moveTo(
                star.x + Math.cos(angle) * rayLength,
                star.y + Math.sin(angle) * rayLength
              );
              ctx.lineTo(
                star.x - Math.cos(angle) * rayLength,
                star.y - Math.sin(angle) * rayLength
              );
              ctx.stroke();
            }
          }
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createStars();
    animationRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
      createStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};