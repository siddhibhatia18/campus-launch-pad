import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import OpportunityCard from '../../components/OpportunityCard';
import EmptyState from '../../components/EmptyState';
import {
  fetchOpportunities,
  fetchSavedOpportunities,
  saveOpportunityApi,
  unsaveOpportunityApi,
  trackApplicationApi,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/opportunities.css';

export default function ExploreOpportunities() {
  const { isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (selectedType !== 'All') params.type = selectedType;
      if (selectedDomain !== 'All') params.domain = selectedDomain;
      if (selectedMode !== 'All') params.mode = selectedMode;

      const data = await fetchOpportunities(params);
      setOpportunities(data.opportunities || []);

      if (isAuthenticated) {
        try {
          const savedData = await fetchSavedOpportunities();
          const ids = new Set((savedData.opportunities || []).map((o) => o._id || o.id));
          setSavedIds(ids);
        } catch (sErr) {
          // non-blocking
        }
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [selectedType, selectedDomain, selectedMode]);

  // Debounced search on typing
  useEffect(() => {
    const timer = setTimeout(() => {
      loadOpportunities();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSaveToggle = async (opportunityId, newSavedState) => {
    if (!isAuthenticated) {
      alert('Please log in as a student to save opportunities.');
      return;
    }
    try {
      if (newSavedState) {
        await saveOpportunityApi(opportunityId);
        setSavedIds(new Set([...savedIds, opportunityId]));
      } else {
        await unsaveOpportunityApi(opportunityId);
        const updated = new Set(savedIds);
        updated.delete(opportunityId);
        setSavedIds(updated);
      }
    } catch (err) {
      console.error('Error toggling save status:', err);
    }
  };

  const handleApply = async (opportunityId) => {
    if (isAuthenticated) {
      try {
        await trackApplicationApi(opportunityId, 'Applied');
      } catch (err) {
        console.error('Error tracking application:', err);
      }
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setSelectedDomain('All');
    setSelectedMode('All');
  };

  return (
    <div>
      <PageHeader
        title="Explore Opportunities"
        subtitle="Search and filter through vetted internships, hackathons, jobs, workshops, and competitions from the database."
      >
        <span className="badge badge-accent">{opportunities.length} Available</span>
      </PageHeader>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by role title, company name, domain, or skill (e.g. React, Python)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Opportunity Type
            </label>
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Internship">Internship</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Job">Job</option>
              <option value="Workshop">Workshop</option>
              <option value="Competition">Competition</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Domain
            </label>
            <select
              className="filter-select"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="All">All Domains</option>
              <option value="Web">Web Development</option>
              <option value="Intelligence">Artificial Intelligence</option>
              <option value="Software">Software Engineering</option>
              <option value="Cloud">Cloud Computing</option>
              <option value="Competitive">Competitive Programming</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Location Mode
            </label>
            <select
              className="filter-select"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
            >
              <option value="All">All Modes</option>
              <option value="Online">Online / Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Offline">Offline / On-site</option>
            </select>
          </div>

          {(searchTerm || selectedType !== 'All' || selectedDomain !== 'All' || selectedMode !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-end', height: '36px' }}
              onClick={resetFilters}
            >
              ✕ Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading live opportunities from database...
        </p>
      ) : opportunities.length > 0 ? (
        <div className="opportunities-grid">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id || opp.id}
              opportunity={opp}
              isSaved={savedIds.has(opp._id || opp.id)}
              onSaveToggle={(id, saved) => handleSaveToggle(opp._id || opp.id, saved)}
              onApply={() => handleApply(opp._id || opp.id)}
              showMatchScore={false}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No Opportunities Found"
          description="There are currently no opportunity listings matching your filter criteria in the database."
          actionText="Reset All Filters"
          onAction={resetFilters}
        />
      )}
    </div>
  );
}
