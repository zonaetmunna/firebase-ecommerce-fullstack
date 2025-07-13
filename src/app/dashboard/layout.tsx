"use client";
import DashboardNavbar from "../_components/navigationBar/dashboardNavbar";
import ProtectedRoute from "../_components/ProtectedRoute";
import DashboardSidebar from "../_components/sidebar/dashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute adminOnly={true}>
      <section className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col">
          <DashboardNavbar />

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </section>
    </ProtectedRoute>
  );
}
