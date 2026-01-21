import "@/styles/index.css";
import { defineConfiguratorElement } from "@/widget/defineElement";

// Auto-define for drop-in usage in host pages.
// If you want manual control, import and call `defineConfiguratorElement()` yourself.
if (typeof window !== "undefined") {
  defineConfiguratorElement();
}

export { defineConfiguratorElement };



