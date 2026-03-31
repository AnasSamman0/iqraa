import { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // التحكم بجلسة تسجيل الدخول وإنهاءها عند ترك الموقع أو الخمول
  useEffect(() => {
    const userInfo = sessionStorage.getItem('userInfo');
    const loginTime = sessionStorage.getItem('loginTime');
    
    // تسجيل الخروج التلقائي بعد ساعتين من تسجيل الدخول (كحد أقصى)
    // أو عند العودة للموقع بعد فترة (إغلاق التطبيق في الخلفية)
    const now = new Date().getTime();
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    
    if (userInfo && loginTime) {
      if (now - parseInt(loginTime) > TWO_HOURS) {
        sessionStorage.removeItem('userInfo');
        sessionStorage.removeItem('loginTime');
      } else {
        try {
          const parsed = JSON.parse(userInfo);
          if (parsed && parsed._id && parsed.token) {
            setUser(parsed);
          } else {
            sessionStorage.removeItem('userInfo');
          }
        } catch {
          sessionStorage.removeItem('userInfo');
        }
      }
    } else if (userInfo) {
      // حالة عدم وجود وقت تسجيل الدخول
      sessionStorage.removeItem('userInfo');
    }
    
    setLoading(false);

    // تسجيل الخروج عند إغلاق التبويبة بالكامل
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const storedLoginTime = sessionStorage.getItem('loginTime');
        if (storedLoginTime && new Date().getTime() - parseInt(storedLoginTime) > TWO_HOURS) {
          sessionStorage.removeItem('userInfo');
          sessionStorage.removeItem('loginTime');
          setUser(null);
          window.location.href = '/login';
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const login = (userData: User) => {
    sessionStorage.setItem('userInfo', JSON.stringify(userData));
    sessionStorage.setItem('loginTime', new Date().getTime().toString());
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('loginTime');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
