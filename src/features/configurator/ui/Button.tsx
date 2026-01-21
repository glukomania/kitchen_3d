type ButtonProps = {
  title: string;
};

export function Button(props: ButtonProps) {
  return (
    <button type="button" className="configurator-button h-12 rounded-lg border border-slate-300 bg-slate-100 font-medium text-slate-900 hover:bg-slate-200" title={props.title}>
      {props.title}
    </button>
  );
}
