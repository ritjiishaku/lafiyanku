"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { PatientInputFormData } from "./PatientInputForm";

export function MedicationRow() {
  const { control } = useFormContext<PatientInputFormData>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medications",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>
          Medications <span className="text-red-500">*</span>
        </FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              dosage: "",
              frequency: "",
              timing: "",
              duration: "",
              notes: "",
            })
          }
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Medication
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-cool-grey">
              Medication #{index + 1}
            </span>
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField
              control={control}
              name={`medications.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Amlodipine" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`medications.${index}.dosage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Dosage <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 5mg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`medications.${index}.frequency`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Frequency <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. once daily" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormField
              control={control}
              name={`medications.${index}.timing`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-cool-grey">
                    Timing <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. with food" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`medications.${index}.duration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-cool-grey">
                    Duration <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 7 days" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`medications.${index}.notes`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-cool-grey">
                    Notes <span className="text-xs">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. Avoid alcohol" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
