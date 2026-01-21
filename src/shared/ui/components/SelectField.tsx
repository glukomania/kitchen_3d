type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

export function SelectField(props: Props) {
  return (
    <select
      className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-slate-400"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      {props.options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}



