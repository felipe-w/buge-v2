import { Category } from "@/lib/db/types";
import { categoryTypeConfig, cn } from "@/lib/utils";

import { Badge } from "./ui/badge";

export default function CategoryBadge({ category }: { category: Category }) {
  const typeConfig = categoryTypeConfig[category.type];

  return (
    <Badge
      variant="outline"
      className={cn("rounded gap-1.5", typeConfig.colors.bgLight, typeConfig.colors.border, typeConfig.colors.textDark)}
    >
      <typeConfig.icon size={12} className="-ms-0.5" />
      {category.name}
    </Badge>
  );
}
