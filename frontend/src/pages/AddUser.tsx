import { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import './Users.css';

const AddUser = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (user?.role !== 'admin') {
    return <Navigate to="/users" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/auth/register', { name, email, password, role });
      navigate('/users', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'البريد الإلكتروني موجود مسبقاً أو حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="users-content add-user-page animate-fade-in container">
      <div className="entry-page-header">
        <button type="button" className="entry-back-btn" onClick={() => navigate('/users')}>
          <ArrowRight size={16} />
          العودة إلى المستخدمين
        </button>
        <div>
          <h1>إضافة طالب جديد</h1>
          <p className="subtitle">أدخل بيانات المشترك ثم سيتم إعادتك تلقائياً إلى صفحة المستخدمين بعد الإنشاء</p>
        </div>
      </div>

      <div className="entry-card glass-card">
        {error && <div className="entry-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="user-entry-form">
          <div className="form-group">
            <label>الاسم الكامل</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: طارق" />
          </div>

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@example.com" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>كلمة المرور المبدئية</label>
              <input type="text" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" />
            </div>
            <div className="form-group">
              <label>الصلاحية</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="user-role-select">
                <option value="student">طالب عروض</option>
                <option value="admin">مشرف محراب و كتاب</option>
              </select>
            </div>
          </div>

          <div className="entry-form-actions">
            <button type="button" className="cancel-btn entry-cancel-btn" onClick={() => navigate('/users')}>
              إلغاء
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              <Save size={18} />
              {submitting ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
