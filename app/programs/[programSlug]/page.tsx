import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgramLandingPage from "../../components/ProgramLandingPage";
import { getProgramByRouteSlug, programs } from "../programData";

type ProgramPageProps = {
  params: Promise<{ programSlug: string }>;
};

export const metadata: Metadata = {
  title: "Special Program | Artisan Lab Network",
  robots: {
    index: false,
    follow: false,
  },
};

export function generateStaticParams() {
  return programs.map((program) => ({
    programSlug: program.route.replace("/programs/", ""),
  }));
}

export default async function HiddenProgramPage({ params }: ProgramPageProps) {
  const { programSlug } = await params;
  const program = getProgramByRouteSlug(programSlug);

  if (!program) notFound();

  return <ProgramLandingPage program={program} />;
}
