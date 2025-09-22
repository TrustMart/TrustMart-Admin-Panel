export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  loginTime: string;
}

export const getCurrentAdmin = (): AdminUser | null => {
  try {
    const adminData = localStorage.getItem('adminUser');
    if (adminData) {
      return JSON.parse(adminData);
    }
    return null;
  } catch (error) {
    console.error('Error getting current admin:', error);
    return null;
  }
};

export const isAdminAuthenticated = (): boolean => {
  const admin = getCurrentAdmin();
  if (!admin) return false;

  // Check if login is not older than 24 hours
  const loginTime = new Date(admin.loginTime);
  const now = new Date();
  const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
};

export const logoutAdmin = (): void => {
  localStorage.removeItem('adminUser');
  window.location.href = '/signin';
};

export const requireAuth = (): boolean => {
  if (!isAdminAuthenticated()) {
    window.location.href = '/signin';
    return false;
  }
  return true;
};
