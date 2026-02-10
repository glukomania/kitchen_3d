type ButtonProps = {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
};

export function Button(props: ButtonProps) {
  const handleClick = () => {
    console.log('🔘 [Button] Clicked:', props.title);
    if (props.onClick) {
      props.onClick();
    } else {
      console.warn('⚠️ [Button] No onClick handler provided for:', props.title);
    }
  };

  return (
    <button 
      type="button" 
      className="configurator-button h-12 rounded-lg border border-slate-300 bg-slate-100 font-medium text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed" 
      title={props.title}
      onClick={handleClick}
      disabled={props.disabled}
    >
      {props.title}
    </button>
  );
}
