import {
  House,
  Lightbulb,
  Droplets,
  Utensils,
  ShoppingCart,
  Bus,
  Hospital,
  CreditCard,
  Wifi,
  GraduationCap,
  Film,
  Coffee,
  ShoppingBag,
  Palette,
  Plane,
  Gift,
  Receipt,
  Briefcase,
  Wallet,
  TrendingUp,
  CircleDollarSign,
  HandCoins,
  Banknote,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";

export const categoryIcons = [
  { name: "House", icon: House },
  { name: "Lightbulb", icon: Lightbulb },
  { name: "Droplets", icon: Droplets },
  { name: "Utensils", icon: Utensils },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Bus", icon: Bus },
  { name: "Hospital", icon: Hospital },
  { name: "CreditCard", icon: CreditCard },
  { name: "Wifi", icon: Wifi },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Film", icon: Film },
  { name: "Coffee", icon: Coffee },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Palette", icon: Palette },
  { name: "Plane", icon: Plane },
  { name: "Gift", icon: Gift },
  { name: "Receipt", icon: Receipt },
  { name: "Briefcase", icon: Briefcase },
  { name: "Wallet", icon: Wallet },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "CircleDollarSign", icon: CircleDollarSign },
  { name: "HandCoins", icon: HandCoins },
  { name: "Banknote", icon: Banknote },
  { name: "PiggyBank", icon: PiggyBank },
] as const;

export type CategoryIconName =
  (typeof categoryIcons)[number]["name"];

export const categoryIconMap: Record<string, CategoryIconName> = {
  // Income
  Salary: "Banknote",
  "Freelance Income": "Briefcase",
  "Business Income": "CircleDollarSign",
  "Investment Returns": "TrendingUp",
  "Other Income": "Wallet",
  Allowance: "HandCoins",
  Bonus: "Gift",
  Pension: "PiggyBank",

  // Essential Expenses
  Rent: "House",
  "Electricity Bill": "Lightbulb",
  "Water Bill": "Droplets",
  Groceries: "ShoppingCart",
  Food: "Utensils",
  Transportation: "Bus",
  Medical: "Hospital",
  EMI: "CreditCard",
  "Internet & Mobile": "Wifi",
  Education: "GraduationCap",

  // Discretionary Expenses
  Entertainment: "Film",
  "Dining Out": "Coffee",
  Shopping: "ShoppingBag",
  Hobbies: "Palette",
  Travel: "Plane",

  // Other Expenses
  "Gifts & Donations": "Gift",
  "Miscellaneous Expense": "Receipt",
};

const iconLookup = new Map<string, LucideIcon>(
  categoryIcons.map(({ name, icon }) => [name, icon])
);

export function getCategoryIcon(
  iconName?: string | null,
  categoryName?: string | null
): LucideIcon {
  const mappedName = categoryName
    ? categoryIconMap[categoryName]
    : undefined;

  const resolvedName = iconName || mappedName;

  return (
    (resolvedName ? iconLookup.get(resolvedName) : undefined) ??
    Receipt
  );
}