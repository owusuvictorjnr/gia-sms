import type { Metadata } from "next";
import './globals.css';



export const metadata: Metadata = {
  title: "EduConnect+ School Management",
  description: "The all-in-one platform for modern schools.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
