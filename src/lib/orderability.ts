export function toLocalDateOnly(value: string | null | undefined) {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function getDaysUntilDelivery(deliveryDate: string | null | undefined) {
  const targetDate = toLocalDateOnly(deliveryDate);
  if (!targetDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffInMs = targetDate.getTime() - today.getTime();
  return Math.round(diffInMs / (1000 * 60 * 60 * 24));
}

export function isOrderable(deliveryDate: string | null | undefined) {
  const daysUntilDelivery = getDaysUntilDelivery(deliveryDate);
  return daysUntilDelivery !== null && daysUntilDelivery >= 7;
}