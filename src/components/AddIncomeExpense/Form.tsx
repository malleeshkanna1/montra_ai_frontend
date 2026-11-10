
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "../ui/button";
import AmountInput from "./AmountInput";
import DateTimeInput from "./DateTimeInput";
import NotesInput from "./NotesInput";
import CategoryField from "./CategoryField";
import PaymentField from "./PaymentField";
import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "@/types/profile";
import { useAxios } from "@/hooks/useAxios";

export interface IncomeFormData {
  amount: string;
  category: string;
  payment: string;
  notes: string;
  date: string;
  time: string;
  mode: string;
}

type FormProps = {
  mode: "income" | "expense";
};

type TransactionPayload = Omit<IncomeFormData, "category"> & {
  category: number;
};

const getCurrentDateTime = () => {
  const now = new Date();

  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join(":");

  return { date, time };
};


const getApiErrorMessage = (err: unknown): string => {
  const fallback = "Unable to save the transaction. Please try again.";

  if (!axios.isAxiosError(err)) {
    return fallback;
  }

  const detail = err.response?.data?.detail;
  const apiMessage = err.response?.data?.message;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item: { loc?: (string | number)[]; msg?: string }) => {
        const field = item.loc?.at(-1);
        const fieldName =
          typeof field === "string"
            ? field.replaceAll("_", " ")
            : "Input";

        return `${fieldName}: ${item.msg ?? "Invalid value"}`;
      })
      .join(". ");
  }

  if (typeof apiMessage === "string") {
    return apiMessage;
  }

  return fallback;
};

const Form = ({ mode }: FormProps) => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<IncomeFormData>({
    defaultValues: {
      amount: "",
      category: "",
      payment: "",
      notes: "",
      ...getCurrentDateTime(),
      mode,
    },
  });

  const { loading, request } = useAxios();
  const { refreshProfile } = useOutletContext<LayoutContext>();


  useEffect(() => {
    setValue("mode", mode);
    setValue("category", "");
    setValue("payment", "");
  }, [mode, setValue]);

  const submitForm: SubmitHandler<IncomeFormData> = async (data) => {
    if (!data.category || !Number.isInteger(Number(data.category))) {
      toast.error("Validation error", {
        description: "Please select a valid category.",
      });
      return;
    }

    if (!data.payment) {
      toast.error("Validation error", {
        description: "Please select a payment method.",
      });
      return;
    }

    const payload: TransactionPayload = {
      ...data,
      category: Number(data.category),
      mode,
    };

    try {
      await request({
        method: "POST",
        url: "/api/transaction/add",
        data: payload,
      });

      toast.success(
        mode === "income"
          ? "Income saved successfully"
          : "Expense saved successfully"
      );

      await refreshProfile();


      // Clear all fields and refresh the current date and time.
      reset({
        amount: "",
        category: "",
        payment: "",
        notes: "",
        ...getCurrentDateTime(),
        mode,
      });
    } catch (err: unknown) {
      console.error("Transaction submission failed:", err);

      toast.error("Transaction failed", {
        description: getApiErrorMessage(err),
      });
    }
  };

  return (
    <div className="pb-10">
      <form onSubmit={handleSubmit(submitForm)}>
        <AmountInput
          register={register}
          setValue={setValue}
          error={errors.amount?.message}
        />

        <CategoryField
          control={control}
          name="category"
          mode={mode}
          error={errors.category?.message}
          placeholder="Select category"
        />

        <PaymentField
          control={control}
          error={errors.payment?.message}
        />

        <NotesInput
          register={register}
          watch={watch}
          error={errors.notes?.message}
        />

        <DateTimeInput
          register={register}
          setValue={setValue}
          dateError={errors.date?.message}
          timeError={errors.time?.message}
        />

        <div className="mt-5 flex gap-3">
          <Button
            className="w-1/2 cursor-pointer"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : mode === "income"
                ? "Save Income"
                : "Save Expense"}
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/")}
            disabled={loading}
            className="w-1/2 cursor-pointer bg-[#eee] text-black hover:bg-[#d7d4d4]"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;
