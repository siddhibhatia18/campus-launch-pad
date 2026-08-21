import SavedOpportunity from '../models/SavedOpportunity.js';
import Opportunity from '../models/Opportunity.js';

// @desc    Get all saved opportunities for logged in student
// @route   GET /api/saved
// @access  Private (Student)
export const getSavedOpportunities = async (req, res) => {
  try {
    const saved = await SavedOpportunity.find({ student: req.user._id })
      .populate('opportunity')
      .sort({ savedAt: -1 });

    const opportunities = saved
      .filter((s) => s.opportunity !== null)
      .map((s) => ({
        ...s.opportunity.toObject(),
        savedAt: s.savedAt,
        savedId: s._id,
      }));

    res.json({
      status: 'success',
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error('GetSaved Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching saved opportunities',
    });
  }
};

// @desc    Save an opportunity
// @route   POST /api/saved/:opportunityId
// @access  Private (Student)
export const saveOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found',
      });
    }

    // Check if already saved
    const existing = await SavedOpportunity.findOne({
      student: req.user._id,
      opportunity: opportunityId,
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'Opportunity is already saved in your bookmarks',
      });
    }

    const saved = await SavedOpportunity.create({
      student: req.user._id,
      opportunity: opportunityId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Opportunity saved successfully',
      saved,
    });
  } catch (error) {
    console.error('SaveOpportunity Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error saving opportunity',
    });
  }
};

// @desc    Remove saved opportunity
// @route   DELETE /api/saved/:opportunityId
// @access  Private (Student)
export const unsaveOpportunity = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const result = await SavedOpportunity.findOneAndDelete({
      student: req.user._id,
      opportunity: opportunityId,
    });

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity was not in your saved list',
      });
    }

    res.json({
      status: 'success',
      message: 'Opportunity removed from saved list',
    });
  } catch (error) {
    console.error('UnsaveOpportunity Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error removing saved opportunity',
    });
  }
};
