export default async function AuditLogPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-deep-navy">Audit Log</h1>
      <p className="text-sm text-cool-grey">Record ID: {recordId}</p>
    </div>
  );
}
