'use client';
import { T } from '@/components/ui/Typography';
import { MOBILE_MEDIA_QUERY_MATCHER } from '@/constants';
import { SidebarVisibilityContext } from '@/contexts/SidebarVisibilityContext';
import useMatchMedia from '@/hooks/useMatchMedia';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useContext } from 'react';

type SidebarLinkProps = {
  label: string;
  href: string;
  icon: JSX.Element;
};

export function SidebarLink({ label, href, icon }: SidebarLinkProps) {
  const { setVisibility } = useContext(SidebarVisibilityContext);
  const isMobile = useMatchMedia(MOBILE_MEDIA_QUERY_MATCHER);
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <div
      key={href}
      className={`px-1 hover:cursor-pointer rounded-md w-full flex items-center pr-2 ${isActive
        ? 'bg-muted text-foreground'
        : 'hover:text-foreground text-muted-foreground hover:bg-accent'
        } group`}
    >
      <div className={`p-2 pr-0.5 ${isActive ? 'text-foreground' : 'group-hover:text-foreground'}`}>
        {icon}
      </div>
      <Link
        onClick={() => isMobile && setVisibility(false)}
        className={`p-2 w-full text-sm ${isActive ? 'text-foreground' : 'text-foreground group-hover:text-foreground'
          }`}
        href={href}
      >
        {label}
      </Link>
    </div>
  );
}

type SidebarItemProps = React.PropsWithChildren<{
  label: string;
  icon: JSX.Element;
}> & { props?: React.HTMLProps<HTMLDivElement> };

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  ({ label, icon, ...props }, ref) => {
    return (
      <div
        key={label}
        className="hover:cursor-pointer hover:text-foreground text-muted-foreground rounded-md hover:bg-accent group w-full flex items-center pr-2"
        ref={ref}
        {...props}
      >
        <div className="p-2 group-hover:text-foreground">{icon}</div>
        <T.P className="p-2 w-full text-sm group-hover:text-foreground">
          {label}
        </T.P>
      </div>
    );
  },
);
