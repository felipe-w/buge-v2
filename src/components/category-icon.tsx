import { categoryTypeConfig, cn } from "@/lib/utils";

interface CategoryIconProps {
  categoryType: "income" | "expense" | "transfer";
  size?: number;
  className?: string;
}

export function CategoryIcon({ categoryType, size = 24, className }: CategoryIconProps) {
  const typeConfig = categoryTypeConfig[categoryType];

  return (
    <typeConfig.icon
      size={size}
      className={cn(
        typeConfig.colors.textDark,
        typeConfig.colors.bgMedium,
        typeConfig.colors.border,
        "rounded-md p-1 border",
        className,
      )}
    />
  );
}
