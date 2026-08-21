import Opportunity from '../models/Opportunity.js';

// @desc    Get all opportunities with search and filter
// @route   GET /api/opportunities
// @access  Public
export const getOpportunities = async (req, res) => {
  try {
    const { search, type, domain, mode } = req.query;
    let query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { organization: searchRegex },
        { description: searchRegex },
        { domain: searchRegex },
        { requiredSkills: { $in: [searchRegex] } },
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (domain && domain !== 'All') {
      query.domain = new RegExp(domain, 'i');
    }

    if (mode && mode !== 'All') {
      query.mode = mode;
    }

    const opportunities = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({
      status: 'success',
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error('GetOpportunities Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching opportunities',
    });
  }
};

// @desc    Get single opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Public
export const getOpportunityById = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!opportunity) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found',
      });
    }

    res.json({
      status: 'success',
      opportunity,
    });
  } catch (error) {
    console.error('GetOpportunityById Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching opportunity',
    });
  }
};

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private (Admin)
export const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      organization,
      type,
      domain,
      requiredSkills,
      location,
      mode,
      deadline,
      applicationLink,
    } = req.body;

    if (!title || !description || !organization || !domain || !applicationLink) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields: title, description, organization, domain, and applicationLink',
      });
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills
      : typeof requiredSkills === 'string'
      ? requiredSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const opportunity = await Opportunity.create({
      title: title.trim(),
      description: description.trim(),
      organization: organization.trim(),
      type: type || 'Internship',
      domain: domain.trim(),
      requiredSkills: skillsArray,
      location: location ? location.trim() : 'Remote',
      mode: mode || 'Online',
      deadline: deadline ? deadline.trim() : 'Rolling',
      applicationLink: applicationLink.trim(),
      createdBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      status: 'success',
      message: 'Opportunity created successfully',
      opportunity,
    });
  } catch (error) {
    console.error('CreateOpportunity Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error creating opportunity',
    });
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private (Admin)
export const updateOpportunity = async (req, res) => {
  try {
    let opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found',
      });
    }

    if (req.body.requiredSkills && typeof req.body.requiredSkills === 'string') {
      req.body.requiredSkills = req.body.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    opportunity = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      status: 'success',
      message: 'Opportunity updated successfully',
      opportunity,
    });
  } catch (error) {
    console.error('UpdateOpportunity Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error updating opportunity',
    });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private (Admin)
export const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found',
      });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Opportunity removed successfully',
    });
  } catch (error) {
    console.error('DeleteOpportunity Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error deleting opportunity',
    });
  }
};
