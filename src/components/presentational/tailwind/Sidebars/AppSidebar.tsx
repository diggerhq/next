'use client';
import { Anchor } from '@/components/Anchor';
import { classNames } from '@/utils/classNames';
import { useUser } from '@supabase/auth-helpers-react';
import { usePathname } from 'next/navigation';
import { match } from 'path-to-regexp';
import { FiHome, FiServer } from 'react-icons/fi';
import { AiFillHome } from 'react-icons/ai';
import { cn } from '@/utils/cn';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

type LinksProps = {
  isUserAppAdmin: boolean;
  isExpanded: boolean;
  toggleIsExpanded: (isExpanded: boolean) => void;
};
function Links({ isUserAppAdmin, isExpanded, toggleIsExpanded }: LinksProps) {
  const user = useUser();
  const chevronClassName = cn(
    `absolute flex text-white justify-center bg-slate-900 hover:bg-slate-700 hover:shadow-lg p-2 px-1 rounded-lg text-4xl cursor-pointer items-center top-1/2`,
    isExpanded ? 'left-[248px]' : 'left-10'
  );

  const sidebarContainerClassName = cn(
    `grid grid-rows-[auto,1fr,auto]  bg-slate-900 h-full overflow-auto`,
    isExpanded ? ' px-4 w-[264px]' : 'px-2 w-[64px]'
  );

  return (
    <div className={sidebarContainerClassName}>
      {user ? (
        <>
          <SidebarLink
            href="/dashboard"
            icon={<FiHome />}
            label="Dashboard"
            isExpanded={isExpanded}
          />
          {isUserAppAdmin && (
            <SidebarLink
              href="/app_admin"
              icon={<FiServer />}
              label="Admin Panel"
              isExpanded={isExpanded}
            />
          )}

          {/* Chevron Icon Action */}
          <div
            className={chevronClassName}
            onClick={() => toggleIsExpanded(!isExpanded)}
          >
            {isExpanded ? <BiChevronLeft /> : <BiChevronRight />}
          </div>
        </>
      ) : (
        <Anchor
          href="/login"
          className="flex py-1 text-slate-400 text-sm font-[600] hover:text-gray-200"
        >
          Login
        </Anchor>
      )}
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  isExpanded,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Anchor
      href={href}
      className={classNames(
        `flex w-full gap-2.5 items-center group py-3 h-[48px] mb-1 rounded-lg transition hover:cursor-pointer hover:shadow-lg hover:bg-slate-800 `,
        isActive
          ? ' bg-slate-800 text-slate-200 hover:bg-slate-800'
          : ' bg-transparent',
        isExpanded
          ? 'text-slate-200 pl-5 pr-2 justify-start'
          : 'text-slate-200 justify-center'
      )}
    >
      <span className="text-xl group-hover:text-white">{icon}</span>
      {isExpanded ? (
        <span className="transition text-base  font-[400] group-hover:font-[600] group-hover:text-white">
          {label}
        </span>
      ) : null}
    </Anchor>
  );
}

export function AppSidebar({
  isUserAppAdmin,
  isExpanded,
  toggleIsExpanded,
}: {
  isUserAppAdmin: boolean;
  isExpanded: boolean;
  toggleIsExpanded: (isExpanded: boolean) => void;
}) {
  return (
    <nav className="flex w-full">
      <Links
        isUserAppAdmin={isUserAppAdmin}
        isExpanded={isExpanded}
        toggleIsExpanded={toggleIsExpanded}
      />
      <div className="flex-grow"></div>
    </nav>
  );
}
