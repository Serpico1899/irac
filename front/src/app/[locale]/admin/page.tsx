import AdminDashboard from "@/components/template/AdminDashboard";
import { getCounts } from "@/app/actions/user/dashboardStatistic";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    const data = await getCounts();
    const token = (await cookies()).get("token");

    return <AdminDashboard data={data} token={token?.value} />;
  } catch (error) {
    console.warn("Error in admin page:", error);

    // Return admin dashboard with empty data during build
    const mockData = {
      users: 0,
      provinces: 0,
      cities: 0,
      accidents: 0,
      airStatuses: 0,
      areaUsages: 0,
      bodyInsuranceCos: 0,
      collisionTypes: 0,
      colors: 0,
      equipmentDamages: 0,
      faultStatuses: 0,
      humanReasons: 0,
      insuranceCos: 0,
      licenceTypes: 0,
      lightStatuses: 0,
      maxDamageSections: 0,
      motionDirections: 0,
      plaqueTypes: 0,
      plaqueUsages: 0,
      positions: 0,
      roads: 0,
      roadDefects: 0,
      roadRepairTypes: 0,
    };

    return <AdminDashboard data={mockData} token={undefined} />;
  }
}
