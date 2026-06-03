"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormContext,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PatientInputFormData } from "./PatientInputForm";

export function LanguageSelector() {
  const { control } = useFormContext<PatientInputFormData>();

  return (
    <FormField
      control={control}
      name="languageRequested"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-cool-grey">
            Translation Language <span className="text-xs">(optional)</span>
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select language (default: English)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="en">English (no translation)</SelectItem>
              <SelectItem value="ha">Hausa</SelectItem>
              <SelectItem value="yo">Yoruba</SelectItem>
              <SelectItem value="ig">Igbo</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
