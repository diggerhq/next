import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Check, Zap } from "lucide-react";
import Link from "next/link";
import React from 'react';

interface FreeTrial {
  planName: string;
  daysRemaining: number;
  organizationId: string;
}

interface ActiveSubscription {
  planName: string;
  organizationId: string;
}

const FreeTrialComponent: React.FC<FreeTrial> = ({ planName, daysRemaining, organizationId }) => (
  <Link href={`/org/${organizationId}/settings/billing`} className="block hover:opacity-80 transition-opacity">
    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Free Trial</CardTitle>
          <Zap className="h-6 w-6 text-yellow-300" />
        </div>
        <CardDescription className="text-purple-100">{planName}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center space-x-3 bg-white/10 p-4 rounded-b-lg">
        <CalendarDays className="h-5 w-5 text-purple-200" />
        <span className="font-semibold text-lg">
          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
        </span>
      </CardContent>
    </Card>
  </Link>
);

const ActiveSubscriptionComponent: React.FC<ActiveSubscription> = ({ planName, organizationId }) => (
  <Link href={`/org/${organizationId}/billing`} className="block hover:opacity-80 transition-opacity">
    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Active Subscription</CardTitle>
          <Check className="h-6 w-6 text-emerald-300" />
        </div>
        <CardDescription className="text-emerald-100">{planName}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Badge variant="secondary" className="bg-white text-emerald-700 px-3 py-1 text-sm font-medium">
          Active
        </Badge>
      </CardContent>
    </Card>
  </Link>
);

export { ActiveSubscriptionComponent, FreeTrialComponent };
