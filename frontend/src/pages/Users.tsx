import { useState, useEffect } from 'react';
import { UserPlus, Trash2, X } from 'lucide-react';
import api from '../api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المستخدم نهائياً؟')) {
      try {
        await api.delete(`/auth/users/${id}`);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password, role });
      setShowAddModal(false);
      setName(''); setEmail(''); setPassword('');
      fetchUsers();
      alert('تم إضافة الطالب بنجاح');
    } catch (err: any) {
      alert(err.response?.data?.message || 'البريد الإلكتروني موجود مسبقاً أو حدث خطأ');
    }
  };

  const getRoleBadge = (r: string) => {
    return r === 'admin' ? 'مدير / شيخ' : 'طالب';
  };

  return (
    <div className="users-content animate-fade-in relative">
      <header className="page-header flex-header">
        <div>
          <h1>إدارة المستخدمين</h1>
          <p className="subtitle">صلاحيات الطلاب وإضافة المشتركين لـ محراب و كتاب</p>
        </div>
        <button className="primary-btn" onClick={() => setShowAddModal(true)}>
          <UserPlus size={18} /> إضافة طالب جديد
        </button>
      </header>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>إضافة مشترك جديد لـ محراب و كتاب</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateUser} className="add-book-form">
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
                  <select value={role} onChange={(e) => setRole(e.target.value)} style={{width: '100%', padding:'10px', borderRadius:'8px', background:'var(--bg-tertiary)', color:'var(--text-primary)', border:'1px solid var(--border-color)'}}>
                    <option value="student">طالب عروض</option>
                    <option value="admin">مشرف محراب و كتاب</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit" className="primary-btn">إنشاء الحساب</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state">جاري تحميل المشتركين...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>اسم المشارك</th>
                <th>البريد الإلكتروني / الحساب</th>
                <th>الدور والصلاحية</th>
                <th>تاريخ الانضمام</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="avatar mini">{u.name.charAt(0)}</div>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`status-badge ${u.role}`}>
                      {getRoleBadge(u.role)}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(u._id)}
                      disabled={u.role === 'admin'}
                      title={u.role === 'admin' ? "لا يمكن حذف مدير" : "حذف المستخدم"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
