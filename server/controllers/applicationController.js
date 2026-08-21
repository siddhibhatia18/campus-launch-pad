import Application from '../models/Application.js';
import Opportunity from '../models/Opportunity.js';

// @desc    Get all applications for logged in student
// @route   GET /api/applications
// @access  Private (Student)
export const getApplications = async (req, res) => {
  try {
    const apps = await Application.find({ student: req.user._id })
      .populate('opportunity')
      .sort({ appliedAt: -1 });

    const applications = apps
      .filter((a) => a.opportunity !== null)
      .map((a) => ({
        id: a._id,
        opportunityId: a.opportunity._id,
        title: a.opportunity.title,
        organization: a.opportunity.organization,
        type: a.opportunity.type,
        domain: a.opportunity.domain,
        location: a.opportunity.location,
        mode: a.opportunity.mode,
        deadline: a.opportunity.deadline,
        applicationLink: a.opportunity.applicationLink,
        status: a.status,
        appliedAt: a.appliedAt,
      }));

    res.json({
      status: 'success',
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('GetApplications Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error fetching applications',
    });
  }
};

// @desc    Track interest or application to an opportunity
// @route   POST /api/applications/:opportunityId
// @access  Private (Student)
export const createOrUpdateApplication = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { status = 'Applied' } = req.body;

    const opp = await Opportunity.findById(opportunityId);
    if (!opp) {
      return res.status(404).json({
        status: 'error',
        message: 'Opportunity not found',
      });
    }

    let application = await Application.findOne({
      student: req.user._id,
      opportunity: opportunityId,
    });

    if (application) {
      application.status = status;
      application.appliedAt = new Date();
      await application.save();
    } else {
      application = await Application.create({
        student: req.user._id,
        opportunity: opportunityId,
        status,
        appliedAt: new Date(),
      });
    }

    res.status(201).json({
      status: 'success',
      message: `Opportunity tracked as ${status}`,
      application,
    });
  } catch (error) {
    console.error('CreateApplication Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error tracking application',
    });
  }
};

// @desc    Update status of an application
// @route   PATCH /api/applications/:opportunityId
// @access  Private (Student)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { opportunityId } = req.params;
    const { status } = req.body;

    if (!status || !['Interested', 'Applied'].includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid status: "Interested" or "Applied"',
      });
    }

    const application = await Application.findOneAndUpdate(
      { student: req.user._id, opportunity: opportunityId },
      { status, appliedAt: new Date() },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        status: 'error',
        message: 'Application record not found',
      });
    }

    res.json({
      status: 'success',
      message: 'Status updated successfully',
      application,
    });
  } catch (error) {
    console.error('UpdateApplicationStatus Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error updating application status',
    });
  }
};
