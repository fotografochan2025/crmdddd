import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface InteractiveTiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowColor?: string;
  onClick?: () => void;
}

export const InteractiveTiltCard: React.FC<InteractiveTiltCardProps> = ({
  children,
  className = '',
  intensity = 7,
  glowColor = 'rgba(16, 185, 129, 0.14)',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [spotPos, setSpotPos] = useState({ x: 50, y: 50 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 260, damping: 24, mass: 0.6 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;
    mouseX.set(relX - 0.5);
    mouseY.set(relY - 0.5);
    setSpotPos({ x: relX * 100, y: relY * 100 });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
      }}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={`relative overflow-hidden transition-colors duration-200 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(460px circle at ${spotPos.x}% ${spotPos.y}%, ${glowColor}, transparent 65%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};
