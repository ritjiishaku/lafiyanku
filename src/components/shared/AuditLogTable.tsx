import type { AuditLog } from "@/types/schemas";

interface AuditLogTableProps {
  logs: AuditLog[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-cool-grey">No audit log entries found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-cool-grey">
            <th className="px-4 py-2 font-medium">Action</th>
            <th className="px-4 py-2 font-medium">User</th>
            <th className="px-4 py-2 font-medium">Role</th>
            <th className="px-4 py-2 font-medium">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.logId} className="border-b last:border-0">
              <td className="px-4 py-2 capitalize">{log.action}</td>
              <td className="px-4 py-2">{log.userId}</td>
              <td className="px-4 py-2 capitalize">{log.userRole}</td>
              <td className="px-4 py-2 text-cool-grey">
                {new Date(log.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
