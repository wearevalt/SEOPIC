import { getSupabaseAdmin } from './supabase';
import type { UserSubscription, PlanType, SubscriptionStatus, PaymentProvider } from './types';
import { PLAN_CONFIGS } from './types';

export class SubscriptionService {
  private get supabase() { return getSupabaseAdmin(); }

  async getUserSubscription(email: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('users_subscriptions')
      .select('*')
      .eq('user_email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows
      throw error;
    }
    return data as UserSubscription;
  }

  async createOrUpdateSubscription(
    email: string,
    planType: PlanType,
    provider: PaymentProvider,
    providerId: string,
    status: SubscriptionStatus = 'active'
  ): Promise<UserSubscription> {
    const plan = PLAN_CONFIGS[planType];
    const now = new Date();

    const subscriptionData = {
      user_email: email,
      plan_type: planType,
      payment_provider: provider,
      status,
      analyses_per_month: plan.analyses_per_month,
      analyses_used: 0,
      can_analyze_images: plan.can_analyze_images,
      can_analyze_multiple: plan.can_analyze_multiple,
      current_period_start: now.toISOString(),
      current_period_end: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      next_billing_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: now.toISOString(),
    };

    if (provider === 'stripe') {
      (subscriptionData as any).stripe_subscription_id = providerId;
    } else if (provider === 'paypal') {
      (subscriptionData as any).paypal_subscription_id = providerId;
    }

    // Upsert subscription
    const { data, error } = await this.supabase
      .from('users_subscriptions')
      .upsert([subscriptionData], { onConflict: 'user_email' })
      .select()
      .single();

    if (error) throw error;
    return data as UserSubscription;
  }

  async updateSubscriptionStatus(
    email: string,
    status: SubscriptionStatus
  ): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('users_subscriptions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', email)
      .select()
      .single();

    if (error) throw error;
    return data as UserSubscription;
  }

  async incrementAnalysesUsed(email: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('users_subscriptions')
      .select('analyses_used, analyses_per_month')
      .eq('user_email', email)
      .single();

    if (error) throw error;

    const newCount = (data.analyses_used || 0) + 1;

    const { error: updateError } = await this.supabase
      .from('users_subscriptions')
      .update({
        analyses_used: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', email);

    if (updateError) throw updateError;
  }

  async canPerformAnalysis(email: string): Promise<{ allowed: boolean; reason?: string }> {
    let subscription = await this.getUserSubscription(email);

    if (!subscription) {
      // Create free plan subscription if it doesn't exist
      subscription = await this.createOrUpdateSubscription(
        email,
        'free',
        'stripe',
        `free_${email}`,
        'active'
      );
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      return { allowed: false, reason: 'Subscription is not active' };
    }

    // Check analyses limit
    if (
      subscription.analyses_used >= subscription.analyses_per_month &&
      subscription.plan_type !== 'enterprise'
    ) {
      return { allowed: false, reason: 'Monthly analysis limit reached' };
    }

    return { allowed: true };
  }

  async resetMonthlyAnalyses(email: string): Promise<void> {
    // This should be called via cron job monthly
    const { error } = await this.supabase
      .from('users_subscriptions')
      .update({
        analyses_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_email', email);

    if (error) throw error;
  }

  async logSubscriptionEvent(
    email: string,
    eventType: string,
    provider: PaymentProvider,
    providerEventId: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase
      .from('subscription_events')
      .insert([
        {
          user_email: email,
          event_type: eventType,
          provider_event_id: providerEventId,
          provider,
          details,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;
  }

  async getPlanConfig(planType: PlanType) {
    return PLAN_CONFIGS[planType];
  }
}

export const subscriptionService = new SubscriptionService();
