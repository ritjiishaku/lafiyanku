export default async function DischargeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-deep-navy">Discharge Record</h1>
      <p className="text-sm text-cool-grey">Record ID: {id}</p>
    </div>
  );
}
