import { useEffect, useMemo } from "react";
import type { Catalog } from "@/features/configurator/model/types";
import { Configurator } from "@/features/configurator/ui/Configurator";
import { useAppDispatch } from "@/app/hooks";

type Props = {
  catalog?: Catalog;
};

export function WidgetRoot(props: Props) {
  const dispatch = useAppDispatch();

  const catalog = useMemo(() => props.catalog, [props.catalog]);

  useEffect(() => {
    if (!catalog) return;
    dispatch.setCatalog(catalog);
  }, [catalog, dispatch]);

  return <Configurator />;
}



