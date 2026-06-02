export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-deep-navy">Dashboard</h1>
      <p className="text-cool-grey">Welcome to CareFlow AI. Select an action to get started.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-deep-navy">New Discharge</h2>
          <p className="mt-2 text-sm text-cool-grey">Create a new discharge summary</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-deep-navy">Recent Records</h2>
          <p className="mt-2 text-sm text-cool-grey">View and manage recent discharges</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-deep-navy">Settings</h2>
          <p className="mt-2 text-sm text-cool-grey">Configure facility and preferences</p>
        </div>
      </div>
    </div>
  );
}
