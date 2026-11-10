
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    CreditCard,
    Loader2,
    Pencil,
    Receipt,
    RefreshCw,
    Trash2,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAxios } from "@/hooks/useAxios";

import EditTransactionDialog from "../TransactionHistory/EditTransactionDialog";
import DeleteTransactionDialog from "../TransactionHistory/DeleteTransactionDialog";

import { getCategoryIcon } from "@/components/AddIncomeExpense/categoryIcons";
import { useOutletContext, useNavigate } from "react-router-dom";
import type { LayoutContext } from "@/types/profile";

// --------------------------------------------------
// Types
// --------------------------------------------------

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

interface ApiResponse<T> {
    status?: boolean;
    message?: string;
    data?: T;
}

interface TransactionHistoryProps {
    limit?: number;
}

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

    // API response: { status: true, data: [...] }
    if (Array.isArray(result.data)) {
        return result.data as T[];
    }

    // Axios response: { data: { status: true, data: [...] } }
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
// Helpers
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

export default function TransactionHistory({
    limit = 5,
}: TransactionHistoryProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { refreshProfile } = useOutletContext<LayoutContext>();
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { request: transactionRequest } =
        useAxios<ApiResponse<Transaction[]>>();

    const { request: categoryRequest } =
        useAxios<unknown>();

    // --------------------------------------------------
    // Fetch transactions
    // --------------------------------------------------

    const fetchTransactions = useCallback(async () => {
        try {
            const response = await transactionRequest({
                method: "GET",
                url: "/api/transaction/recent",
            });

            const transactionData = extractArray<Transaction>(response);

            setTransactions(transactionData);
        } catch (error) {
            console.error("Transaction fetching error:", error);
            toast.error("Unable to load transactions");
        }
    }, [transactionRequest]);

    // --------------------------------------------------
    // Fetch categories
    // --------------------------------------------------

    const fetchCategories = useCallback(async () => {
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

            const incomeData = extractArray<Category>(incomeResponse);
            const expenseData = extractArray<Category>(expenseResponse);

            setCategories([...incomeData, ...expenseData]);
        } catch (error) {
            console.error("Category fetching error:", error);
            toast.error("Unable to load transaction categories");
        }
    }, [categoryRequest]);

    // --------------------------------------------------
    // Initial loading
    // --------------------------------------------------

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            await Promise.all([
                fetchTransactions(),
                fetchCategories(),
            ]);
        } finally {
            setLoading(false);
        }
    }, [fetchTransactions, fetchCategories]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --------------------------------------------------
    // Refresh transactions
    // --------------------------------------------------

    const refreshTransactions = useCallback(async () => {
        setRefreshing(true);

        try {
            await Promise.all([
                fetchTransactions(),
                refreshProfile(),
            ]);
        } finally {
            setRefreshing(false);
        }
    }, [fetchTransactions, refreshProfile]);

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
    // Edit transaction
    // --------------------------------------------------

    const handleEdit = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setEditOpen(true);
    };

    // --------------------------------------------------
    // Delete transaction
    // --------------------------------------------------

    const handleDelete = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setDeleteOpen(true);
    };

    // --------------------------------------------------
    // Render loading state
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p className="text-sm">Loading transactions...</p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <>
            <section className="w-full space-y-4">
                {/* Header */}
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Receipt className="h-5 w-5" />
                        </div>

                        <div>
                            <h2 className="text-base font-semibold">
                                Recent Transactions
                            </h2>

                            <p className="text-xs text-muted-foreground">
                                Your latest financial activity
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* All Transactions */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 gap-2 rounded-lg"
                            onClick={() => navigate("/transactions")}
                        >
                            All Transactions
                            <ArrowRight className="h-4 w-4" />
                        </Button>

                        {/* Refresh */}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg"
                            onClick={refreshTransactions}
                            disabled={refreshing}
                            title="Refresh transactions"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    refreshing ? "animate-spin" : ""
                                }`}
                            />
                        </Button>
                    </div>
                </div>

                {/* Empty state */}
                {transactions.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Receipt className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <h3 className="text-sm font-semibold">
                            No transactions yet
                        </h3>

                        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                            Your recent income and expenses will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border bg-background">

                        {/* Transaction list */}
                        <div className="divide-y">
                            {transactions.slice(0, limit).map((transaction) => {
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
                                        {/* Category icon */}
                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isIncome
                                                ? "bg-emerald-50 text-emerald-700"
                                                : "bg-orange-50 text-orange-700"
                                                }`}
                                        >
                                            <CategoryIcon className="h-5 w-5" />
                                        </div>

                                        {/* Transaction details */}
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

                                        {/* Amount and actions */}
                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <p
                                                className={`whitespace-nowrap text-sm font-semibold tabular-nums ${isIncome
                                                    ? "text-emerald-600"
                                                    : "text-foreground"
                                                    }`}
                                            >
                                                {isIncome ? "+" : "-"}
                                                {formatCurrency(Number(transaction.amount))}
                                            </p>

                                            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
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

                        {/* Footer */}
                        {transactions.length > limit && (
                            <div className="border-t px-4 py-3 text-center">
                                <p className="text-xs text-muted-foreground">
                                    Showing {limit} of {transactions.length} transactions
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Edit dialog */}
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

            {/* Delete dialog */}
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
