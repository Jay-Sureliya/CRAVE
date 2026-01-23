import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setData(response.data);
            } catch (error) {
                alert("Unauthorized! Redirecting to login.");
                localStorage.clear();
                navigate('/login');
            }
        };
        fetchAdminData();
    }, [navigate]);

    if (!data) return <p>Loading Admin Panel...</p>;

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Admin Dashboard</h1>
            <p>{data.message}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                <div style={{ border: '1px solid #ccc', padding: '20px' }}>
                    <h3>Total Orders</h3>
                    <p>{data.stats.total_orders}</p>
                </div>
                <div style={{ border: '1px solid #ccc', padding: '20px' }}>
                    <h3>Revenue</h3>
                    <p>{data.stats.revenue}</p>
                </div>
                <div style={{ border: '1px solid #ccc', padding: '20px' }}>
                    <h3>Active Drivers</h3>
                    <p>{data.stats.active_drivers}</p>
                </div>
            </div>
            
            <button 
                onClick={() => { localStorage.clear(); navigate('/login'); }}
                style={{ marginTop: '20px', background: 'red', color: 'white' }}
            >
                Logout
            </button>
        </div>
    );
};

export default AdminDashboard;