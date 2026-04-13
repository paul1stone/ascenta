import { CheckInPage } from "@/components/grow/check-in/check-in-page";

export default async function CheckInRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CheckInPage checkInId={id} />;
}
