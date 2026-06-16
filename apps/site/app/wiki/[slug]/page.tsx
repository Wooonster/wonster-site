import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [];
}

export function generateMetadata(): Metadata {
  return {
    title: "Wiki | whatsmy.fun",
    robots: {
      index: false,
      follow: false
    }
  };
}

export default function WikiEntryPage() {
  notFound();
}
