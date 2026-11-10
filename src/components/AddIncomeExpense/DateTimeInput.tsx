import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"

import { useEffect, useState } from "react"

import { Input } from "../ui/input"
import { Button } from "../ui/button"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover"

import { Calendar } from "../ui/calendar"

import { ChevronDownIcon } from "lucide-react"

import { format } from "date-fns"

import type {
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form"

import type { IncomeFormData } from "./Form"


interface DateTimeInputProps {
    register: UseFormRegister<IncomeFormData>
    setValue: UseFormSetValue<IncomeFormData>
    dateError?: string
    timeError?: string
}


const DateTimeInput: React.FC<DateTimeInputProps> = ({
    register,
    setValue,
    dateError,
    timeError,
}) => {

    const [open, setOpen] = useState(false)

    /*
     * Current date/time
     */
    const [date, setDate] = useState<Date>(
        new Date()
    )


    /*
     * Set current date and time
     * when component is mounted.
     */
    useEffect(() => {

        const now = new Date()

        /*
         * Date
         */
        setDate(now)

        setValue(
            "date",
            format(now, "yyyy-MM-dd"),
            {
                shouldValidate: false,
                shouldDirty: false,
            }
        )

        /*
         * Time
         */
        setValue(
            "time",
            format(now, "HH:mm:ss"),
            {
                shouldValidate: false,
                shouldDirty: false,
            }
        )

    }, [setValue])


    /*
     * Calendar date selection
     */
    function handleDateSelect(
        selectedDate: Date | undefined
    ) {

        if (!selectedDate) {
            return
        }

        setDate(selectedDate)

        setOpen(false)

        const formattedDate = format(
            selectedDate,
            "yyyy-MM-dd"
        )

        setValue(
            "date",
            formattedDate,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        )
    }


    return (
        <div className="mt-3">

            <FieldGroup className="mx-auto w-full sm:flex-row">

                {/* DATE */}

                <Field>

                    <FieldLabel
                        htmlFor="date-picker"
                        className="font-bold"
                    >
                        Date
                    </FieldLabel>


                    <Popover
                        open={open}
                        onOpenChange={setOpen}
                    >

                        <PopoverTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="outline"
                                    id="date-picker"
                                    className={`w-full justify-between font-normal ${
                                        dateError
                                            ? "border-red-500"
                                            : ""
                                    }`}
                                >

                                    {format(
                                        date,
                                        "PPP"
                                    )}

                                    <ChevronDownIcon
                                        data-icon="inline-end"
                                    />

                                </Button>
                            }
                        />


                        <PopoverContent
                            className="overflow-hidden w-auto p-0"
                            align="start"
                        >

                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                defaultMonth={date}
                                onSelect={
                                    handleDateSelect
                                }
                            />

                        </PopoverContent>

                    </Popover>


                    {dateError && (
                        <p className="text-sm text-red-500 mt-1">
                            {dateError}
                        </p>
                    )}

                </Field>


                {/* TIME */}

                <Field>

                    <FieldLabel
                        className="font-bold"
                        htmlFor="time-picker"
                    >
                        Time
                    </FieldLabel>


                    <Input
                        type="time"
                        id="time-picker"
                        step="1"

                        {...register("time", {
                            required:
                                "Time is required",
                        })}

                        className={`appearance-none w-full bg-background ${
                            timeError
                                ? "border-red-500"
                                : ""
                        } [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none`}
                    />


                    {timeError && (
                        <p className="text-sm text-red-500 mt-1">
                            {timeError}
                        </p>
                    )}

                </Field>

            </FieldGroup>

        </div>
    )
}


export default DateTimeInput
