'use server';

import { authenticatedFetch } from '@/lib/server/server-api';
import { revalidatePath } from 'next/cache';

interface GrantSubscriptionPayload {
  userId: number;
  days: number;
}

export async function grantSubscriptionDays(payload: GrantSubscriptionPayload) {
  try {
    await authenticatedFetch('/user-subscription/subscriptions/grant', {
      method: 'POST',
      body: JSON.stringify({
        userId: payload.userId,
        days: payload.days,
      }),
    });
    // بعد از موفقیت، کش صفحه کاربران را خالی می‌کنیم تا دیتا جدید نمایش داده شود
    revalidatePath('/panel/users');
    return { success: true };
  } catch (error) {
    console.error('Failed to grant subscription:', error);
    return { success: false, error: 'Failed to grant subscription' };
  }
}