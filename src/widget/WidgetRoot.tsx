import { useEffect, useMemo } from "react";
import type { Catalog } from "@/features/configurator/model/types";
import type { ShopifyConfig } from "@/integrations/shopify/client";
import { Configurator } from "@/features/configurator/ui/Configurator";
import { useAppDispatch } from "@/app/hooks";

type Props = {
  config?: {
    shopify?: ShopifyConfig;
    catalog?: Catalog;
  };
  catalog?: Catalog; // Legacy support
};

export function WidgetRoot(props: Props) {
  const dispatch = useAppDispatch();
  const config = useMemo(() => props.config, [props.config]);
  const legacyCatalog = useMemo(() => props.catalog, [props.catalog]);

  useEffect(() => {
    queueMicrotask(async () => {
      if (config?.shopify) {
        // Initialize Shopify integration
        await dispatch.initShopify(config.shopify);
      } else if (config?.catalog) {
        // Use catalog from config
        dispatch.setCatalog(config.catalog);
      } else if (legacyCatalog) {
        // Legacy support for direct catalog prop
        dispatch.setCatalog(legacyCatalog);
      }
    });
  }, [config, legacyCatalog, dispatch]);

  return <Configurator />;
}



