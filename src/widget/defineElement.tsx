import { createRoot, type Root } from "react-dom/client";
import { createElement } from "react";
import type { Catalog } from "@/features/configurator/model/types";
import { AppProvider } from "@/app/AppProvider";
import { WidgetRoot } from "@/widget/WidgetRoot";

type DefineOptions = {
  tagName?: string;
};

function parseJsonAttribute<T>(value: string | null): T | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function defineConfiguratorElement(options: DefineOptions = {}) {
  const tagName = options.tagName ?? "sk-configurator";
  if (customElements.get(tagName)) return;

  class SkConfiguratorElement extends HTMLElement {
    static observedAttributes = ["data-catalog", "data-config"];

    private _root: Root | null = null;

    connectedCallback() {
      if (!this._root) this._root = createRoot(this);
      this.render();
    }

    attributeChangedCallback() {
      this.render();
    }

    disconnectedCallback() {
      // Unmount React to avoid leaks.
      this._root?.unmount();
      this._root = null;
    }

    private getConfig(): { config?: unknown; catalog?: Catalog } {
      const configFromAttr = parseJsonAttribute<unknown>(this.getAttribute("data-config"));
      const catalogFromAttr = parseJsonAttribute<Catalog>(this.getAttribute("data-catalog"));
      if (configFromAttr !== undefined || catalogFromAttr !== undefined) {
        return { config: configFromAttr, catalog: catalogFromAttr };
      }
      const win = typeof window !== "undefined" ? (window as Window & { kitchenConfiguratorConfig?: unknown }) : undefined;
      const globalConfig = win?.kitchenConfiguratorConfig;
      if (globalConfig && typeof globalConfig === "object") {
        const c = globalConfig as { platform?: unknown; shopify?: unknown; catalog?: Catalog };
        return { config: globalConfig, catalog: c.catalog };
      }
      return { config: undefined, catalog: catalogFromAttr };
    }

    private render() {
      if (!this._root) return;

      const { config, catalog } = this.getConfig();

      this._root.render(
        createElement(
          AppProvider,
          {},
          createElement(WidgetRoot, { config, catalog })
        )
      );
    }
  }

  customElements.define(tagName, SkConfiguratorElement);
}



