import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabulora – Tabulator",
};

export default function TabulatorLayout(props: {
  children: React.ReactNode;
  params: Promise<Record<string, never>>;
}) {
  return <>{props.children}</>;
}
