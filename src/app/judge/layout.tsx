import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabulora – Judge",
};

export default function JudgeLayout(props: {
  children: React.ReactNode;
  params: Promise<Record<string, never>>;
}) {
  return <>{props.children}</>;
}
