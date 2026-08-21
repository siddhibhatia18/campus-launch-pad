import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    course: '',
    year: '1st Year',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      if (formData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setErrorMessage(result.error || 'Failed to create account. Please check your details.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>🎓</span>
          <h2>Enroll in Campus Launch Pad</h2>
          <p>Create your real student account to receive personalized opportunity recommendations</p>
        </div>

        {errorMessage && (
          <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">College Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="student@campus.edu"
            />
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password (min 6 chars) *</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Account Type</label>
              <select
                id="role"
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <>
              <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="college">College / University</label>
                  <input
                    id="college"
                    name="college"
                    type="text"
                    className="form-input"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. National Institute of Tech"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="course">Degree / Course</label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    className="form-input"
                    value={formData.course}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech CSE"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="year">Academic Year</label>
                <select
                  id="year"
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-accent btn-lg" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Creating Account...' : 'Enroll & Continue to Dashboard'}
          </button>
        </form>

        <div className="auth-footer-text">
          Already enrolled? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
