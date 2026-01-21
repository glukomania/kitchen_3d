type Swatch = { id: string; label: string; color: string };

type Props = {
  value: string;
  onChange: (id: string) => void;
  swatches: Swatch[];
};

export function SwatchRow(props: Props) {
  return (
    <div className="mt-2 flex gap-2">
      {props.swatches.map((s) => {
        const active = s.id === props.value;
        return (
          <button
            key={s.id}
            type="button"
            title={s.label}
            aria-label={s.label}
            onClick={() => props.onChange(s.id)}
            className={[
              "h-7 w-7 rounded-full border",
              active ? "border-slate-900 ring-2 ring-slate-900/30" : "border-slate-200"
            ].join(" ")}
            style={{ backgroundColor: s.color }}
          />
        );
      })}
    </div>
  );
}



