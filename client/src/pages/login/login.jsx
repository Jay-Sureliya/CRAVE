import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // FastAPI expects form-data for OAuth2PasswordRequestForm
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await api.post('/token', formData);
            
            // Save token and role
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('role', response.data.role);

            if (response.data.role === 'admin') {
                navigate('/admin');
            } else {
                setError("You are not an admin!");
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
            <h2>Admin Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                    type="text" 
                    placeholder="Username (use 'admin')" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input 
                    type="password" 
                    placeholder="Password (use 'secret')" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Login</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;