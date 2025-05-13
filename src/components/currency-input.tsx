import { useState } from "react";
import CurrencyInput, { CurrencyInputProps } from "react-currency-input-field";

import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

function CurrencyMaskedInput({ name, defaultValue, className, ...restProps }: CurrencyInputProps) {
  const [value, setValue] = useState(defaultValue?.toString() || "");

  const handleValueChange = (newValue: string | undefined) => {
    if (newValue) {
      const formattedValue = newValue.replace(",", ".");
      setValue(formattedValue);
      restProps.onValueChange?.(formattedValue);
    }
  };

  return (
    <div className="flex rounded-md shadow-xs">
      <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-s-md border px-3 text-sm">
        R$
      </span>
      <CurrencyInput
        placeholder="0,00"
        intlConfig={{ locale: "pt-BR" }}
        allowNegativeValue={false}
        defaultValue={defaultValue}
        {...restProps}
        onValueChange={handleValueChange}
        customInput={Input}
        className={cn("-ms-px rounded-s-none font-medium tabular-nums shadow-none", className)}
        name={undefined}
      />
      <input type="hidden" value={value} name={name} />
    </div>
  );
}

export default CurrencyMaskedInput;
