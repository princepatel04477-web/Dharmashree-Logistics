"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface MapSelectionValue {
  selectedId: string | null;
  select: (id: string | null) => void;
}

export const MapSelectionContext = createContext<MapSelectionValue | null>(null);

/* Shared selection between IndiaNetworkMap and HubDirectory when both are
   mounted under one provider. Either component also works standalone. */
export function MapSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const value = useMemo<MapSelectionValue>(
    () => ({ selectedId, select: setSelectedId }),
    [selectedId],
  );
  return <MapSelectionContext.Provider value={value}>{children}</MapSelectionContext.Provider>;
}

/* Context selection when provided, otherwise private local state. The local
   useState always runs (hooks order) and is simply unused with a provider. */
export function useMapSelection(): [string | null, (id: string | null) => void] {
  const ctx = useContext(MapSelectionContext);
  const [localId, setLocalId] = useState<string | null>(null);
  if (ctx !== null) return [ctx.selectedId, ctx.select];
  return [localId, setLocalId];
}
