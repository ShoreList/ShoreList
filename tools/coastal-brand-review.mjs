export const MINIMUM_BRAND_SCORE = 90;
export const MINIMUM_PRODUCT_MEAN = 9;
const MINIMUM_PRODUCT_CRITERION = 8;
const PRODUCT_CRITERIA = [
  'MOOD', 'ORIGINALITY', 'EMBELLISHMENT', 'PLACE', 'COLOR', 'TYPE', 'SELL', 'MOCKUP QUALITY', 'AWARD', 'REALNESS',
];
export const BRAND_CRITERIA = [
  'localFidelity', 'coastalLuxury', 'personalConnection', 'originalityAndExecution', 'presentationAccuracy',
];

const REVISION_DIGEST = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const documented = (value) => typeof value === 'string' && value.trim().length > 0;
function sourceUrl(value) {
  if (!documented(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

// Human reviewers supply the findings and scores for the exact revision.
export function coastalBrandIssues(review) {
  if (!review || review.independent !== true || !documented(review.reviewer) || !REVISION_DIGEST.test(review.reviewedRevision ?? '')) {
    return ['independent coastal luxury review of the exact revision'];
  }
  const issues = [];
  if (review.localAccuracyVerified !== true || !Array.isArray(review.references) || !review.references.length ||
      !review.references.every((source) => sourceUrl(source?.url) && documented(source?.evidence))) {
    issues.push('verified local references');
  }
  if (review.hasHardFailure !== false) issues.push('coastal brand hard-failure review');
  const criteria = BRAND_CRITERIA.map((key) => review.criteria?.[key]);
  if (!criteria.every((entry) => Number.isInteger(entry?.score) && entry.score >= 0 &&
      entry.score <= 20 && documented(entry.evidence))) {
    issues.push('evidence for all five coastal brand scores');
  } else if (criteria.reduce((total, entry) => total + entry.score, 0) < MINIMUM_BRAND_SCORE) {
    issues.push('coastal luxury brand match below ' + MINIMUM_BRAND_SCORE + '/100');
  }
  return issues;
}

export function productScoreIssues(scores, evidence) {
  const values = PRODUCT_CRITERIA.map((key) => scores?.[key]);
  if (!values.every((value) => Number.isFinite(value) && value >= 0 && value <= 10) ||
      !PRODUCT_CRITERIA.every((key) => documented(evidence?.[key]))) return ['evidence for all ten scores'];

  const issues = [];
  if (values.some((value) => value < MINIMUM_PRODUCT_CRITERION)) issues.push('criterion score below ' + MINIMUM_PRODUCT_CRITERION);
  if (values.reduce((total, value) => total + value, 0) / PRODUCT_CRITERIA.length < MINIMUM_PRODUCT_MEAN) {
    issues.push('product review mean below ' + MINIMUM_PRODUCT_MEAN + '/10');
  }
  return issues;
}
