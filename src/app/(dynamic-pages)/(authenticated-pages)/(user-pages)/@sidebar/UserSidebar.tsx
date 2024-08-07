import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { SidebarLink } from '@/components/SidebarLink';
import { cn } from '@/utils/cn';
import { Home, Mail, Settings, Shield } from 'lucide-react';

export async function UserSidebar() {
  return (
    <div
      className={cn(
        'flex flex-col justify-between h-full',
        'lg:px-3 lg:py-4 lg:pt-2 ',
      )}
    >
      <div>
        <div className="flex justify-between items-center">
          <SwitcherAndToggle />
        </div>
        <div className="mt-4">
          <SidebarLink
            label="Dashboard"
            href="/dashboard"
            icon={<Home className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Account Settings"
            href="/settings"
            icon={<Settings className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Security Settings"
            href="/settings/security"
            icon={<Shield className="size-4 text-foreground" />}
          />
          {/* <SidebarLink
            label="Developer Settings"
            href="/settings/developer"
            icon={<Code className="size-4 text-foreground" />}
          /> */}
          <SidebarLink
            label="Invitations"
            href="/invitations"
            icon={<Mail className="size-4 text-foreground" />}
          />
          {/* <SidebarLink
            label="My Feedback"
            href="/feedback"
            icon={<FileQuestion className="h-5 w-5" />}
          /> */}
        </div>
      </div>
    </div>
  );
}
