import { CustomerDetailView } from "@/features/crm/components/customer-detail-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BackofficeCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CustomerDetailView id={id} />;
}
