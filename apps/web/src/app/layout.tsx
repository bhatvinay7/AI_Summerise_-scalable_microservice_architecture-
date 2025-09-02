import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from '../components/ui/ReduxRootProvider'
export const metadata: Metadata = {
  title: "Summerise",
  description: "Summerise your content by one click",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-white w-full min-h-screen`}>
        <ReduxProvider>

        {children}
        </ReduxProvider>
        
        </body>
    </html>
  );
}
