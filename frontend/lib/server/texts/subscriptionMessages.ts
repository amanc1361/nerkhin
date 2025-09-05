// lib/server/texts/subscriptionMessages.ts
export type SubscriptionMessages = {
    title: string;
    buy: string;
    tomans: (n: string | number) => string;
    periodLabel: (p: number) => string;
    back: string;
    empty: string;
  };
  
  export function getSubscriptionMessages(lang: "fa" | "en" = "fa"): SubscriptionMessages {
    if (lang === "en") {
      return {
        title: "Extend Account",
        buy: "Buy",
        tomans: (n) => `${n} Toman`,
        periodLabel: (p) =>
          p === 1 ? "1-month"
          : p === 3 ? "3-month"
          : p === 6 ? "6-month"
          : p === 12 ? "12-month"
          : `${p} days`,
        back: "Back",
        empty: "No subscriptions found.",
      };
    }
    // fa
    return {
      title: "تمدید حساب",
      buy: "خرید",
      tomans: (n) => `${n} تومان`,
      periodLabel: (p) =>
        p === 1 ? "اشتراک ۱ ماهه"
        : p === 3 ? "اشتراک ۳ ماهه"
        : p === 6 ? "اشتراک ۶ ماهه"
        : p === 12 ? "اشتراک ۱۲ ماهه"
        : `${p} روزه`,
      back: "بازگشت",
      empty: "پلنی برای نمایش موجود نیست.",
    };
  }
  