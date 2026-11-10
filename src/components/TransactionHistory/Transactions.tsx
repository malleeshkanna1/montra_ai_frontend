
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Loader2,
  Pencil,
  Receipt,
  RefreshCw,
  Trash2,
  X,
  CalendarRange,
} from "lucide-react";
import { format } from "date-fns";
import type { DateRange as CalendarDateRange } from "react-day-picker";
import { toast } from "sonner";
import { useNavigate, useOutletContext } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useAxios } from "@/hooks/useAxios";

import EditTransactionDialog from "@/components/TransactionHistory/EditTransactionDialog";
import DeleteTransactionDialog from "@/components/TransactionHistory/DeleteTransactionDialog";

import { getCategoryIcon } from "@/components/AddIncomeExpense/categoryIcons";
import type { LayoutContext } from "@/types/profile";

// --------------------------------------------------
// Types
// --------------------------------------------------

type TransactionPeriod =
  | "all_time"
  | "today"
  | "this_week"
  | "this_month"
  | "this_year";

interface Transaction {
  id: number;
  user_id: number;
  amount: number;
  mode: "income" | "expense";
  payment: string;
  date: string;
  notes: string;
  category: string | number;
}

interface Category {
  id: number;
  category: string;
  expense_type: "income" | "expense";
  expense_classification: string | null;
  description: string;
}

interface PeriodOption {
  label: string;
  value: TransactionPeriod;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

// --------------------------------------------------
// Constants
// --------------------------------------------------

const periodOptions: PeriodOption[] = [
  { label: "All Time", value: "all_time" },
  { label: "Today", value: "today" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "This Year", value: "this_year" },
];

// --------------------------------------------------
// Response helpers
// --------------------------------------------------

function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const result = response as Record<string, unknown>;

  if (Array.isArray(result.data)) {
    return result.data as T[];
  }

  if (
    result.data &&
    typeof result.data === "object" &&
    "data" in result.data
  ) {
    const nestedData = (result.data as Record<string, unknown>).data;

    if (Array.isArray(nestedData)) {
      return nestedData as T[];
    }
  }

  return [];
}

