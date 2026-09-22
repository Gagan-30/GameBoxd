import { UserAccount } from '../types';

const TOKEN_KEY = 'gameboxd_auth_token';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error('Error saving auth token:', e);
  }
}

export async function fetchCurrentAccount(): Promise<UserAccount | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        setAuthToken(null);
      }
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error('Failed to fetch user account:', err);
    return null;
  }
}

export async function registerAccount(payload: {
  username: string;
  email: string;
  password: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Registration failed' };
    }

    if (data.token) {
      setAuthToken(data.token);
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function loginAccount(payload: {
  login: string;
  password: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Login failed' };
    }

    if (data.token) {
      setAuthToken(data.token);
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function updateAccountProfile(payload: {
  displayName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
}): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  const token = getAuthToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to update profile' };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function changeAccountPassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  const token = getAuthToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to change password' };
    }

    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function deleteCurrentAccount(password: string): Promise<{ success: boolean; error?: string; message?: string }> {
  const token = getAuthToken();
  if (!token) return { success: false, error: 'Not authenticated' };

  try {
    const res = await fetch('/api/auth/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to delete account' };
    }

    setAuthToken(null);
    return { success: true, message: data.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

export async function logoutAccount(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  setAuthToken(null);
}

export async function fetchAccountsList(): Promise<Array<{ id: string; username: string; displayName: string; avatarUrl: string }>> {
  try {
    const res = await fetch('/api/auth/accounts');
    if (res.ok) {
      const data = await res.json();
      return data.accounts || [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function fetchServerUserData(): Promise<any | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/user/data', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
    return null;
  } catch (e) {
    console.warn('Failed to load server user data:', e);
    return null;
  }
}

export async function syncServerUserData(data: any): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const res = await fetch('/api/user/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ data })
    });
    return res.ok;
  } catch (e) {
    console.warn('Failed to sync server user data:', e);
    return false;
  }
}
