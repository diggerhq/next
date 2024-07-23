import { ReactNode } from 'react';

export type TabProps = { label: string; href: string; icon: ReactNode };

export type TabPropsV2 = { label: string; href: string };

export type TabsNavigationProps = {
  tabs: Array<TabProps>;
};

export type TabsNavigationPropsV2 = {
  tabs: Array<TabPropsV2>;
};
