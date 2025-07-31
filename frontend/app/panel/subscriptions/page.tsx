// فایل: app/panel/subscriptions/page.tsx
import React, { Suspense } from 'react';
import { getAllSubscriptions } from 'lib/server/server-api';
import { SubscriptionsManagementClient } from '@/app/components/panel/subscriptions/SubscriptionsManagementClient';
import LoadingSpinner from '@/app/components/Loading/Loading';

// این یک Server Component است
async function SubscriptionsData() {
  const initialSubscriptions = await getAllSubscriptions();
  return <SubscriptionsManagementClient initialSubscriptions={initialSubscriptions} />;
}

export default function SubscriptionsPage() {
  return (
    <div className="h-full">
      <Suspense fallback={<LoadingSpinner />}>
        <SubscriptionsData />
      </Suspense>
    </div>
  );
}