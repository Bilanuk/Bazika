import AdminDashboard from '@/components/AdminDashboard';
import AdminOnly from '@/components/AdminOnly';

export default function DashboardPage() {
  return (
    <AdminOnly>
      <AdminDashboard />
    </AdminOnly>
  );
}
