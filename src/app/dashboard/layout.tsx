"use client";
import DashboardNavbar from "../_components/navigationBar/dashboardNavbar";
import DashboardSidebar from "../_components/sidebar/dashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex">
      <div className="flex flex-grow">
        <DashboardSidebar />
        <div>
          <DashboardNavbar />
          <div className="container mx-auto p-6">
            <div>{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
