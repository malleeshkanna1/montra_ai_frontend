
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAxios } from "@/hooks/useAxios";

import {
  CalendarDays,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Receipt,
} from "lucide-react";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface Transaction {
  id: number;
  amount: number;
  category: string | number;
  date: string;
  mode: "income" | "expense";
  notes: string;
  payment: string;
}

interface Category {
  id: number;
  category: string;
  expense_type: "income" | "expense";
  expense_classification: string | null;
  description: string;
}

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSaved: () => void;
}

// --------------------------------------------------
// Validation
// --------------------------------------------------

const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (value) => Number.isFinite(Number(value)) && Number(value) > 0,
      "Enter a valid amount greater than zero"
    ),

  mode: z.enum(["income", "expense"]),

  category: z.string().min(1, "Please select a category"),

  date: z.string().min(1, "Date is required"),

  payment: z.string().min(1, "Please select a payment method"),

  notes: z.string().max(250, "Maximum 250 characters allowed"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function extractCategories(response: unknown): Category[] {
  // Direct API response: [...]
  if (Array.isArray(response)) {
    return response as Category[];
  }

  // Axios response: { data: [...] }
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray(response.data)
  ) {
    return response.data as Category[];
  }

  return [];
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSaved,
}: EditTransactionDialogProps) {
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { request: categoryRequest } = useAxios<unknown>();
  const { request: updateRequest } = useAxios<unknown>();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      mode: "expense",
      category: "",
      date: "",
      payment: "upi",
      notes: "",
    },
  });

  const selectedMode = form.watch("mode");

  // --------------------------------------------------
  // Load categories
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);

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

        const incomeData = extractCategories(incomeResponse);
        const expenseData = extractCategories(expenseResponse);

        setIncomeCategories(incomeData);
        setExpenseCategories(expenseData);

        if (!Array.isArray(incomeResponse) && incomeData.length === 0) {
          console.error("Unexpected income category response:", incomeResponse);
        }

        if (!Array.isArray(expenseResponse) && expenseData.length === 0) {
          console.error("Unexpected expense category response:", expenseResponse);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Category loading error:", error);
          toast.error("Unable to load categories");
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [open, categoryRequest]);

  // --------------------------------------------------
  // Populate form when transaction changes
  // --------------------------------------------------

  useEffect(() => {
    if (!open || !transaction) return;

    form.reset({
      amount: String(transaction.amount),
      mode: transaction.mode,
      category: String(transaction.category),
      date: transaction.date,
      payment: transaction.payment,
      notes: transaction.notes ?? "",
    });
  }, [open, transaction, form]);

  // --------------------------------------------------
  // Filter categories based on transaction mode
  // --------------------------------------------------

  const filteredCategories = useMemo(() => {
    return selectedMode === "income"
      ? incomeCategories
      : expenseCategories;
  }, [selectedMode, incomeCategories, expenseCategories]);

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const onSubmit = async (values: TransactionFormValues) => {
    if (!transaction) return;

    setSaving(true);

    try {
      const response = await updateRequest({
        method: "PUT",
        url: `/api/transaction/update/${transaction.id}`,
        data: {
          amount: Number(values.amount),
          category: Number(values.category),
          date: values.date,
          mode: values.mode,
          notes: values.notes.trim(),
          payment: values.payment,
        },
      });

      // If your API returns { status: false }, treat it as a failure.
      if (
        response &&
        typeof response === "object" &&
        "status" in response &&
        response.status === false
      ) {
        const message =
          "message" in response && typeof response.message === "string"
            ? response.message
            : "Unable to update transaction";

        toast.error(message);
        return;
      }

      toast.success("Transaction updated successfully");

      onOpenChange(false);
      onSaved();
    } catch (error) {
      console.error("Transaction update error:", error);
      toast.error("Unable to update transaction");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-24px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        {/* FIXED HEADER */}
        <DialogHeader className="shrink-0 border-b bg-background px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
              <Receipt className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-lg font-semibold">
                Edit Transaction
              </DialogTitle>

              <DialogDescription className="text-xs">
                Update your income or expense details
              </DialogDescription>
            </div>
          </div>

          {/* Transaction mode */}
          <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                form.setValue("mode", "income");
                form.setValue("category", "");
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${selectedMode === "income"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Income
            </button>

            <button
              type="button"
              onClick={() => {
                form.setValue("mode", "expense");
                form.setValue("category", "");
              }}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${selectedMode === "expense"
                  ? "bg-white text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Expense
            </button>
          </div>
        </DialogHeader>

        {/* SCROLLABLE BODY */}
        <form
          id="edit-transaction-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="min-h-0 flex-1 overflow-y-auto scrollbar-none"
        >
          <div className="space-y-5 px-5 py-5 sm:px-6">

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                  ₹
                </span>

                <Input
                  id="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="h-14 pl-9 text-2xl font-semibold"
                  {...form.register("amount")}
                />
              </div>

              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>

              <select
                id="category"
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={categoriesLoading}
                {...form.register("category")}
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select category"}
                </option>

                {filteredCategories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.category}
                  </option>
                ))}
              </select>

              {categoriesLoading && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading categories
                </p>
              )}

              {!categoriesLoading && filteredCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No {selectedMode} categories available.
                </p>
              )}

              {form.formState.errors.category && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            {/* Date and Payment */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    id="date"
                    type="date"
                    className="h-11 pl-9"
                    {...form.register("date")}
                  />
                </div>

                {form.formState.errors.date && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment Method</Label>

                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <select
                    id="payment"
                    className="flex h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    {...form.register("payment")}
                  >
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {form.formState.errors.payment && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.payment.message}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Notes</Label>
                <span className="text-xs text-muted-foreground">
                  Optional
                </span>
              </div>

              <Textarea
                id="notes"
                placeholder="Add a note about this transaction..."
                rows={3}
                className="resize-none"
                {...form.register("notes")}
              />

              {form.formState.errors.notes && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* FIXED FOOTER */}
        <DialogFooter className="shrink-0 flex-row gap-3 mb-2 border-t bg-background px-5 py-4 sm:px-6 sm:py-5">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="edit-transaction-form"
            className="h-11 flex-1 bg-black text-white hover:bg-black/90"
            disabled={saving || categoriesLoading}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
