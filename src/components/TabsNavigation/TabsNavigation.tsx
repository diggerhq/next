import { Tab, TabV2 } from './Tab';
import { TabsNavigationProps, TabsNavigationPropsV2 } from './types';

export const TabsNavigation = ({ tabs }: TabsNavigationProps) => {
  return (
    <div className="border-b ">
      <div className="flex space-x-5">
        {tabs.map((tab) => {
          return <Tab key={tab.href} {...tab} />;
        })}
      </div>
    </div>
  );
};


import { Tabs, TabsList } from '@/components/ui/tabs';

export const TabsNavigationV2 = ({ tabs }: TabsNavigationPropsV2) => {
  return (
    <Tabs className='mt-8'>
      <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
        {tabs.map((tab) => (
          <TabV2 key={tab.href} {...tab} />
        ))}
      </TabsList>
    </Tabs>
  );
};
