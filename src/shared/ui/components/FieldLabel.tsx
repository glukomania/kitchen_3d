import type { PropsWithChildren } from "react";

export function FieldLabel(props: PropsWithChildren) {
  return (
    <div className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
      {props.children}
    </div>
  );
}