// --------------------------------------------------
// Formatting helpers
// --------------------------------------------------

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPayment(payment: string) {
  if (!payment) return "Other";

  const labels: Record<string, string> = {
    upi: "UPI",
    cash: "Cash",
    card: "Card",
    bank: "Bank Transfer",
    other: "Other",
  };

  return labels[payment.toLowerCase()] ?? payment;
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function Transactions() {
  const navigate = useNavigate();

  const { refreshProfile } = useOutletContext<LayoutContext>();

  const { request: transactionRequest } = useAxios<unknown>();
  const { request: categoryRequest } = useAxios<unknown>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Quick period filter
  const [period, setPeriod] = useState<TransactionPeriod>("all_time");

  // Custom date range
  const [showDateRange, setShowDateRange] = useState(false);

  const [selectedRange, setSelectedRange] = useState<
    CalendarDateRange | undefined
  >();

  const [appliedRange, setAppliedRange] = useState<DateRange | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // --------------------------------------------------
  // Fetch transactions
  // --------------------------------------------------

  const fetchTransactions = useCallback(async () => {
    let url: string;

    if (appliedRange) {
      const params = new URLSearchParams({
        start_date: appliedRange.startDate,
        end_date: appliedRange.endDate,
      });

      url = `/api/transaction/all?${params.toString()}`;
    } else {
      url = `/api/transaction/all?period=${period}`;
    }

    const response = await transactionRequest({
      method: "GET",
      url,
    });

    const transactionData = extractArray<Transaction>(response);

    setTransactions(transactionData);
  }, [period, appliedRange, transactionRequest]);

  // --------------------------------------------------
  // Load transactions
  // --------------------------------------------------

  const loadTransactions = useCallback(async () => {
    setLoading(true);

    try {
      await fetchTransactions();
    } catch (error) {
      console.error("Transaction fetching error:", error);
      toast.error("Unable to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [fetchTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // --------------------------------------------------
  // Load categories
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const [incomeResponse, expenseResponse] = await Promise.all([
          categoryRequest({
            method: "GET",
            url: "/api/categories/category/income",
          }),
          categoryRequest({
            method: "GET",
            url: "/api/categories/category/expense",
          }),
        ]);

        if (cancelled) return;

        setCategories([
          ...extractArray<Category>(incomeResponse),
          ...extractArray<Category>(expenseResponse),
        ]);
      } catch (error) {
        if (!cancelled) {
          console.error("Category fetching error:", error);
          toast.error("Unable to load categories");
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [categoryRequest]);

  // --------------------------------------------------
  // Refresh transactions and wallet
  // --------------------------------------------------

  const refreshTransactions = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchTransactions(),
        refreshProfile(),
      ]);
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Unable to refresh transactions");
    } finally {
      setRefreshing(false);
    }
  }, [fetchTransactions, refreshProfile]);

  // --------------------------------------------------
  // Quick period filter
  // --------------------------------------------------

  const handlePeriodChange = (value: TransactionPeriod) => {
    setPeriod(value);

    setAppliedRange(null);
    setSelectedRange(undefined);
    setShowDateRange(false);
  };

  // --------------------------------------------------
  // Apply custom date range
  // --------------------------------------------------

  const handleApplyDateRange = () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      toast.error("Please select both start and end dates");
      return;
    }

    const startDate = format(selectedRange.from, "yyyy-MM-dd");
    const endDate = format(selectedRange.to, "yyyy-MM-dd");

    setAppliedRange({
      startDate,
      endDate,
    });

    setShowDateRange(false);
  };

  // --------------------------------------------------
  // Reset selected dates
  // --------------------------------------------------

  const handleResetSelectedDates = () => {
    setSelectedRange(undefined);
  };

  // --------------------------------------------------
  // Clear applied date range
  // --------------------------------------------------

  const handleClearDateRange = () => {
    setSelectedRange(undefined);
    setAppliedRange(null);
    setShowDateRange(false);
    setPeriod("all_time");
  };

  // --------------------------------------------------
  // Category lookup
  // --------------------------------------------------

  const categoryMap = useMemo(() => {
    return new Map(
      categories.map((category) => [
        String(category.id),
        category,
      ])
    );
  }, [categories]);

  // --------------------------------------------------
  // Transaction statistics
  // --------------------------------------------------

  const statistics = useMemo(() => {
    return transactions.reduce(
      (result, transaction) => {
        const amount = Number(transaction.amount) || 0;

        if (transaction.mode === "income") {
          result.income += amount;
        } else if (transaction.mode === "expense") {
          result.expenses += amount;
        }

        return result;
      },
      { income: 0, expenses: 0 }
    );
  }, [transactions]);

  // --------------------------------------------------
  // Edit and delete handlers
  // --------------------------------------------------

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setEditOpen(true);
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteOpen(true);
  };

  // --------------------------------------------------
  // Filter label
  // --------------------------------------------------

  const selectedPeriodLabel = appliedRange
    ? `${formatDate(appliedRange.startDate)} - ${formatDate(
        appliedRange.endDate
      )}`
    : periodOptions.find((option) => option.value === period)?.label ??
      "All Time";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <section className="w-full space-y-6">

        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Receipt className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Transactions
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage and review your financial activity
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* Back to Home */}
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>

            {/* Refresh */}
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={refreshTransactions}
              disabled={refreshing || loading}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Income */}
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Income
                </p>

                <p className="mt-2 text-xl font-bold text-emerald-600">
                  {formatCurrency(statistics.income)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                <ArrowDownLeft className="h-5 w-5 text-emerald-700" />
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="rounded-xl border bg-background p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Expenses
                </p>

                <p className="mt-2 text-xl font-bold text-red-600">
                  {formatCurrency(statistics.expenses)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                <ArrowUpRight className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-base font-semibold">
                All Transactions
              </h2>

              <p className="text-xs text-muted-foreground">
                {selectedPeriodLabel} · {transactions.length} transactions
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              {/* Quick Period Filter */}
              <select
                value={period}
                onChange={(event) =>
                  handlePeriodChange(
                    event.target.value as TransactionPeriod
                  )
                }
                disabled={!!appliedRange}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:w-44 disabled:opacity-50"
                aria-label="Filter transactions by period"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Modern Date Range Picker */}
              <Popover
                open={showDateRange}
                onOpenChange={setShowDateRange}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={appliedRange ? "default" : "outline"}
                    className="h-10 w-full justify-start gap-2 rounded-lg px-3 sm:w-auto"
                  >
                    <CalendarRange className="h-4 w-4 shrink-0" />

                    {appliedRange ? (
                      <span className="text-xs">
                        {format(
                          new Date(`${appliedRange.startDate}T00:00:00`),
                          "dd MMM yyyy"
                        )}
                        {" - "}
                        {format(
                          new Date(`${appliedRange.endDate}T00:00:00`),
                          "dd MMM yyyy"
                        )}
                      </span>
                    ) : (
                      <span>Date Range</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  align="end"
                  sideOffset={8}
                  className="w-[calc(100vw-2rem)] max-w-[680px] overflow-hidden rounded-xl border bg-background p-0 shadow-xl sm:w-auto"
                >
                  {/* Popover Header */}
                  <div className="border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <CalendarDays className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          Custom Date Range
                        </h3>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Select the period you want to review
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Selected Dates */}
                  <div className="grid grid-cols-2 gap-3 px-4 pt-4">
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Start Date
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {selectedRange?.from
                          ? format(selectedRange.from, "dd MMM yyyy")
                          : "Select date"}
                      </p>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        End Date
                      </p>

                      <p className="mt-1 text-sm font-semibold">
                        {selectedRange?.to
                          ? format(selectedRange.to, "dd MMM yyyy")
                          : "Select date"}
                      </p>
                    </div>
                  </div>

                  {/* Calendar */}
                  <div className="flex justify-center overflow-x-auto p-3 sm:p-4">
                    <Calendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={setSelectedRange}
                      numberOfMonths={2}
                      initialFocus
                      disabled={{ after: new Date() }}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      onClick={handleResetSelectedDates}
                    >
                      <X className="h-3.5 w-3.5" />
                      Reset Dates
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDateRange(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="gap-2"
                        onClick={handleApplyDateRange}
                        disabled={
                          !selectedRange?.from ||
                          !selectedRange?.to
                        }
                      >
                        <CalendarDays className="h-3.5 w-3.5" />
                        Apply Filter
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Applied Range Indicator */}
          {appliedRange && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Showing transactions from{" "}
                <span className="font-medium text-foreground">
                  {formatDate(appliedRange.startDate)}
                </span>{" "}
                to{" "}
                <span className="font-medium text-foreground">
                  {formatDate(appliedRange.endDate)}
                </span>
              </p>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleClearDateRange}
              >
                <X className="h-3 w-3" />
                Clear Filter
              </Button>
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="overflow-hidden rounded-xl border bg-background">

          {loading ? (
            <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin" />
              <p className="text-sm">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Receipt className="h-7 w-7 text-muted-foreground" />
              </div>

              <h3 className="text-sm font-semibold">
                No transactions found
              </h3>

              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                There are no transactions for{" "}
                {selectedPeriodLabel.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="divide-y">

              {transactions.map((transaction) => {
                const category = categoryMap.get(
                  String(transaction.category)
                );

                const CategoryIcon = getCategoryIcon(
                  undefined,
                  category?.category
                );

                const isIncome = transaction.mode === "income";

                return (
                  <div
                    key={transaction.id}
                    className="group flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5"
                  >
                    {/* Category Icon */}
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      <CategoryIcon className="h-5 w-5" />
                    </div>

                    {/* Transaction Details */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {category?.category ??
                          transaction.notes ??
                          "Transaction"}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(transaction.date)}
                        </span>

                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {formatPayment(transaction.payment)}
                        </span>
                      </div>

                      {transaction.notes &&
                        transaction.notes !== category?.category && (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {transaction.notes}
                          </p>
                        )}
                    </div>

                    {/* Amount and Actions */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <p
                        className={`whitespace-nowrap text-sm font-semibold tabular-nums ${
                          isIncome
                            ? "text-emerald-600"
                            : "text-foreground"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(Number(transaction.amount))}
                      </p>

                      <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">

                        {/* Edit */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit transaction"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete transaction"
                          onClick={() => handleDelete(transaction)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Edit Dialog */}
      <EditTransactionDialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            setSelectedTransaction(null);
          }
        }}
        transaction={selectedTransaction}
        onSaved={refreshTransactions}
      />

      {/* Delete Dialog */}
      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setSelectedTransaction(null);
          }
        }}
        transactionId={selectedTransaction?.id ?? null}
        onDeleted={refreshTransactions}
      />
    </>
  );
}
