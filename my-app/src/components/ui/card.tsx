import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const Card = ({ children, className, style }: CardProps) => (
  <div
    className={className ?? 'rounded-xl border bg-card p-6 shadow-2xl'}
    style={style}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className ?? 'mb-4'}>{children}</div>
);

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className ?? ''}>{children}</div>
);
