/**
 * Campus Launch Pad — Explainable Recommendation & Candidate Matching Engine
 */

/**
 * Calculate opportunity recommendation score for a student
 * 
 * Deterministic Algorithm:
 * - Skill Match: 50%
 * - Domain Match: 30%
 * - Interest Match: 20%
 * 
 * @param {Object} studentProfile - The student's database profile (skills, interestedDomains, interests, college, projects)
 * @param {Object} opportunity - The opportunity record (requiredSkills, domain, type, title, description)
 * @returns {Object} { matchScore, matchedSkills, missingSkills, matchReasons }
 */
export const calculateOpportunityMatch = (studentProfile, opportunity) => {
  const studentSkills = studentProfile?.skills || [];
  const studentDomains = studentProfile?.interestedDomains || [];
  const studentInterests = studentProfile?.interests || [];
  const requiredSkills = opportunity?.requiredSkills || [];

  let skillPoints = 0;
  let domainPoints = 0;
  let interestPoints = 0;

  const matchedSkills = [];
  const missingSkills = [];
  const matchReasons = [];

  // 1. Skill Match (Max 50 points)
  if (requiredSkills.length > 0) {
    let skillScoreSum = 0;

    requiredSkills.forEach((reqSkill) => {
      const normalizedReq = reqSkill.trim().toLowerCase();
      const foundSkill = studentSkills.find(
        (s) => s.name && s.name.trim().toLowerCase() === normalizedReq
      );

      if (foundSkill) {
        matchedSkills.push(reqSkill);
        let proficiencyMultiplier = 0.85; // default intermediate
        if (foundSkill.level === 'Advanced') proficiencyMultiplier = 1.0;
        else if (foundSkill.level === 'Beginner') proficiencyMultiplier = 0.65;

        skillScoreSum += proficiencyMultiplier;
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const matchRatio = skillScoreSum / requiredSkills.length;
    skillPoints = Math.round(matchRatio * 50);

    if (matchedSkills.length === requiredSkills.length && requiredSkills.length > 0) {
      matchReasons.push(`Matches 100% of required technical skills (${matchedSkills.join(', ')})`);
    } else if (matchedSkills.length > 0) {
      matchReasons.push(`Matched ${matchedSkills.length} of ${requiredSkills.length} required skills (${matchedSkills.join(', ')})`);
    } else {
      matchReasons.push(`Requires skills you haven't added yet (${requiredSkills.slice(0, 3).join(', ')})`);
    }
  } else {
    skillPoints = 35;
    matchReasons.push('Open to all skill levels with no strict prerequisites');
  }

  // 2. Domain Match (Max 30 points)
  const oppDomain = (opportunity.domain || '').trim().toLowerCase();
  const hasDomainMatch = studentDomains.some((d) => {
    const norm = d.trim().toLowerCase();
    return norm.includes(oppDomain) || oppDomain.includes(norm);
  });

  if (hasDomainMatch) {
    domainPoints = 30;
    matchReasons.push(`Direct alignment with your preferred domain: "${opportunity.domain}"`);
  } else if (studentDomains.length > 0) {
    domainPoints = 10;
    matchReasons.push(`Opportunity in ${opportunity.domain} (Broad engineering relevance)`);
  } else {
    domainPoints = 10;
  }

  // 3. Interest Match (Max 20 points)
  const oppType = (opportunity.type || '').trim().toLowerCase();
  const hasInterestMatch = studentInterests.some((int) => {
    const norm = int.trim().toLowerCase();
    return norm.includes(oppType) || oppType.includes(norm);
  });

  if (hasInterestMatch) {
    interestPoints = 20;
    matchReasons.push(`Matches your active interest in ${opportunity.type}s`);
  } else {
    interestPoints = 10;
  }

  if (studentProfile?.projects && studentProfile.projects.length > 0 && matchedSkills.length > 0) {
    matchReasons.push('Relevant project portfolio alignment');
  }

  const matchScore = Math.min(100, Math.max(0, skillPoints + domainPoints + interestPoints));

  return {
    matchScore,
    matchedSkills,
    missingSkills,
    matchReasons,
  };
};

// Skill synonym & related technology clusters
const SKILL_CLUSTERS = {
  'ui/ux': ['ui/ux', 'ui/ux designer', 'ui/ux design', 'figma', 'adobe xd', 'prototyping', 'wireframing', 'user research', 'product design', 'interaction design'],
  'frontend': ['frontend', 'frontend developer', 'frontend development', 'react', 'react.js', 'vue', 'vue.js', 'angular', 'javascript', 'typescript', 'html', 'css', 'html/css', 'next.js', 'tailwind css', 'redux'],
  'backend': ['backend', 'backend developer', 'backend development', 'node.js', 'nodejs', 'express', 'express.js', 'python', 'django', 'flask', 'fastapi', 'java', 'spring boot', 'go', 'golang', 'mongodb', 'postgresql', 'mysql', 'sql', 'rest api', 'graphql'],
  'full stack': ['full stack', 'full stack developer', 'mern', 'mean', 'node.js', 'react', 'mongodb', 'javascript', 'typescript'],
  'mobile': ['mobile', 'mobile app developer', 'mobile development', 'flutter', 'react native', 'swift', 'kotlin', 'android', 'ios', 'dart'],
  'ai/ml': ['machine learning', 'deep learning', 'ai', 'artificial intelligence', 'data science', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'nlp', 'computer vision', 'data analysis'],
  'devops': ['devops', 'cloud', 'aws', 'docker', 'kubernetes', 'ci/cd', 'linux', 'azure', 'gcp', 'terraform'],
  'blockchain': ['blockchain', 'web3', 'solidity', 'smart contracts', 'ethereum'],
};

/**
 * Calculate candidate match score for an individual Project Requirement role
 * 
 * Evaluates:
 * - Skill exact/semantic match (Base 70-85 points)
 * - Required proficiency vs Student proficiency (+/- 15 points)
 * - Related skill cluster bonuses
 * - Project Category / Domain alignment (+8 points)
 * - Interest alignment (+5 points)
 * - Project portfolio alignment (+4 points)
 * 
 * @param {Object} studentProfile - Student profile with skills, domains, interests
 * @param {string} reqSkill - Required skill name (e.g. "React", "UI/UX", "Frontend Developer")
 * @param {string} reqLevel - Required level ("Beginner", "Intermediate" / "Medium", "Advanced")
 * @param {string} projectCategory - Category of the project
 * @returns {Object} { matchScore, matchedSkillName, matchingSkills, studentLevel, hasSkill, matchReasons }
 */
export const calculateCandidateSkillMatch = (
  studentProfile,
  reqSkill = '',
  reqLevel = 'Intermediate',
  projectCategory = ''
) => {
  const studentSkills = studentProfile?.skills || [];
  const studentDomains = studentProfile?.interestedDomains || [];
  const studentInterests = studentProfile?.interests || [];

  const normalizedReqSkill = (reqSkill || '').trim().toLowerCase();
  const normalizedReqLevel = (reqLevel || 'Intermediate').toLowerCase() === 'medium' ? 'intermediate' : (reqLevel || 'Intermediate').trim().toLowerCase();

  // Find direct match or substring matches
  const directMatches = [];
  const relatedMatches = [];

  // Determine relevant cluster keys
  const activeClusters = Object.keys(SKILL_CLUSTERS).filter((clusterKey) => {
    return normalizedReqSkill.includes(clusterKey) || clusterKey.includes(normalizedReqSkill) ||
      SKILL_CLUSTERS[clusterKey].some((alias) => alias === normalizedReqSkill || normalizedReqSkill.includes(alias) || alias.includes(normalizedReqSkill));
  });

  studentSkills.forEach((s) => {
    if (!s.name) return;
    const sName = s.name.trim().toLowerCase();

    // Direct exact or substring match
    if (sName === normalizedReqSkill || sName.includes(normalizedReqSkill) || normalizedReqSkill.includes(sName)) {
      directMatches.push(s);
    } else if (activeClusters.some((key) => SKILL_CLUSTERS[key]?.some((alias) => alias === sName || sName.includes(alias) || alias.includes(sName)))) {
      relatedMatches.push(s);
    }
  });

  const levelValues = {
    beginner: 1,
    medium: 2,
    intermediate: 2,
    advanced: 3,
  };

  const reqVal = levelValues[normalizedReqLevel] || 2;
  const matchReasons = [];
  const allMatchingSkills = [...directMatches, ...relatedMatches].map((s) => s.name);

  if (directMatches.length > 0 || relatedMatches.length > 0) {
    const primarySkill = directMatches[0] || relatedMatches[0];
    let score = directMatches.length > 0 ? 76 : 68;

    const studentVal = levelValues[primarySkill.level?.toLowerCase()] || 2;

    if (studentVal >= reqVal) {
      if (studentVal > reqVal) {
        score += 14;
        matchReasons.push(`Exceeds requirement: Has ${primarySkill.level} proficiency (Required: ${reqLevel})`);
      } else {
        score += 10;
        matchReasons.push(`Proficiency match: ${primarySkill.level}`);
      }
    } else {
      const diff = reqVal - studentVal;
      score -= diff * 10;
      matchReasons.push(`Developing proficiency: Has ${primarySkill.level} (Required: ${reqLevel})`);
    }

    if (directMatches.length > 0) {
      matchReasons.push(`Skill match: ${directMatches.map((s) => s.name).join(', ')}`);
    }

    if (relatedMatches.length > 0) {
      const relatedNames = relatedMatches.map((s) => s.name).join(', ');
      score += Math.min(8, relatedMatches.length * 3);
      matchReasons.push(`Related technical skill tools: ${relatedNames}`);
    }

    // Domain match bonus
    const normCategory = (projectCategory || '').trim().toLowerCase();
    if (normCategory && studentDomains.some((d) => d.toLowerCase().includes(normCategory) || normCategory.includes(d.toLowerCase()))) {
      score += 6;
      matchReasons.push(`Interested in project domain (${projectCategory})`);
    }

    // Interests match bonus
    if (studentInterests.some((i) => i.toLowerCase().includes(normCategory) || normCategory.includes(i.toLowerCase()))) {
      score += 4;
      matchReasons.push('Active interest in project category');
    }

    // Project portfolio bonus
    if (studentProfile?.projects?.some((p) => p.title?.toLowerCase().includes(normalizedReqSkill) || p.description?.toLowerCase().includes(normalizedReqSkill))) {
      score += 3;
      matchReasons.push(`Portfolio project experience related to ${reqSkill}`);
    }

    const finalScore = Math.min(98, Math.max(50, Math.round(score)));

    return {
      matchScore: finalScore,
      matchedSkillName: primarySkill.name,
      matchingSkills: allMatchingSkills,
      studentLevel: primarySkill.level || 'Intermediate',
      hasSkill: true,
      matchReasons,
    };
  } else {
    // Student doesn't have this technical skill listed
    let score = 25;
    const normCategory = (projectCategory || '').trim().toLowerCase();

    if (normCategory && studentDomains.some((d) => d.toLowerCase().includes(normCategory))) {
      score += 15;
      matchReasons.push(`Background in related domain (${projectCategory})`);
    }

    return {
      matchScore: Math.min(45, Math.round(score)),
      matchedSkillName: null,
      matchingSkills: [],
      studentLevel: 'Not Listed',
      hasSkill: false,
      matchReasons: matchReasons.length > 0 ? matchReasons : ['Skill not yet listed on profile'],
    };
  }
};

/**
 * Calculate overall project match score for a student
 * 
 * @param {Object} studentProfile - Student profile with skills, domains, interests
 * @param {Object} project - Project record with skillRequirements and category
 * @returns {Object} { matchScore, bestMatchRole, matchedRolesCount, totalRolesCount, matchReasons }
 */
export const calculateProjectMatch = (studentProfile, project) => {
  const reqs = project?.skillRequirements || [];
  if (reqs.length === 0) {
    return {
      matchScore: 60,
      bestMatchRole: null,
      bestRequirementId: null,
      matchedRolesCount: 0,
      totalRolesCount: 0,
      matchReasons: ['Open project with general team collaboration'],
    };
  }

  let bestMatch = null;
  let highestScore = 0;
  let matchedCount = 0;

  reqs.forEach((reqItem) => {
    const result = calculateCandidateSkillMatch(
      studentProfile,
      reqItem.skill,
      reqItem.level,
      project.category
    );

    if (result.hasSkill) {
      matchedCount += 1;
    }

    if (!bestMatch || result.matchScore > highestScore) {
      highestScore = result.matchScore;
      bestMatch = {
        requirementId: reqItem._id,
        skill: reqItem.skill,
        level: reqItem.level,
        matchScore: result.matchScore,
        matchedSkillName: result.matchedSkillName,
        studentLevel: result.studentLevel,
        hasSkill: result.hasSkill,
        matchReasons: result.matchReasons,
      };
    }
  });

  return {
    matchScore: highestScore,
    bestMatchRole: bestMatch?.skill || reqs[0]?.skill,
    bestRequirementId: bestMatch?.requirementId || reqs[0]?._id,
    bestMatch,
    matchedRolesCount: matchedCount,
    totalRolesCount: reqs.length,
    matchReasons: bestMatch?.matchReasons || ['Project opportunity in your study area'],
  };
};

