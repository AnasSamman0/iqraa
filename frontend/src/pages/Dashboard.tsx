import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Users as UsersIcon, CheckCircle, Trophy, Globe, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, books: 0, submissions: 0, studentFinished: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [suggestedBooks, setSuggestedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [booksRes, leaderboardRes] = await Promise.all([
          api.get('/books'),
          api.get('/submissions/leaderboard')
        ]);
        
        setLeaderboard(leaderboardRes.data);
        const allBooks = booksRes.data;
        const openBooks = allBooks.filter((b: any) => b.status === 'open');
        setSuggestedBooks(openBooks.slice(0, 4));

        if (user?.role === 'admin') {
          const [usersRes, subsRes] = await Promise.all([
            api.get('/auth/users'),
            api.get('/submissions')
          ]);
          setStats({
            users: usersRes.data.length,
            books: allBooks.length,
            submissions: subsRes.data.length,
            studentFinished: 0
          });
        } else {
          const myFinished = leaderboardRes.data.find((l: any) => l._id === user?._id)?.booksCount || 0;
          setStats(prev => ({
            ...prev,
            books: allBooks.length,
            studentFinished: myFinished
          }));
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

  return (
    <div className="dashboard-content animate-fade-in container">
      <header className="page-header gold-gradient-text">
        <h1>{user?.role === 'admin' ? 'لوحة تحكم المشرف' : `أهلاً بك يا ${user?.name}`}</h1>
        <p className="subtitle">نظرة عامة على نشاطك وإنجازاتك في المحراب</p>
      </header>

      <div className="stats-grid">
        {user?.role === 'admin' ? (
          <>
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper blue"><BookOpen size={24} /></div>
              <div className="stat-details">
                <h3>الكتب المتاحة</h3>
                <p className="stat-value">{stats.books}</p>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper green"><UsersIcon size={24} /></div>
              <div className="stat-details">
                <h3>الطلاب المسجلون</h3>
                <p className="stat-value">{stats.users}</p>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper purple"><CheckCircle size={24} /></div>
              <div className="stat-details">
                <h3>إجمالي المشاركات</h3>
                <p className="stat-value">{stats.submissions}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper blue"><BookOpen size={24} /></div>
              <div className="stat-details">
                <h3>كتبي المنتهية</h3>
                <p className="stat-value">{stats.studentFinished}</p>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper purple"><TrendingUp size={24} /></div>
              <div className="stat-details">
                <h3>إجمالي المقررات</h3>
                <p className="stat-value">{stats.books}</p>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon-wrapper green"><CheckCircle size={24} /></div>
              <div className="stat-details">
                <h3>نسبة الإنجاز</h3>
                <p className="stat-value">{stats.books > 0 ? Math.round((stats.studentFinished / stats.books) * 100) : 0}%</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <section className="leaderboard-section glass-card">
          <div className="section-header">
            <Trophy color="#fbbf24" size={24} />
            <h2>لوحة المتصدرين (الأكثر قراءة)</h2>
          </div>
          <div className="leader-list">
            {leaderboard.map((lb: any, idx) => (
              <div key={lb._id} className="leader-item">
                <div className={`rank-badge ${idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : ''}`}>
                  {idx + 1}
                </div>
                <div className="leader-info">
                  <span className="leader-name">{lb.name}</span>
                  <span className="leader-meta">{lb.booksCount} كتاباً منتهياً</span>
                </div>
                {idx === 0 && <TrendingUp size={16} color="#fbbf24" />}
              </div>
            ))}
          </div>
        </section>

        <section className="suggested-section">
          <h2>كتب مفتوحة للنقاش</h2>
          <div className="suggested-grid">
            {suggestedBooks.map((b: any) => (
              <Link to={`/books/${b._id}`} key={b._id} className="suggested-book-card glass-card">
                <Globe size={32} color="var(--accent)" />
                <div className="book-text">
                  <h3>{b.title}</h3>
                  <p>شارك تأملاتك الآن</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
