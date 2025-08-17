import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetAuthState } from '../../redux/auth/authSlice';
import './LogIn.css';

function LogIn() {
const dispatch = useDispatch();
const { loading, error } = useSelector((state) => state.auth);

useEffect(() => {
    dispatch(resetAuthState());
}, [dispatch]);

const handleMicrosoftLogin = () => {
    // Debug: Check environment variables
    console.log('VITE_APP_URL:', import.meta.env.VITE_APP_URL);
    console.log('VITE_MICROSOFT_CLIENT_ID:', import.meta.env.VITE_MICROSOFT_CLIENT_ID);
    console.log('VITE_MICROSOFT_TENANT_ID:', import.meta.env.VITE_MICROSOFT_TENANT_ID);
    
    // Fix trailing slash issue
    const appUrl = (import.meta.env.VITE_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    
    const params = new URLSearchParams({
    client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '2dfa1784-299b-4bf9-91be-400d831396ed',
    response_type: 'code',
    redirect_uri: `${appUrl}/auth/callback`,
    response_mode: 'query',
    scope: 'openid profile email User.Read',
    state: '12345',
    });
    const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID || '6339b7c7-ee52-4336-adb9-c35e1f8eba82';
    
    console.log('Final redirect_uri:', `${appUrl}/auth/callback`);
    console.log('Authorization URL:', `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`);
    
    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
};

return (
    <div className="signup-container">
    <div className="signup-card">
        <h3 className="signup-title">Sign In</h3>
        <button
        type="button"
        className="register-button"
        style={{ background: '#2F2F7F', color: 'white' }}
        onClick={handleMicrosoftLogin}
        disabled={loading}
        >
        {loading ? 'Processing...' : 'Login with Microsoft'}
        </button>
        {error && <p className="error">{error}</p>}
    </div>
    </div>
);
}

export default LogIn;