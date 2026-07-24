import type { Metadata } from "next";
import { headers } from "next/headers";
import { Providers } from "@/components/providers";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "pipelineos.example";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: {
      default: "PipelineOS — Sales clarity, without the clutter",
      template: "%s · PipelineOS",
    },
    description:
      "A modern, secure sales pipeline workspace for focused revenue teams.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "PipelineOS",
      description: "Modern sales pipeline intelligence for focused teams.",
      type: "website",
      images: [{ url: new URL("/og.png", metadataBase).toString(), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PipelineOS",
      description: "Modern sales pipeline intelligence for focused teams.",
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
