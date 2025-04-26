import { Separator } from "../ui/separator";

type HeadingProps = {
  title: string;
  actions?: React.ReactNode;
};

export function Heading({ title, actions }: HeadingProps) {
  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{title}</h3>
        </div>
        {actions}
      </div>
      <Separator />
    </>
  );
}
