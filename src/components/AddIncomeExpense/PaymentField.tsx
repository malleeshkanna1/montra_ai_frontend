
import {
  ArrowRightLeft,
  Banknote,
  CreditCard,
  Globe,
  Landmark,
  type LucideIcon,
} from "lucide-react";

import {
  Controller,
  type Control,
} from "react-hook-form";

import {
  Field,
  FieldLabel,
} from "../ui/field";

import {
  InputGroup,
  InputGroupAddon,
} from "../ui/input-group";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { IncomeFormData } from "./Form";

type PaymentIconNames =
  | "bank"
  | "card"
  | "cash"
  | "others"
  | "upi";

type PaymentItem = {
  label: string;
  value: PaymentIconNames;
};

const paymentItems: PaymentItem[] = [
  { label: "Bank", value: "bank" },
  { label: "Card", value: "card" },
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
  { label: "Others", value: "others" },
];

const paymentIcons: Record<PaymentIconNames, LucideIcon> = {
  bank: Landmark,
  card: CreditCard,
  cash: Banknote,
  others: ArrowRightLeft,
  upi: Globe,
};

type PaymentFieldProps = {
  control: Control<IncomeFormData>;
  error?: string;
  disabled?: boolean;
};

const PaymentField = ({
  control,
  error,
  disabled = false,
}: PaymentFieldProps) => {
  return (
    <div className="mt-3">
      <Field>
        <FieldLabel className="font-bold" htmlFor="payment">
          Payment Method
        </FieldLabel>

        <Controller
          control={control}
          name="payment"
          rules={{
            required: "Payment method is required",
          }}
          render={({ field }) => {
            const selectedPayment = paymentItems.find(
              (item) => item.value === field.value
            );

            const CurrentIcon = selectedPayment
              ? paymentIcons[selectedPayment.value]
              : Landmark;

            return (
              <InputGroup
                className={
                  error
                    ? "border-red-500 focus-within:ring-1 focus-within:ring-red-500"
                    : ""
                }
              >
                <InputGroupAddon align="inline-start">
                  <CurrentIcon
                    className="text-muted-foreground"
                    size={20}
                  />
                </InputGroupAddon>

                <Select
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  disabled={disabled}
                >
                  <SelectTrigger
                    id="payment"
                    ref={field.ref}
                    onBlur={field.onBlur}
                    aria-invalid={Boolean(error)}
                    className="w-full border-0 shadow-none focus:ring-0"
                  >
                    <SelectValue placeholder="Select a payment" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Method</SelectLabel>

                      {paymentItems.map((item) => {
                        const ItemIcon = paymentIcons[item.value];

                        return (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                          >
                            <div className="flex items-center gap-2">
                              <ItemIcon
                                className="text-muted-foreground"
                                size={18}
                              />
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </InputGroup>
            );
          }}
        />

        {error && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </Field>
    </div>
  );
};

export default PaymentField;
