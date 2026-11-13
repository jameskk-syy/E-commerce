"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface ChromeContextType {
  setHideChrome: (val: boolean) => void;
}

const ChromeContext = createContext<ChromeContextType>({
  setHideChrome: () => {},
});

export const useChrome = () => useContext(ChromeContext);

/**
 * Drop-in component that any page (such as not-found) can mount
 * to completely suppress the Navbar and Footer.
 */
export function HideChrome() {
  const { setHideChrome } = useChrome();
  useEffect(() => {
    setHideChrome(true);
    return () => setHideChrome(false);
  }, [setHideChrome]);
  return null;
}

interface AppChromeProps {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

// Routes where Storefront Navbar and Footer should NOT be rendered
const AUTH_ROUTES = ["/login", "/register", "/otp", "/404", "/admin"];

export default function AppChrome({ navbar, footer, children }: AppChromeProps) {
  const pathname = usePathname();
  const [pageHidesChrome, setPageHidesChrome] = useState(false);

  // Reset page-level override on pathname navigation
  useEffect(() => {
    setPageHidesChrome(false);
  }, [pathname]);

  const isAuthRoute = pathname
    ? AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
    : false;

  const shouldHideChrome = isAuthRoute || pageHidesChrome;

  return (
    <ChromeContext.Provider value={{ setHideChrome: setPageHidesChrome }}>
      {shouldHideChrome ? (
        <main className="min-h-screen w-full flex flex-col bg-white">
          {children}
        </main>
      ) : (
        <div className="flex flex-col min-h-screen">
          {navbar}
          <main className="flex-grow">{children}</main>
          {footer}
        </div>
      )}
    </ChromeContext.Provider>
  );
}
