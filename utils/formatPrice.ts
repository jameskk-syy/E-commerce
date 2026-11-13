export const formatPrice = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "KSh 0";
  }

  const numeric = Number(amount);
  return `KSh ${numeric.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
