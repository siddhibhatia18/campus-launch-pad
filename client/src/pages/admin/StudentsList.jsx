import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import EmptyState from '../../components/EmptyState';
import Avatar from '../../components/Avatar';
import { fetchRegisteredStudents } from '../../services/api';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      try {
        const data = await fetchRegisteredStudents();
        setStudents(data.students || []);
      } catch (err) {
        console.error('Error fetching registered students:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.college && s.college.toLowerCase().includes(search.toLowerCase())) ||
      (s.skills && s.skills.some((sk) => sk.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div>
      <PageHeader
        title="Registered Students Directory"
        subtitle="View and monitor real students enrolled in Campus Launch Pad, their college credentials, profile pictures, and live skill profiles."
      >
        <span className="badge badge-accent">{students.length} Enrolled</span>
      </PageHeader>

      {/* Search Input */}
      {students.length > 0 && (
        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search enrolled students by name, college, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading enrolled student records from database...
        </p>
      ) : students.length > 0 ? (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College / University</th>
                <th>Program & Year</th>
                <th>Skills Profile</th>
                <th>Profile Completion</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((std) => (
                <tr key={std.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar
                        src={std.profileImageUrl}
                        name={std.name}
                        size="sm"
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--primary-dark-blue)' }}>
                          {std.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {std.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{std.college || 'Not specified'}</td>
                  <td>
                    <div>{std.course || 'Not specified'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{std.year || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '240px' }}>
                      {std.skills && std.skills.length > 0 ? (
                        std.skills.map((skill, idx) => (
                          <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No skills added</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-container" style={{ width: '60px', height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${std.profileCompletion}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                        {std.profileCompletion}%
                      </span>
                    </div>
                  </td>
                  <td>{std.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="👥"
          title="No Students Enrolled Yet"
          description="As real students sign up and create profiles on Campus Launch Pad, they will be listed in this directory."
        />
      )}
    </div>
  );
}
