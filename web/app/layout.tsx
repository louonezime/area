"use client";

import "./globals.css";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NavBarDesktop from "@/components/NavBarDesktop";
import NavBarMobile from "@/components/NavBarMobile";
import { Link } from "@nextui-org/react";
import { Cog } from "lucide-react";
import { AuthProvider } from "./context/AuthContext";
import { ActionStateProvider } from "./context/ActionContext";
import { ClipLoader } from "react-spinners";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <ActionStateProvider>
        <RootLayoutContent loading={loading}>{children}</RootLayoutContent>
      </ActionStateProvider>
    </AuthProvider>
  );
}

const RootLayoutContent = ({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading: boolean;
}) => {
  const pathname = usePathname();
  const isAuthPage = pathname === "/auth/login" || pathname === "/auth/signup";

  if (loading) {
    return (
      <html lang="en">
        <body className="flex justify-center items-center h-screen">
          <ClipLoader color="#404040" loading={true} size={50} />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="antialiased">
        {!isAuthPage && (
          <>
            <div className="hidden sm:block">
              <NavBarDesktop
                colorNavBar={
                  pathname === "/" ? "bg-dark_grey" : "bg-transparent"
                }
                textConfig={
                  pathname === "/"
                    ? "ml-auto flex gap-7 mr-12 text-white text-xl"
                    : "ml-auto flex gap-7 mr-12 text-black text-xl"
                }
                textColor={pathname === "/" ? "text-white" : "text-black"}
                logoConfig={
                  pathname === "/"
                    ? "logo-white-clear-bg-svg ml-12 h-16"
                    : "logo-black-size-up-clear-bg-svg ml-12 h-16"
                }
                settingsColor={pathname === "/" ? "white" : "black"}
              />
            </div>
            <div className="block sm:hidden">
              <NavBarMobile />
            </div>
          </>
        )}
        {isAuthPage && (
          <div className="flex items-center justify-end gap-[3px] p-2">
            <button className="flex justify-end">
              <div className="uk-flag-icon-svg"></div>
            </button>
            <Link href="/settings">
              <button className="mr-4 ml-[3px] py-2">
                <Cog size={33} color="black" />
              </button>
            </Link>
          </div>
        )}
        <div className="content-container">{children}</div>
      </body>
    </html>
  );
};
