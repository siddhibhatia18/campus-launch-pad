import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadProfilePictureApi,
  removeProfilePictureApi,
} from '../../services/api';

export default function StudentProfile() {
  const { user, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfileState] = useState({
    college: '',
    course: '',
    year: '1st Year',
    bio: '',
    skills: [],
    interestedDomains: [],
    interests: [],
    projects: [],
    profileImageUrl: '',
    profileCompletion: 0,
  });

  const [name, setName] = useState(user?.name || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [newDomain, setNewDomain] = useState('');
  const [newInterest, setNewInterest] = useState('');

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLink, setNewProjLink] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getStudentProfile()
      .then((data) => {
        if (data.profile) {
          setProfileState(data.profile);
          if (data.profile.user?.name) {
            setName(data.profile.user.name);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    setProfileState({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Image Upload / Preview Handling
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      setErrorMessage('Please select a valid image format (JPG, JPEG, PNG, WEBP).');
      return;
    }

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMessage('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Automatically upload immediately to persist to MongoDB
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await uploadProfilePictureApi(formData);
      if (res.profile) {
        setProfileState(res.profile);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setSavedSuccess(true);
      await refreshProfile();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error uploading profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const res = await uploadProfilePictureApi(formData);
      if (res.profile) {
        setProfileState(res.profile);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setSavedSuccess(true);
      await refreshProfile();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error uploading profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemovePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setUploadingImage(true);
    setErrorMessage('');

    try {
      const res = await removeProfilePictureApi();
      if (res.profile) {
        setProfileState(res.profile);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setSavedSuccess(true);
      await refreshProfile();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error removing profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const updatedSkills = [
      ...profile.skills,
      { name: newSkillName.trim(), level: newSkillLevel },
    ];
    setProfileState({ ...profile, skills: updatedSkills });
    setNewSkillName('');
  };

  const handleRemoveSkill = (indexToRemove) => {
    const updatedSkills = profile.skills.filter((_, idx) => idx !== indexToRemove);
    setProfileState({ ...profile, skills: updatedSkills });
  };

  const handleAddDomain = (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    if (!profile.interestedDomains.includes(newDomain.trim())) {
      setProfileState({
        ...profile,
        interestedDomains: [...profile.interestedDomains, newDomain.trim()],
      });
    }
    setNewDomain('');
  };

  const handleRemoveDomain = (domainToRemove) => {
    setProfileState({
      ...profile,
      interestedDomains: profile.interestedDomains.filter((d) => d !== domainToRemove),
    });
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (!newInterest.trim()) return;
    if (!profile.interests.includes(newInterest.trim())) {
      setProfileState({
        ...profile,
        interests: [...profile.interests, newInterest.trim()],
      });
    }
    setNewInterest('');
  };

  const handleRemoveInterest = (interestToRemove) => {
    setProfileState({
      ...profile,
      interests: profile.interests.filter((i) => i !== interestToRemove),
    });
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjTitle.trim()) return;
    const newProj = {
      title: newProjTitle.trim(),
      description: newProjDesc.trim(),
      githubLink: newProjLink.trim(),
    };
    setProfileState({
      ...profile,
      projects: [...profile.projects, newProj],
    });
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjLink('');
  };

  const handleRemoveProject = (indexToRemove) => {
    setProfileState({
      ...profile,
      projects: profile.projects.filter((_, idx) => idx !== indexToRemove),
    });
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage('');

    try {
      let currentImageUrl = profile.profileImageUrl;

      // If user selected a file but didn't upload yet, upload it now
      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('image', selectedFile);
          const uploadRes = await uploadProfilePictureApi(formData);
          if (uploadRes.profileImageUrl) {
            currentImageUrl = uploadRes.profileImageUrl;
          }
        } catch (uErr) {
          console.warn('Could not auto-upload selected file during profile save:', uErr);
        }
      }

      const updatePayload = {
        name,
        college: profile.college,
        course: profile.course,
        year: profile.year,
        bio: profile.bio,
        skills: profile.skills,
        interestedDomains: profile.interestedDomains,
        interests: profile.interests,
        projects: profile.projects,
        profileImageUrl: currentImageUrl,
      };

      const res = await updateStudentProfile(updatePayload);
      if (res.profile) {
        setProfileState(res.profile);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setSavedSuccess(true);
      await refreshProfile();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading student profile from database...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Student Profile"
        subtitle="Manage your profile picture, academic credentials, technical skills, interests, and project portfolio in MongoDB."
      >
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Profile'}
        </button>
      </PageHeader>

      {savedSuccess && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ✓ Profile changes and recalculation saved to database successfully!
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="dashboard-columns">
        {/* Left Column: Profile Form & Picture Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Profile Picture Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--primary-dark-blue)' }}>
              📸 Student Profile Picture
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Avatar
                  src={previewUrl || profile.profileImageUrl}
                  name={name || user?.name}
                  size="xl"
                />
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '0.75rem' }}>
                  Upload a photo to be displayed on your profile, project candidate cards, team lists, and invitations.
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Supports JPG, PNG, WebP (Max 5MB). Defaults to your initials if no photo is uploaded.
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                />

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    📁 {profile.profileImageUrl || previewUrl ? 'Replace Photo' : 'Select Photo'}
                  </button>

                  {selectedFile && (
                    <button
                      type="button"
                      className="btn btn-accent btn-sm"
                      onClick={handleUploadPicture}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : '✓ Save Photo'}
                    </button>
                  )}

                  {(profile.profileImageUrl || previewUrl) && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={handleRemovePicture}
                      disabled={uploadingImage}
                    >
                      🗑️ Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Info Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--primary-dark-blue)' }}>
              🎓 Academic Background
            </h3>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ backgroundColor: 'var(--background-gray)' }}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">College / University</label>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  placeholder="e.g. National Institute of Technology"
                  value={profile.college || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Degree & Course</label>
                <input
                  type="text"
                  name="course"
                  className="form-input"
                  placeholder="e.g. Computer Science and Engineering"
                  value={profile.course || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select
                  name="year"
                  className="form-select"
                  value={profile.year || '1st Year'}
                  onChange={handleInputChange}
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Student Bio</label>
              <textarea
                name="bio"
                rows="3"
                className="form-textarea"
                value={profile.bio || ''}
                onChange={handleInputChange}
                placeholder="Describe your engineering passions and goals..."
              ></textarea>
            </div>
          </div>

          {/* Technical Skills Card */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', color: 'var(--primary-dark-blue)' }}>
                ⚡ Technical Skills & Proficiency ({profile.skills.length})
              </h3>
              <span className="badge badge-accent">Team Matching Weight</span>
            </div>

            {/* Add skill form */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 2, minWidth: '180px' }}
                placeholder="Skill name (e.g. React, UI/UX, Marketing, Python)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
              />
              <select
                className="form-select"
                style={{ flex: 1, minWidth: '130px' }}
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate (Medium)</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddSkill}
              >
                + Add Skill
              </button>
            </div>

            {profile.skills.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {profile.skills.map((skill, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--background-gray)',
                      border: '1px solid var(--border-light)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary-dark-blue)' }}>
                        {skill.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {skill.level}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(idx)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.875rem' }}
                      title="Remove skill"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No skills added yet. Add at least 3 skills to unlock precise opportunity and project team matches.
              </p>
            )}
          </div>

          {/* Projects Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', color: 'var(--primary-dark-blue)' }}>
              💻 Projects & GitHub Portfolio ({profile.projects.length})
            </h3>

            {/* Add Project Form */}
            <div style={{ backgroundColor: 'var(--background-gray)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Project Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Distributed Task Queue"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Brief summary of tech stack and impact"
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.8125rem' }}>GitHub Link</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/username/project"
                  value={newProjLink}
                  onChange={(e) => setNewProjLink(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddProject}
              >
                + Add Project to Portfolio
              </button>
            </div>

            {profile.projects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {profile.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      border: '1px solid var(--border-gray)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--white)',
                    }}
                  >
                    <div className="flex-between">
                      <h4 style={{ fontSize: '0.9375rem', color: 'var(--primary-dark-blue)' }}>
                        {proj.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {proj.githubLink && (
                          <a
                            href={proj.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                          >
                            🔗 GitHub
                          </a>
                        )}
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveProject(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    {proj.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-dark)', marginTop: '0.35rem' }}>
                        {proj.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                No projects added yet. Add your GitHub repositories to showcase your work.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Preferences & Completion Score */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Real Profile Completion Card */}
          <div className="card">
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary-dark-blue)' }}>
              Profile Completion
            </h4>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Real Dynamic Score</span>
              <span style={{ fontWeight: 800, color: 'var(--accent-blue)' }}>
                {profile.profileCompletion || 0}%
              </span>
            </div>
            <div className="progress-container" style={{ marginBottom: '1rem' }}>
              <div
                className="progress-fill"
                style={{ width: `${profile.profileCompletion || 0}%` }}
              ></div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <li style={{ color: profile.profileImageUrl ? 'var(--success)' : 'var(--text-muted)' }}>
                {profile.profileImageUrl ? '✓' : '○'} Profile picture uploaded
              </li>
              <li style={{ color: profile.college ? 'var(--success)' : 'var(--text-muted)' }}>
                {profile.college ? '✓' : '○'} Academic details
              </li>
              <li style={{ color: profile.skills.length >= 3 ? 'var(--success)' : 'var(--text-muted)' }}>
                {profile.skills.length >= 3 ? '✓' : '○'} At least 3 skills ({profile.skills.length}/3)
              </li>
              <li style={{ color: profile.interestedDomains.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                {profile.interestedDomains.length > 0 ? '✓' : '○'} Interested domains ({profile.interestedDomains.length})
              </li>
              <li style={{ color: profile.projects.length > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                {profile.projects.length > 0 ? '✓' : '○'} Project portfolio ({profile.projects.length})
              </li>
            </ul>
          </div>

          {/* Interested Domains Card */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark-blue)' }}>
                Interested Domains
              </h4>
              <span className="badge badge-accent">30% Weight</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Domain (e.g. Web Development, AI, FinTech)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddDomain}
              >
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {profile.interestedDomains.map((dom, idx) => (
                <span
                  key={idx}
                  className="badge badge-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveDomain(dom)}
                  title="Click to remove"
                >
                  {dom} ✕
                </span>
              ))}
            </div>
          </div>

          {/* Personal Interests Card */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--primary-dark-blue)' }}>
                Personal Interests
              </h4>
              <span className="badge badge-accent">20% Weight</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Interest (e.g. Hackathons, Startups)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddInterest}
              >
                +
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {profile.interests.map((int, idx) => (
                <span
                  key={idx}
                  className="badge badge-neutral"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveInterest(int)}
                  title="Click to remove"
                >
                  #{int} ✕
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
