import React from 'react';
import { cn } from '@/src/lib/utils';
import DynamicImage from './DynamicImage';
import { getMentorPortraitVisual } from '../lib/course-visuals';

interface MentorPortraitProps {
  name: string;
  role: string;
  company?: string;
  seed: string;
  size?: number;
  className?: string;
}

const MentorPortrait = ({
  name,
  role,
  company,
  seed,
  size = 56,
  className,
}: MentorPortraitProps) => {
  const visual = getMentorPortraitVisual({ name, role, company });

  return (
    <div
      className={cn('overflow-hidden rounded-full border border-brand-secondary/20 bg-brand-card shadow-sm', className)}
      style={{ width: size, height: size }}
    >
      <DynamicImage
        prompt={visual.prompt}
        alt={name}
        seed={seed}
        aspectRatio="1:1"
        fallbackTitle={name}
        fallbackSubtitle={visual.subtitle}
        fallbackVariant="portrait"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default MentorPortrait;
