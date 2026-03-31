import { useState, useEffect, useContext } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api';
import './Users.css';

const Users = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getRoleBadge = (r: string) => {
    return r === 'admin' ? 'مدير / شيخ' : 'طالب';
  };

  return (
    <div className="users-content animate-fade-in container">
      <header className="page-header flex-header">
        <div>
          <h1>إدارة المستخدمين</h1>
          <p className="subtitle">صلاحيات الطلاب وإضافة المشتركين لـ محراب و كتاب</p>
        </div>
        <Link to="/users/new" className="primary-btn">
          <UserPlus size={18} /> إضافة طالب جديد
        </Link>
      </header>

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
                  <td data-label="اسم المشارك">
                    <div className="user-name-cell">{u.name}</div>
                  </td>
                  <td data-label="الحساب">{u.email}</td>
                  <td data-label="الصلاحية">
                    <span className={`status-badge ${u.role}`}>
                      {getRoleBadge(u.role)}
                    </span>
                  </td>
                  <td data-label="التاريخ">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td data-label="خيارات">
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDelete(u._id)}
                      disabled={u._id === currentUser?._id}
                      title={u._id === currentUser?._id ? "لا يمكنك حذف حسابك الخاص" : "حذف المستخدم"}
                    >
                      <Trash2 size={18} />
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
