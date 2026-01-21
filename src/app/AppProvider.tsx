import type { PropsWithChildren } from "react";

// Zustand doesn't require a Provider, but we keep this component
// for compatibility with existing code that passes store prop
export function AppProvider(props: PropsWithChildren<{ store?: unknown }>) {
  return <>{props.children}</>;
}



