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
      <DashboardSidebar />

      <div className="w-full flex flex-col">
        <DashboardNavbar />

        <div className="container mx-auto px-4 md:px-6 py-8 flex-grow">
          {children}
        </div>
      </div>
    </section>
  );
}
