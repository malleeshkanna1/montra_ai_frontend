import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useAxios } from "@/hooks/useAxios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

interface ApiResponse<T> {
  status: boolean;
  data: T;
  message?: string;
}

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number | null;
  onDeleted: () => void;
}

const DeleteTransactionDialog: React.FC<
  DeleteTransactionDialogProps
> = ({
  open,
  onOpenChange,
  transactionId,
  onDeleted,
}) => {
  const { request, loading } = useAxios<ApiResponse<unknown>>();

  const handleDelete = async () => {
    if (!transactionId) return;

    try {
      const response = await request({
        method: "DELETE",
        url: `/api/transaction/delete/${transactionId}`,
      });

      if (response?.status) {
        toast.success(
          response.message ?? "Transaction deleted successfully"
        );

        onOpenChange(false);
        onDeleted();
      } else {
        toast.error(
          response?.message ?? "Unable to delete transaction"
        );
      }
    } catch (error) {
      console.error("Delete transaction error:", error);
      toast.error("Something went wrong while deleting");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Trash2 className="text-red-600" size={22} />
          </div>

          <DialogTitle className="text-lg font-bold">
            Delete Transaction?
          </DialogTitle>

          <DialogDescription className="leading-relaxed">
            Are you sure you want to delete this transaction?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-3 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || transactionId === null}
          >
            {loading ? (
              <LoaderCircle className="mr-2 animate-spin" size={16} />
            ) : (
              <Trash2 className="mr-2" size={16} />
            )}

            {loading ? "Deleting..." : "Delete Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTransactionDialog;