
import { Field, FieldLabel } from "../ui/field";

import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "../ui/input-group";

import type {
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";

import type { IncomeFormData } from "./Form";

interface NotesInputProps {
  register: UseFormRegister<IncomeFormData>;
  watch: UseFormWatch<IncomeFormData>;
  error?: string;
}

export default function NotesInput({
  register,
  watch,
  error,
}: NotesInputProps) {
  const MAX_CONTENT_LENGTH = 250;

  const notes = watch("notes") || "";

  return (
    <Field className="mt-3">
      <FieldLabel
        className="font-bold"
        htmlFor="block-end-textarea"
      >
        Notes (Optional)
      </FieldLabel>

      <InputGroup
        className={
          error
            ? "border-red-500"
            : ""
        }
      >
        <InputGroupTextarea
          id="block-end-textarea"
          placeholder={`Add Notes... (${MAX_CONTENT_LENGTH} Chars Max)`}
          maxLength={MAX_CONTENT_LENGTH}
          {...register("notes", {
            maxLength: {
              value: MAX_CONTENT_LENGTH,
              message: `Notes cannot exceed ${MAX_CONTENT_LENGTH} characters`,
            },
          })}
        />

        <InputGroupAddon align="block-end">
          <InputGroupText className="ml-auto">
            {notes.length}/{MAX_CONTENT_LENGTH}
          </InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      {error && (
        <p className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </Field>
  );
}
