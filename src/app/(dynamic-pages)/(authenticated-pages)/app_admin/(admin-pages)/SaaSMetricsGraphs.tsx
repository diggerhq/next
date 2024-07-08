'use client';
import { AreaChartComponent } from '@/components/AreaChart';
import { BarChartComponent } from '@/components/BarChart';
import { BarListComponent } from '@/components/BarList';
import { DonutChartComponent } from '@/components/DonutChart';
import { GraphContainer } from '@/components/GraphContainer';
import { LineCharComponent } from '@/components/LineChart';
const valueFormatter = (number: number) =>
  `$ ${Intl.NumberFormat('us').format(number).toString()}`;
const mrrBarListData = [
  {
    name: 'MRR',
    value: 120,

  },
  {
    name: 'ARR',
    value: 157,

  },
  {
    name: 'ARPU',
    value: 109,

  },
  {
    name: 'LTV',
    value: 99,

  },
  {
    name: 'CAC',
    value: 132,

  },
];

const mrrDonutListData = [
  {
    name: 'MRR',
    value: 120,
    fill: "hsl(var(--chart-1))"
  },
  {
    name: 'ARR',
    value: 157,
    fill: "hsl(var(--chart-4))"
  },
  {
    name: 'ARPU',
    value: 109,
    fill: "hsl(var(--chart-3))"
  },
  {
    name: 'LTV',
    value: 99,
    fill: "hsl(var(--chart-2))"
  },
  {
    name: 'CAC',
    value: 132,
    fill: "hsl(var(--chart-5))"
  },
];

export function SaaSMetricsGraphs({
  churnRateData,
  mrrData,
  organizationCountByMonth,
  projectCountByMonth,
  userCountByMonth,
}: {
  churnRateData: Array<{
    month: string;
    churnRate: string;
  }>;
  mrrData: Array<{
    month: string;
    mrr: string;
  }>;
  organizationCountByMonth: Array<{
    month: string;
    number_of_organizations: number;
  }>;
  projectCountByMonth: Array<{
    month: string;
    number_of_projects: number;
  }>;
  userCountByMonth: Array<{
    month: string;
    number_of_users: number;
  }>;
}) {
  return (
    <div className="flex flex-col space-y-2 mt-12 ">
      <p className="text-2xl font-bold mb-2">Admin Analytics</p>
      <div className="grid grid-cols-1 md:grid-cols-2 grid-flow-row auto-rows-max w-full gap-10 ">
        <GraphContainer
          title="Monthly Churn Rate"
          subTitle="Monthly recurring revenue"
        >
          <AreaChartComponent chartData={mrrBarListData} />
        </GraphContainer>
        <GraphContainer
          title="MRR Analytics"
          subTitle="Monthly churn rate vs Organization Count"
        >
          <DonutChartComponent chartData={mrrDonutListData} text='MRR' />
        </GraphContainer>
      </div>

      <div>
        <p className="text-2xl mt-10 mb-2 font-bold">All Stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-flow-row auto-rows-max gap-10">
        <GraphContainer
          title="Organizations by month"
          subTitle="Number of organizations"
        >
          <BarChartComponent chartData={mrrBarListData} />
        </GraphContainer>
        <GraphContainer title="Projects by Month" subTitle="Number of projects">
          <LineCharComponent chartData={mrrBarListData} />
        </GraphContainer>
        <GraphContainer title="User by month" subTitle="Number of users">
          <BarListComponent chartData={mrrBarListData} />
        </GraphContainer>
      </div>
    </div>
  );
}
