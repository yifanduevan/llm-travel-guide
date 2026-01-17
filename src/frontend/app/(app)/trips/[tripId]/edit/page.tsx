import { Suspense } from "react";
import TripEditor from "./trip-editor";

type EditTripPageProps = {
  params: Promise<{ tripId: string }>;
};

export default async function EditTripPage({ params }: EditTripPageProps) {
  const { tripId } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TripEditor tripId={tripId} />
    </Suspense>
  );
}
