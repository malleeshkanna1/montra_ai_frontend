import { useCallback, useEffect, useState } from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues, 
} from "react-hook-form";
import {
  ChevronDown,
  LoaderCircle,
  Receipt,
} from "lucide-react";

import { useAxios } from "@/hooks/useAxios";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getCategoryIcon } from "./categoryIcons";
import { FieldLabel } from "../ui/field";

type CategoryMode = "income" | "expense";

interface ServerCategory {
  id: number | string;
  category: string;
  description?: string | null;
  exp_type?: CategoryMode;
  expense_type?: CategoryMode;
  expense_classification?:
    | "essential"
    | "discretionary"
    | "other"
    | null;
  icon?: string | null;
}

interface CategoryFieldProps<
  TFieldValues extends FieldValues,
> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  mode: CategoryMode;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function CategoryField<
  TFieldValues extends FieldValues,
>({
  control,
  name,
  mode,
  error,
  placeholder = "Select category",
  disabled = false,
}: CategoryFieldProps<TFieldValues>) {
  const {
    loading,
    error: fetchError,
    request,
  } = useAxios<ServerCategory[]>();

  const [categories, setCategories] = useState<
    ServerCategory[]
  >([]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await request({
        method: "GET",
        url: `/api/categories/category/${mode}`,
      });

      if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch {
      setCategories([]);
    }
  }, [mode, request]);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="mt-3 w-full space-y-1.5">
      <FieldLabel
        className="font-bold"
        htmlFor="category"
      >
        Category
      </FieldLabel>

      <Controller
        control={control}
        name={name}
        rules={{
          required: "Please select a category.",
          validate: (value) =>
            (value !== "" && value != null) ||
            "Please select a category.",
        }}
        render={({ field, fieldState }) => {
          const validationError =
            fieldState.error?.message || error;

          const hasError = Boolean(validationError);

          const selectedValue =
            field.value == null || field.value === ""
              ? ""
              : String(field.value);

          const selectedCategory = categories.find(
            (category) =>
              String(category.id) === selectedValue
          );

          const SelectedIcon = selectedCategory
            ? getCategoryIcon(
                selectedCategory.icon,
                selectedCategory.category
              )
            : Receipt;

          return (
            <div className="space-y-1.5">
              <Select
                value={selectedValue}
                onValueChange={field.onChange}
                disabled={disabled || loading}
              >
                <SelectTrigger
                  id="category"
                  ref={field.ref}
                  name={field.name}
                  onBlur={field.onBlur}
                  aria-invalid={hasError}
                  aria-describedby={
                    hasError
                      ? "category-error"
                      : undefined
                  }
                  className={`w-full ${
                    hasError
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }`}
                >
                  {selectedCategory ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <SelectedIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">
                        {selectedCategory.category}
                      </span>
                    </div>
                  ) : (
                    <SelectValue
                      placeholder={
                        loading
                          ? "Loading categories..."
                          : placeholder
                      }
                    />
                  )}

                  {loading ? (
                    <LoaderCircle className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                  )}
                </SelectTrigger>

                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((category) => {
                      const Icon = getCategoryIcon(
                        category.icon,
                        category.category
                      );

                      return (
                        <SelectItem
                          key={category.id}
                          value={String(category.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>
                              {category.category}
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      {loading
                        ? "Loading categories..."
                        : fetchError
                          ? "Unable to load categories"
                          : "No categories available"}
                    </div>
                  )}
                </SelectContent>
              </Select>

              {validationError && (
                <p
                  id="category-error"
                  className="text-sm text-destructive"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

