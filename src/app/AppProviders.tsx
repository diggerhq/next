"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import type React from "react";
import { createContext, Suspense, useContext, useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";
import { Config } from "./api/config/route";
import { useMyReportWebVitals } from "./reportWebVitals";

// Create a client
const queryClient = new QueryClient();

const ConfigContext = createContext<Config>({});


/**
 * This is a wrapper for the app that provides the supabase client, the router event wrapper
 * the react-query client, supabase listener, and the navigation progress bar.
 *
 * The listener is used to listen for changes to the user's session and update the UI accordingly.
 */
export function AppProviders({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState({});

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data));
  }, []);

  useMyReportWebVitals();
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <ConfigContext.Provider value={config}>
            {children}
          </ConfigContext.Provider>
          <SonnerToaster theme={"light"} />
          <Suspense>
            <ProgressBar
              height="4px"
              color="#0047ab"
              options={{ showSpinner: false }}
              shallowRouting
            />
          </Suspense>
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}

export const useConfig = () => useContext(ConfigContext);

