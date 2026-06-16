import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Wiki | whatsmy.fun",
  robots: {
    index: false,
    follow: false
  }
};

export default function WikiPage() {
  notFound();
}
