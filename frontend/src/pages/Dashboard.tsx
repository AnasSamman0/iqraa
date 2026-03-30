import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Users as UsersIcon, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, books: 0, submissions: 0, finished: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.role === 'admin') {
          const [usersRes, booksRes, subsRes] = await Promise.all([
            api.get('/auth/users'),
            api.get('/books'),
            api.get('/submissions') // Assuming this gets all submissions for admin
          ]);
          setStats({
            users: usersRes.data.length,
            books: booksRes.data.length,
            submissions: subsRes.data.length,
            finished: 0
          });
          
          // Calculate simple leaderboard based on submissions count for now
          // Group submissions by user
          const userSubCounts: any = {};
          subsRes.data.forEach((sub: any) => {
            const uid = sub.userId._id || sub.userId;
            const name = sub.userId.name || 'مستخدم غير معروف';
            if (!userSubCounts[uid]) userSubCounts[uid] = { name, count: 0 };
            userSubCounts[uid].count += 1;
          });
          
          const sortedLeaders = Object.values(userSubCounts).sort((a: any, b: any) => b.count - a.count).slice(0, 10);
          setLeaderboard(sortedLeaders as any);

        } else {
          // Student Dashboard
          const booksRes = await api.get('/books');
          const openBooks = booksRes.data.filter((b: any) => b.status === 'open');
          setSuggestedBooks(openBooks.slice(0, 3));
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="loading-state">جاري التحميل...</div>;

  if (user?.role === 'admin') {
    return (
      <div className="dashboard-content animate-fade-in">
        <header className="page-header">
          <h1>لوحة تحكم المشرف</h1>
          <p className="subtitle">نظرة عامة وإحصائيات محراب و كتاب</p>
        </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <BookOpen size={20} className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3>إجمالي الكتب</h3>
              <p className="stat-value">{stats.books}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper users">
              <UsersIcon size={20} className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3>إجمالي الطلاب</h3>
              <p className="stat-value">{stats.users}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper submissions">
              <CheckCircle size={20} className="stat-icon" />
            </div>
            <div className="stat-details">
              <h3>المشاركات الإجمالية</h3>
              <p className="stat-value">{stats.submissions}</p>
            </div>
          </div>
        </div>

        <section className="recent-activity">
          <h2>ترتيب نشاط الطلاب</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>اسم الطالب</th>
                  <th>إجمالي النقاشات/المشاركات</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr><td colSpan={3} style={{textAlign: 'center'}}>لا توجد بيانات حالياً</td></tr>
                ) : (
                  leaderboard.map((lb: any, idx) => (
                    <tr key={idx}>
                      <td><div className="rank">{idx + 1}</div></td>
                      <td>{lb.name}</td>
                      <td>{lb.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-content animate-fade-in">
      <header className="page-header">
        <h1>أهلاً بك يا، {user?.name}</h1>
        <p className="subtitle">نتمنى لك رحلة قراءة ماتعة ونافعة</p>
      </header>
      
      <section className="recent-activity" style={{ marginTop: '24px' }}>
        <h2>الكتب المقترحة أو المفتوحة للنقاش</h2>
        {suggestedBooks.length > 0 ? (
          <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {suggestedBooks.map((b: any) => (
              <Link to={`/books/${b._id}`} key={b._id} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <BookOpen size={24} color="var(--accent)" />
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{b.title}</h3>
                  <span className="status-badge open">مفتوح للنقاش</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="placeholder-card">
            <BookOpen color="var(--text-secondary)" size={32} />
            <p>لا توجد كتب مفتوحة حالياً للنقاش.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
