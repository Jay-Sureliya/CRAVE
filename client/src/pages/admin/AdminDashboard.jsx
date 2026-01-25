import { useEffect, useState } from "react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard")
      .then(res => setData(res.data))
      .catch(() => alert("Unauthorized"));
  }, []);

  if (!data) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded">
          Total Orders: {data.total_orders}
        </div>
        <div className="bg-white shadow p-4 rounded">
          Revenue: ₹{data.revenue}
        </div>
        <div className="bg-white shadow p-4 rounded">
          Active Restaurants: {data.active_restaurants}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
