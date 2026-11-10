
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useAxios } from "@/hooks/useAxios";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface MonthRange {
  start: string;
  end: string;
}

interface BalanceSummary {
  previous_balance: number;
  total_income: number;
  total_expenses: number;
  total_balance: number;
}

interface BalanceResponse {
  status: boolean;
  data: BalanceSummary;
  message?: string;
}

interface BalanceInfoItem {
  title: string;
  amount: number;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getMonthRange(year: number, month: number): MonthRange {
  const startDate = moment([year, month]).startOf("month");
  const endDate = startDate.clone().endOf("month");

  return {
    start: startDate.format("YYYY-MM-DD"),
    end: endDate.format("YYYY-MM-DD"),
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// --------------------------------------------------
// Component
// --------------------------------------------------

const BalanceInfo: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState<MonthRange>(() =>
    getMonthRange(moment().year(), moment().month())
  );

  const [summary, setSummary] = useState<BalanceSummary>({
    previous_balance: 0,
    total_income: 0,
    total_expenses: 0,
    total_balance: 0,
  });

  const [loading, setLoading] = useState(false);

  const { request: filterRequest } = useAxios<BalanceResponse>();

  // --------------------------------------------------
  // Fetch monthly summary
  // --------------------------------------------------

  const fetchMonthlySummary = useCallback(async () => {
    setLoading(true);

    try {
      const response = await filterRequest({
        method: "POST",
        url: "/api/transaction/filter-by-date",
        data: {
          start_date: currentMonth.start,
          end_date: currentMonth.end,
        },
      });

      if (response?.status && response.data) {
        setSummary({
          previous_balance: Number(response.data.previous_balance ?? 0),
          total_income: Number(response.data.total_income ?? 0),
          total_expenses: Number(response.data.total_expenses ?? 0),
          total_balance: Number(response.data.total_balance ?? 0),
        });
      } else {
        setSummary({
          previous_balance: 0,
          total_income: 0,
          total_expenses: 0,
          total_balance: 0,
        });
      }
    } catch (error) {
      console.error("Monthly summary error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, filterRequest]);

  // --------------------------------------------------
  // Load summary when month changes
  // --------------------------------------------------

  useEffect(() => {
    fetchMonthlySummary();
  }, [fetchMonthlySummary]);

  // --------------------------------------------------
  // Month navigation
  // --------------------------------------------------

  const changeMonth = (direction: "prev" | "next") => {
    setCurrentMonth((previous) => {
      const month = moment(previous.start, "YYYY-MM-DD");

      if (direction === "prev") {
        month.subtract(1, "month");
      } else {
        month.add(1, "month");
      }

      return getMonthRange(month.year(), month.month());
    });
  };

  // --------------------------------------------------
  // Balance cards
  // --------------------------------------------------

  const balanceInfoData: BalanceInfoItem[] = [
    {
      title: "Income",
      amount: summary.total_income,
      icon: ArrowUp,
      iconColor: "#0E9B1C",
      iconBgColor: "#E7F8E9",
    },
    {
      title: "Expenses",
      amount: summary.total_expenses,
      icon: ArrowDown,
      iconColor: "#F41010",
      iconBgColor: "#FEEBEC",
    },
    {
      title: "Previous Balance",
      amount: summary.previous_balance,
      icon: Wallet,
      iconColor: "#000000",
      iconBgColor: "#F2F3F5",
    },
  ];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">

      {/* Month Navigation */}
      <div className="flex items-center justify-between gap-3 border-b pb-4">

        <button
          type="button"
          onClick={() => changeMonth("prev")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex min-w-0 items-center justify-center gap-2">
          <CalendarDays size={19} className="shrink-0" />

          <span className="text-center text-sm font-semibold sm:text-base">
            {moment(currentMonth.start).format("DD MMM YYYY")}
            {" - "}
            {moment(currentMonth.end).format("DD MMM YYYY")}
          </span>
        </div>

        <button
          type="button"
          onClick={() => changeMonth("next")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
          aria-label="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 divide-x py-5">
        {balanceInfoData.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex min-w-0 flex-col items-center gap-2 px-2 sm:flex-row sm:gap-3 sm:px-4"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                style={{ backgroundColor: item.iconBgColor }}
              >
                <Icon
                  size={20}
                  color={item.iconColor}
                  strokeWidth={2.5}
                />
              </div>

              <div className="min-w-0 text-center sm:text-left">
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {item.title}
                </p>

                <p
                  className="mt-1 break-all text-sm font-bold sm:text-base"
                  style={{ color: item.iconColor }}
                >
                  {loading ? "..." : formatCurrency(item.amount)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Balance Breakdown */}
      <div className="rounded-xl bg-muted/60 p-4">

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Previous Balance
          </span>

          <span className="text-sm font-semibold tabular-nums">
            {loading ? "..." : formatCurrency(summary.previous_balance)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            + Total Income
          </span>

          <span className="text-sm font-semibold text-emerald-600 tabular-nums">
            {loading ? "..." : formatCurrency(summary.total_income)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            − Total Expenses
          </span>

          <span className="text-sm font-semibold text-red-600 tabular-nums">
            {loading ? "..." : formatCurrency(summary.total_expenses)}
          </span>
        </div>

        <div className="my-4 border-t" />

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">
              Total Balance
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Previous balance + income − expenses
            </p>
          </div>

          <p className="text-lg font-extrabold text-emerald-600 tabular-nums sm:text-xl">
            {loading ? "..." : formatCurrency(summary.total_balance)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalanceInfo;
