"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { getDashboard, getMe, type GithubUser } from "@/lib/api";
import { summarizeWorkspace, type WorkspaceSummary } from "@/lib/dashboard";
import type { DashboardResponse } from "@/types/dashboard";

type WorkspaceContextValue = {
  data: DashboardResponse | null;
  setData: Dispatch<SetStateAction<DashboardResponse | null>>;
  summary: WorkspaceSummary;
  user: GithubUser | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  reload: (options?: { silent?: boolean }) => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [user, setUser] = useState<GithubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      setData(await getDashboard());
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your workspace.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void reload();

    const token = window.localStorage.getItem("pr_token");
    if (token) {
      getMe(token)
        .then((response) => setUser(response.user))
        .catch(() => setUser(null));
    }
  }, [reload]);

  const summary = useMemo(() => summarizeWorkspace(data), [data]);
  const hasLiveReviews = summary.live.length > 0;

  // Keep the pipeline indicator honest while reviews are in flight.
  useEffect(() => {
    if (!hasLiveReviews) return;
    const intervalId = window.setInterval(() => void reload({ silent: true }), 10_000);
    return () => window.clearInterval(intervalId);
  }, [hasLiveReviews, reload]);

  const value = useMemo(
    () => ({ data, setData, summary, user, loading, refreshing, error, reload }),
    [data, summary, user, loading, refreshing, error, reload]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
