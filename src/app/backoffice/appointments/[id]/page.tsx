import { AppointmentDetailView } from "@/features/appointment/components/appointment-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BackofficeAppointmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <AppointmentDetailView id={id} />;
}
