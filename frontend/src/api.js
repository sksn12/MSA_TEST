export const apiFetch = async (url, options = {}, onTokenRefreshed = null, onLogout = null) => {
  let token = localStorage.getItem('token');
  
  if (!options.headers) {
    options.headers = {};
  }
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, options);

  // If 401 (Unauthorized) and not trying to login/refresh, attempt silent refresh
  if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshRes = await fetch('/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          if (onTokenRefreshed) {
            onTokenRefreshed(data.accessToken, data.user);
          }

          // Retry the original request with the new access token
          options.headers['Authorization'] = `Bearer ${data.accessToken}`;
          res = await fetch(url, options);
        } else {
          // Refresh token is expired or invalid, trigger logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (onLogout) onLogout();
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }
  }

  return res;
};
