import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "The Hour Ledger",
  description: "A public desk that turns over every hour.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <div className="grain" />
        <div className="wrap">
          <header className="top">
            <Link className="mark" href="/">The Hour Ledger</Link>
            <nav>
              <Link href="/">Floor</Link>
              {user ? <Link href="/desk">Desk</Link> : <Link href="/login">Sign in</Link>}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
