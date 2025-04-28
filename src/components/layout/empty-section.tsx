import { Card, CardContent } from "../ui/card";

export default function EmptySection({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent>
        <div className="py-12 text-center">
          <h3 className="mb-2 text-lg font-medium">{title}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
