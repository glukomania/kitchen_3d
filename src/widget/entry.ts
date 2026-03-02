import "@/styles/index.css";
import { defineConfiguratorElement } from "@/widget/defineElement";

// Auto-define for drop-in usage in host pages.
// Registers both default tag and common embed tag so examples work without code changes.
if (typeof window !== "undefined") {
  defineConfiguratorElement();
  defineConfiguratorElement({ tagName: "kitchen-configurator-widget" });
}

export { defineConfiguratorElement };



