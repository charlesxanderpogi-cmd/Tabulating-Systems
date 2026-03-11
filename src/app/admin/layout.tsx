import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabulora – Admin",
};

export default function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<Record<string, never>>;
}) {
  return <>{props.children}</>;
}

