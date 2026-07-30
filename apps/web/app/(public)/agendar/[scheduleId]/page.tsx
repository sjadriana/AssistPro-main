import { BookingView } from "@/components/booking/booking-view"

interface Props {
  params: Promise<{ scheduleId: string }>
}

export default async function BookingPage({ params }: Props) {
  const { scheduleId } = await params
  return <BookingView scheduleId={scheduleId} />
}
