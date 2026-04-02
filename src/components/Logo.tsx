import React from 'react';
import { cn } from '@/src/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo = ({ className, size = 40 }: LogoProps) => {
  return (
    <div 
      className={cn("relative flex items-center justify-center overflow-hidden rounded-lg bg-brand-bg border border-brand-border shadow-lg shadow-brand-primary/10", className)}
      style={{ width: size, height: size }}
    >
      <svg 
        width={size * 0.82} 
        height={size * 0.82} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DaaS Logo"
      >
        <rect x="10" y="10" width="80" height="80" rx="22" fill="#0F172A" />
        <path d="M28 62V38C28 32.4772 32.4772 28 38 28H46C58.1503 28 68 37.8497 68 50C68 62.1503 58.1503 72 46 72H38C32.4772 72 28 67.5228 28 62Z" stroke="#08D9D6" strokeWidth="6" />
        <path d="M50 34H58C67.9411 34 76 42.0589 76 52C76 61.9411 67.9411 70 58 70H50" stroke="#FF2E63" strokeWidth="6" strokeLinecap="round" />
        <circle cx="38" cy="50" r="4.5" fill="#08D9D6" />
        <circle cx="58" cy="50" r="4.5" fill="#FF2E63" />
      </svg>
    </div>
  );
};

export default Logo;
