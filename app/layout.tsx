import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Navbar from "./components/nav/Navbar";
import Footer from "./components/footer/Footer";
import CartProvider from "@/providers/CartProvider";
import { Toaster } from "react-hot-toast";
import AppChrome from "./components/layout/AppChrome";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "TechHub | Modern Tech & Gadgets Store",
  description:
    "Kenya's premier e-commerce destination for tech, smartphones, laptops, and accessories with instant Kopo Kopo M-Pesa payments.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} text-slate-700 bg-white antialiased`}>
        <Toaster
          toastOptions={{
            style: {
              background: "rgb(24 24 27)",
              color: "#fff",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
        <CartProvider>
          <AppChrome navbar={<Navbar />} footer={<Footer />}>
            {children}
          </AppChrome>
        </CartProvider>
      </body>
    </html>
  );
}
