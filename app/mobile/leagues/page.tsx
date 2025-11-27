import { LeaguesScreen } from "@/components/mobile/leagues-screen"

export default function LeaguesPage({
  searchParams,
}: {
  searchParams: { sport?: string }
}) {
  return <LeaguesScreen sport={searchParams.sport} />
}
