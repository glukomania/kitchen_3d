import { useEffect, useMemo, useRef } from "react";
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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) {
      console.log('⏭️ [WidgetRoot] Already initialized, skipping');
      return;
    }

    initialized.current = true;

    queueMicrotask(async () => {
      console.log('🚀 [WidgetRoot] Initializing with config:', config);
      if (config?.shopify) {
        console.log('🚀 [WidgetRoot] Using Shopify integration');
        try {
          await dispatch.initShopify(config.shopify);
        } catch (error) {
          console.error('❌ [WidgetRoot] Failed to initialize Shopify:', error);
        }
      } else if (config?.catalog) {
        console.log('🚀 [WidgetRoot] Using catalog from config');
        dispatch.setCatalog(config.catalog);
      } else if (legacyCatalog) {
        console.log('🚀 [WidgetRoot] Using legacy catalog');
        dispatch.setCatalog(legacyCatalog);
      } else {
        console.warn('⚠️ [WidgetRoot] No config provided, using default catalog');
      }
    });
  }, [config, legacyCatalog, dispatch]);

  return <Configurator />;
}



