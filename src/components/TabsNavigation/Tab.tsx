'use client';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TabProps, TabPropsV2 } from './types';
export const Tab = ({ label, href, icon }: TabProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const baseClassNames =
    'whitespace-nowrap py-4 pb-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2';
  const modifierClasses = isActive
    ? 'border-primary text-foreground'
    : 'border-transparent text-muted-foreground hover:text-muted-foreground hover:border-muted-foreground';
  const className = `${baseClassNames} ${modifierClasses}`;
  return (
    <Link href={href} className={className}>
      {icon} <span>{label}</span>
    </Link>
  );
};

export const TabV2 = ({ label, href }: TabPropsV2) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  const className = cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    isActive
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground'
  );

  return (
    <Link href={href} className={className}>
      <span>{label}</span>
    </Link>
  );
};

