import { useEffect, useMemo, useRef } from "react";
import type { Catalog } from "@/features/configurator/model/types";
import type { PlatformConfig } from "@/integrations/types";
import type { ShopifyConfig } from "@/integrations/shopify/client";
import { sampleCatalog } from "@/features/configurator/data/sampleCatalog";
import { Configurator } from "@/features/configurator/ui/Configurator";
import { useAppDispatch } from "@/app/hooks";

type Props = {
  config?: {
    platform?: PlatformConfig;
    shopify?: ShopifyConfig; // Legacy support
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

    queueMicrotask(() => {
      void (async () => {
        console.log('🚀 [WidgetRoot] Initializing with config:', config);
        
        // New platform config (preferred)
        if (config?.platform) {
          console.log('🚀 [WidgetRoot] Using platform integration:', config.platform.type);
          try {
            await dispatch.initPlatform(config.platform);
          } catch (error) {
            console.error('❌ [WidgetRoot] Failed to initialize platform:', error);
          }
        }
        // Legacy Shopify config
        else if (config?.shopify) {
          console.log('🚀 [WidgetRoot] Using legacy Shopify integration');
          try {
            await dispatch.initShopify(config.shopify);
          } catch (error) {
            console.error('❌ [WidgetRoot] Failed to initialize Shopify:', error);
          }
        }
        // Static catalog
        else if (config?.catalog) {
          console.log('🚀 [WidgetRoot] Using catalog from config');
          dispatch.setCatalog(config.catalog);
        } else if (legacyCatalog) {
          console.log('🚀 [WidgetRoot] Using legacy catalog');
          dispatch.setCatalog(legacyCatalog);
        } else {
          console.warn('⚠️ [WidgetRoot] No platform/config — using default catalog (standalone mode)');
          dispatch.setCatalog(sampleCatalog);
        }
      })();
    });
  }, [config, legacyCatalog, dispatch]);

  return <Configurator />;
}



