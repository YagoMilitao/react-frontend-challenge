import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { queryClient } from "@/app/providers/query-client";
import { router } from "@/app/router";
import { ErrorBoundary } from "@/app/error-boundary";
import { useSyncThemeWithDocument } from "@/features/theme/ui/theme-toggle";

function ThemedApp() {
  useSyncThemeWithDocument();
  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemedApp />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
