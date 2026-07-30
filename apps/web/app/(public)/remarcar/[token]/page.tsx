import { RescheduleView } from "@/components/reschedule/reschedule-view"

interface Props {
  params: Promise<{ token: string }>
}

export default async function ReschedularPage({ params }: Props) {
  const { token } = await params
  return <RescheduleView token={token} />
}
