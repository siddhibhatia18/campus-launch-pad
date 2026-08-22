import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import OpportunityCard from '../../components/OpportunityCard';
import EmptyState from '../../components/EmptyState';
import { fetchSavedOpportunities, unsaveOpportunityApi } from '../../services/api';

export default function SavedOpportunities() {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const data = await fetchSavedOpportunities();
      setSavedList(data.opportunities || []);
    } catch (err) {
      console.error('Error load
        
        ing saved opportunities: ', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleUnsave = async (opportunityId) => {
    try {
      await unsaveOpportunityApi(opportunityId);
      setSavedList(savedList.filter((item) => (item._id || item.id) !== opportunityId));
    } catch (err) {
      console.error('Error unsaving opportunity:', err);
    }
  };

  return (
    <div>
      <PageHeader
        title="Saved Opportunities"
        subtitle="Your real bookmarked opportunities stored persistently in the database."
      >
        <span className="badge badge-accent">{savedList.length} Bookmarked</span>
      </PageHeader>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Loading saved opportunities...
        </p>
      ) : savedList.length > 0 ? (
        <div className="opportunities-grid">
          {savedList.map((opp) => (
            <OpportunityCard
              key={opp._id || opp.id}
              opportunity={opp}
              isSaved={true}
              onSaveToggle={(id) => handleUnsave(opp._id || opp.id)}
              showMatchScore={false}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔖"
          title="No Saved Opportunities Yet"
          description="Browse the live opportunities catalog and click the bookmark icon to save opportunities here."
          actionText="Explore Opportunities"
          onAction={() => navigate('/student/opportunities')}
        />
      )}
    </div>
  );
}
