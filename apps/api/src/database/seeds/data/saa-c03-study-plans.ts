/**
 * Seed data for SAA-C03 preset study plan templates.
 *
 * Each plan defines a recommended set of resources (by title, matching SAA_RESOURCES)
 * and topic focus areas (by slug, matching SAA_TOPICS), organised into phases.
 *
 * Resource selection follows the priority field from SAA_RESOURCES:
 *   priority 1 → MUST-HAVE  (included in every plan)
 *   priority 2 → NICE-TO-HAVE  (added from the 120h plan onward)
 *   priority 3 → OPTIONAL  (only in the 160h plan)
 *
 * The 80h plan uses the shorter Maarek course for exam efficiency.
 * The 120h plan switches to the deeper Cantrill course.
 * The 160h plan uses both: Maarek first for a quick sweep, then Cantrill for depth.
 */

export interface SeedStudyPlanPhase {
  /** Short display name, e.g. "Phase 1: Orientation" */
  name: string;
  /** What the learner should accomplish in this phase */
  description: string;
  /** 1-based week numbers this phase spans within the plan */
  weekNumbers: number[];
  /**
   * Titles of resources to study in this phase.
   * Must match the `title` field of entries in SAA_RESOURCES exactly.
   */
  resourceTitles: string[];
  /**
   * Topic slugs to focus on in this phase.
   * Must match the `slug` field of entries in SAA_TOPICS exactly.
   */
  focusTopicSlugs: string[];
}

export interface SeedStudyPlan {
  slug: string;
  name: string;
  /** One-line elevator pitch shown in plan selection UI */
  tagline: string;
  description: string;
  totalHours: number;
  /**
   * Suggested study hours per day.
   * Kept within 1–8 to satisfy the CreateStudyPlanDto constraint.
   */
  recommendedDailyHours: number;
  recommendedWeeks: number;
  targetAudience: string;
  phases: SeedStudyPlanPhase[];
  /**
   * Ordered list of all resource titles included in this plan.
   * Order reflects the recommended consumption sequence.
   * All values must exactly match `title` fields in SAA_RESOURCES.
   */
  resourceTitles: string[];
}

// ─── 80-Hour Plan ─────────────────────────────────────────────────────────────
// Priority 1 (MUST-HAVE) resources only, plus two key priority-2 supplements.
// Optimised for speed: uses Maarek's exam-focused course as the single main resource.

const PLAN_80H: SeedStudyPlan = {
  slug: 'saa-c03-80h-rapid-pass',
  name: '10 weeks · 2 h/day · Standard',
  tagline: 'The fastest credible path to passing. No fluff, maximum exam ROI.',
  description:
    'Designed for candidates with some AWS background who need to pass within 10 weeks '
    + 'while studying ~2 hours a day. Every resource is a high-signal priority-1 must-have, '
    + 'plus the Tutorials Dojo cheat sheets for last-week consolidation. '
    + 'All four exam domains are covered through the Maarek course before moving to active recall.',
  totalHours: 80,
  recommendedDailyHours: 2,
  recommendedWeeks: 10,
  targetAudience:
    'Candidates with 1+ year of AWS experience, re-takers, or those on a tight deadline.',
  resourceTitles: [
    // Phase 1 – start here
    'SAA-C03 Exam Guide',
    'AWS Well-Architected Framework',
    // Phase 2 – main course
    'Ultimate SAA-C03 Course by Stephane Maarek',
    // Phase 3 – consolidation
    'Tutorials Dojo AWS Cheat Sheets',
    // Phase 4 – exam simulation
    'Official AWS Practice Question Set',
    'Tutorials Dojo Practice Exams (Jon Bonso)',
  ],
  phases: [
    {
      name: 'Phase 1: Orientation',
      description:
        'Read the official exam blueprint to understand exactly what is tested. '
        + 'Skim the 6 Well-Architected pillars so you have a mental model before starting the course.',
      weekNumbers: [1],
      resourceTitles: [
        'SAA-C03 Exam Guide',
        'AWS Well-Architected Framework',
      ],
      focusTopicSlugs: [
        // All domains at awareness level
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'event-driven-and-messaging',
        'edge-and-global-routing',
        'compute-selection-and-scaling',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-performance-and-hybrid',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'monitoring-detection-and-response',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
        'cost-visibility-and-governance',
      ],
    },
    {
      name: 'Phase 2: Core Learning',
      description:
        'Work through the Maarek course section by section. '
        + 'Take notes on service limits, trade-offs, and "when to use X vs Y" comparisons — '
        + 'these are the backbone of scenario-based exam questions.',
      weekNumbers: [2, 3, 4, 5, 6, 7],
      resourceTitles: [
        'Ultimate SAA-C03 Course by Stephane Maarek',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'event-driven-and-messaging',
        'edge-and-global-routing',
        'compute-selection-and-scaling',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-performance-and-hybrid',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'monitoring-detection-and-response',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
        'cost-visibility-and-governance',
      ],
    },
    {
      name: 'Phase 3: Rapid Review',
      description:
        'Use the Tutorials Dojo cheat sheets to reinforce service comparisons and fill gaps. '
        + 'Focus on tables you found confusing in the course (e.g. SQS vs SNS vs EventBridge, '
        + 'NAT Gateway vs NAT Instance, EBS volume types).',
      weekNumbers: [8, 9],
      resourceTitles: [
        'Tutorials Dojo AWS Cheat Sheets',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'event-driven-and-messaging',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-security-controls',
        'cost-aware-architecture-decisions',
        'storage-and-data-transfer-optimization',
      ],
    },
    {
      name: 'Phase 4: Exam Simulation',
      description:
        'Take the free official question set first to calibrate your baseline. '
        + 'Then work through all Tutorials Dojo practice exams in Review Mode — '
        + 'read every explanation, including the wrong answers. '
        + 'Re-study any topic where you score below 70%.',
      weekNumbers: [10],
      resourceTitles: [
        'Official AWS Practice Question Set',
        'Tutorials Dojo Practice Exams (Jon Bonso)',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'identity-access-and-governance',
        'network-security-controls',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
      ],
    },
  ],
};

// ─── 120-Hour Plan ────────────────────────────────────────────────────────────
// Priority 1 + all priority-2 (NICE-TO-HAVE) resources.
// Uses Cantrill as the primary course for architectural depth.

const PLAN_120H: SeedStudyPlan = {
  slug: 'saa-c03-120h-standard-prep',
  name: '14 weeks · 2 h/day · Deep',
  tagline: 'The well-rounded plan. Deep enough to actually understand AWS, fast enough to stay on track.',
  description:
    'A 14-week plan at ~2 h/day (or 9 weeks at 3 h/day). The Cantrill course builds genuine '
    + 'architectural intuition. Service-specific docs are interleaved with the relevant course '
    + 'section so knowledge sticks. All priority-2 resources are included, giving full coverage '
    + 'of the four exam domains plus the supporting service details that appear in scenario questions.',
  totalHours: 120,
  recommendedDailyHours: 2,
  recommendedWeeks: 14,
  targetAudience:
    'Most candidates: those with some cloud experience who want a solid pass and marketable skills, not just a cert.',
  resourceTitles: [
    // Phase 1 – orientation
    'SAA-C03 Exam Guide',
    'AWS Well-Architected Framework',
    'AWS Skill Builder: SAA-C03 Learning Plan',
    // Phase 2 – resilient & high-performing domains
    'SAA-C03 Course by Adrian Cantrill',       // main course spans phases 2–3
    'AWS Disaster Recovery Whitepaper',
    'Amazon Route 53 Routing Policies',
    'Amazon VPC User Guide',
    'EC2 Auto Scaling Documentation',
    // Phase 3 – secure & cost-optimized domains
    'IAM Best Practices',
    'AWS KMS Developer Guide',
    'Amazon RDS Best Practices',
    'Amazon S3 Storage Classes',
    'Amazon SQS Developer Guide',
    // Phase 4 – review & consolidation
    'Tutorials Dojo AWS Cheat Sheets',
    // Phase 5 – exam simulation
    'Official AWS Practice Question Set',
    'Tutorials Dojo Practice Exams (Jon Bonso)',
  ],
  phases: [
    {
      name: 'Phase 1: Orientation',
      description:
        'Read the exam blueprint in full and map every task statement to a domain. '
        + 'Work through the AWS Skill Builder plan introductory modules for a high-level service survey. '
        + 'Read the Well-Architected Framework focusing on the Reliability and Security pillars first.',
      weekNumbers: [1],
      resourceTitles: [
        'SAA-C03 Exam Guide',
        'AWS Well-Architected Framework',
        'AWS Skill Builder: SAA-C03 Learning Plan',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'identity-access-and-governance',
        'cost-aware-architecture-decisions',
      ],
    },
    {
      name: 'Phase 2: Resilient & High-Performing Architectures',
      description:
        'Cover Domain 1 (30%) and Domain 2 (28%) of the exam through the Cantrill course. '
        + 'Read the DR whitepaper alongside the disaster-recovery section of the course. '
        + 'Study the Route 53, VPC, and EC2 Auto Scaling docs immediately after the relevant course lectures.',
      weekNumbers: [2, 3, 4, 5, 6],
      resourceTitles: [
        'SAA-C03 Course by Adrian Cantrill',
        'AWS Disaster Recovery Whitepaper',
        'Amazon Route 53 Routing Policies',
        'Amazon VPC User Guide',
        'EC2 Auto Scaling Documentation',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'event-driven-and-messaging',
        'edge-and-global-routing',
        'compute-selection-and-scaling',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-performance-and-hybrid',
      ],
    },
    {
      name: 'Phase 3: Secure & Cost-Optimized Architectures',
      description:
        'Cover Domain 3 (24%) and Domain 4 (18%) through subsequent Cantrill course sections. '
        + 'Read the IAM and KMS docs during the security sections, and the RDS, S3, and SQS docs '
        + 'during the relevant service lectures. Take notes on encryption key hierarchy and IAM evaluation logic.',
      weekNumbers: [7, 8, 9, 10],
      resourceTitles: [
        'SAA-C03 Course by Adrian Cantrill',
        'IAM Best Practices',
        'AWS KMS Developer Guide',
        'Amazon RDS Best Practices',
        'Amazon S3 Storage Classes',
        'Amazon SQS Developer Guide',
      ],
      focusTopicSlugs: [
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'monitoring-detection-and-response',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
        'cost-visibility-and-governance',
      ],
    },
    {
      name: 'Phase 4: Consolidation & Review',
      description:
        'Work through the Tutorials Dojo cheat sheets systematically, focusing on comparison tables. '
        + 'Build a personal "trap answers" list of the service pairs you keep confusing. '
        + 'Review any Cantrill course sections where you feel uncertain.',
      weekNumbers: [11, 12],
      resourceTitles: [
        'Tutorials Dojo AWS Cheat Sheets',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'event-driven-and-messaging',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-security-controls',
        'cost-aware-architecture-decisions',
        'storage-and-data-transfer-optimization',
      ],
    },
    {
      name: 'Phase 5: Exam Simulation',
      description:
        'Complete the official AWS practice set for calibration. '
        + 'Treat each Tutorials Dojo exam as a real sitting. '
        + 'After each exam, review every wrong answer and revisit the relevant course section or doc. '
        + 'Aim for a consistent 80%+ before booking the real exam.',
      weekNumbers: [13, 14],
      resourceTitles: [
        'Official AWS Practice Question Set',
        'Tutorials Dojo Practice Exams (Jon Bonso)',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
      ],
    },
  ],
};

// ─── 160-Hour Plan ────────────────────────────────────────────────────────────
// All 22 resources across all priority levels.
// Uses both courses: Maarek for a rapid first sweep, Cantrill for architectural depth.

const PLAN_160H: SeedStudyPlan = {
  slug: 'saa-c03-160h-comprehensive-mastery',
  name: '15 weeks · 3 h/day · Comprehensive',
  tagline: 'Exam-ready and architecture-fluent. Build skills that last beyond the certification.',
  description:
    'A 15-week plan at ~3 h/day (or 11 weeks at 4 h/day). '
    + 'All 22 resources are included across five structured phases. '
    + 'Maarek provides a fast domain survey in Phase 2; Cantrill delivers deep architectural understanding in Phase 3. '
    + 'Advanced and optional resources (VPC Lattice, Bedrock, Architecture Center, re:Invent, ExamTopics) '
    + 'fill Phase 4. Phase 5 is dedicated to intensive simulation and gap-closing.',
  totalHours: 160,
  recommendedDailyHours: 3,
  recommendedWeeks: 15,
  targetAudience:
    'Beginners to AWS, engineers who want career-grade skills, or anyone aiming for a high exam score (900+).',
  resourceTitles: [
    // Phase 1 – orientation
    'SAA-C03 Exam Guide',
    'AWS Well-Architected Framework',
    'AWS Skill Builder: SAA-C03 Learning Plan',
    // Phase 2 – rapid domain sweep
    'Ultimate SAA-C03 Course by Stephane Maarek',
    // Phase 3 – deep architectural study
    'SAA-C03 Course by Adrian Cantrill',
    'AWS Disaster Recovery Whitepaper',
    'Amazon Route 53 Routing Policies',
    'Amazon VPC User Guide',
    'EC2 Auto Scaling Documentation',
    'IAM Best Practices',
    'AWS KMS Developer Guide',
    'Amazon RDS Best Practices',
    'Amazon S3 Storage Classes',
    'Amazon SQS Developer Guide',
    // Phase 4 – advanced and supplemental
    'Amazon VPC Lattice User Guide',
    'AWS Architecture Center',
    'AWS re:Invent Deep Dive YouTube Playlist',
    'Amazon Bedrock & GenAI Overview',
    // Phase 5 – exam simulation
    'Tutorials Dojo AWS Cheat Sheets',
    'Official AWS Practice Question Set',
    'ExamTopics SAA-C03 Community Questions',
    'Tutorials Dojo Practice Exams (Jon Bonso)',
  ],
  phases: [
    {
      name: 'Phase 1: Orientation',
      description:
        'Start by mapping the exam landscape. Read the full exam guide and note every in-scope service. '
        + 'Skim the AWS Skill Builder learning plan to understand the recommended AWS study path. '
        + 'Read the Well-Architected Framework holistically — all 6 pillars.',
      weekNumbers: [1],
      resourceTitles: [
        'SAA-C03 Exam Guide',
        'AWS Well-Architected Framework',
        'AWS Skill Builder: SAA-C03 Learning Plan',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'event-driven-and-messaging',
        'edge-and-global-routing',
        'compute-selection-and-scaling',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-performance-and-hybrid',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'monitoring-detection-and-response',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
        'cost-visibility-and-governance',
      ],
    },
    {
      name: 'Phase 2: Rapid Domain Sweep',
      description:
        'Complete the Maarek course end to end without stopping to memorise details. '
        + 'The goal is a broad map of all services and how they connect — details come in Phase 3. '
        + 'Note any concepts that feel unclear; they become the focus list for the deep study phase.',
      weekNumbers: [2, 3, 4, 5],
      resourceTitles: [
        'Ultimate SAA-C03 Course by Stephane Maarek',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'event-driven-and-messaging',
        'edge-and-global-routing',
        'compute-selection-and-scaling',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-performance-and-hybrid',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'monitoring-detection-and-response',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
        'cost-visibility-and-governance',
      ],
    },
    {
      name: 'Phase 3: Deep Architectural Study',
      description:
        'Work through the Cantrill course slowly and deliberately. '
        + 'Interleave the service-specific docs with the matching course section: '
        + 'read the DR whitepaper during the disaster-recovery lectures, '
        + 'the IAM and KMS docs during the security sections, '
        + 'and the VPC, Route 53, RDS, S3, SQS docs as those services appear in the course. '
        + 'Complete the hands-on labs — they are why this plan is 160 hours.',
      weekNumbers: [6, 7, 8, 9, 10, 11],
      resourceTitles: [
        'SAA-C03 Course by Adrian Cantrill',
        'AWS Disaster Recovery Whitepaper',
        'Amazon Route 53 Routing Policies',
        'Amazon VPC User Guide',
        'EC2 Auto Scaling Documentation',
        'IAM Best Practices',
        'AWS KMS Developer Guide',
        'Amazon RDS Best Practices',
        'Amazon S3 Storage Classes',
        'Amazon SQS Developer Guide',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'event-driven-and-messaging',
        'edge-and-global-routing',
        'compute-selection-and-scaling',
        'storage-performance-patterns',
        'database-performance-and-caching',
        'network-performance-and-hybrid',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'monitoring-detection-and-response',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
        'cost-visibility-and-governance',
      ],
    },
    {
      name: 'Phase 4: Advanced & Supplemental Topics',
      description:
        'Study the advanced and optional resources that increasingly appear in 2025-2026 exam versions. '
        + 'Read the VPC Lattice guide and AWS Architecture Center, then watch relevant re:Invent sessions on '
        + 'any services you found hard in phases 2–3. '
        + 'End the phase with the Bedrock overview — a light read covering GenAI context for the exam.',
      weekNumbers: [12, 13],
      resourceTitles: [
        'Amazon VPC Lattice User Guide',
        'AWS Architecture Center',
        'AWS re:Invent Deep Dive YouTube Playlist',
        'Amazon Bedrock & GenAI Overview',
      ],
      focusTopicSlugs: [
        'network-performance-and-hybrid',
        'network-security-controls',
        'multi-tier-fault-tolerant-architecture',
        'compute-selection-and-scaling',
      ],
    },
    {
      name: 'Phase 5: Intensive Simulation & Gap-Closing',
      description:
        'Start with the Tutorials Dojo cheat sheets for a final service-comparison pass. '
        + 'Take the official practice set to get comfortable with AWS question wording. '
        + 'Use ExamTopics for additional pattern exposure — always verify answers against official docs. '
        + 'Finish with the full set of Tutorials Dojo practice exams. '
        + 'Score below 80% on any topic? Return to the relevant Cantrill section and re-read the AWS doc.',
      weekNumbers: [14, 15],
      resourceTitles: [
        'Tutorials Dojo AWS Cheat Sheets',
        'Official AWS Practice Question Set',
        'ExamTopics SAA-C03 Community Questions',
        'Tutorials Dojo Practice Exams (Jon Bonso)',
      ],
      focusTopicSlugs: [
        'multi-tier-fault-tolerant-architecture',
        'disaster-recovery-and-backup',
        'identity-access-and-governance',
        'data-protection-and-key-management',
        'network-security-controls',
        'cost-aware-architecture-decisions',
        'compute-cost-optimization',
        'storage-and-data-transfer-optimization',
      ],
    },
  ],
};

// ─── Custom Plan Variants ─────────────────────────────────────────────────────
//
// 56 generated plans covering every combination of:
//   weeks  : 1, 2, 3, 4, 6, 8, 10, 12
//   h/day  : 2, 3, 4, 5, 6, 7, 8
//
// Resource sets are chosen by total hours (weeks × 7 × hoursPerDay):
//   Tier A  < 14 h  — crash: exam guide + official practice set (exam guide only with official q)
//   Tier B  14–27 h — blitz: + Maarek course
//   Tier C  28–55 h — focused: + Tutorials Dojo cheat sheets + TD practice exams
//   Tier D  56–99 h — standard (≈ 80h plan): all priority-1 resources
//   Tier E 100–139 h — deep (≈ 120h plan): priority-1 + priority-2 resources
//   Tier F  ≥ 140 h — comprehensive (≈ 160h plan): all 22 resources
//
// Phase structure is adapted to the number of weeks:
//   1-2 w → 1 phase (intensive)
//   3-4 w → 2 phases
//   6-8 w → 3 phases
//   10-12 w → 4 phases

// Shared topic slugs groupings
const ALL_TOPIC_SLUGS = [
  'multi-tier-fault-tolerant-architecture',
  'disaster-recovery-and-backup',
  'event-driven-and-messaging',
  'edge-and-global-routing',
  'compute-selection-and-scaling',
  'storage-performance-patterns',
  'database-performance-and-caching',
  'network-performance-and-hybrid',
  'identity-access-and-governance',
  'data-protection-and-key-management',
  'network-security-controls',
  'monitoring-detection-and-response',
  'cost-aware-architecture-decisions',
  'compute-cost-optimization',
  'storage-and-data-transfer-optimization',
  'cost-visibility-and-governance',
] as const;

const RESILIENCE_TOPICS = [
  'multi-tier-fault-tolerant-architecture',
  'disaster-recovery-and-backup',
  'event-driven-and-messaging',
  'edge-and-global-routing',
  'compute-selection-and-scaling',
  'storage-performance-patterns',
  'database-performance-and-caching',
  'network-performance-and-hybrid',
] as const;

const SECURITY_COST_TOPICS = [
  'identity-access-and-governance',
  'data-protection-and-key-management',
  'network-security-controls',
  'monitoring-detection-and-response',
  'cost-aware-architecture-decisions',
  'compute-cost-optimization',
  'storage-and-data-transfer-optimization',
  'cost-visibility-and-governance',
] as const;

const EXAM_FOCUS_TOPICS = [
  'multi-tier-fault-tolerant-architecture',
  'disaster-recovery-and-backup',
  'identity-access-and-governance',
  'network-security-controls',
  'cost-aware-architecture-decisions',
  'compute-cost-optimization',
] as const;

// Resource title sets per tier
const TIER_A_RESOURCES = [
  'SAA-C03 Exam Guide',
  'Official AWS Practice Question Set',
] as const;

const TIER_B_RESOURCES = [
  'SAA-C03 Exam Guide',
  'Ultimate SAA-C03 Course by Stephane Maarek',
  'Official AWS Practice Question Set',
] as const;

const TIER_C_RESOURCES = [
  'SAA-C03 Exam Guide',
  'Ultimate SAA-C03 Course by Stephane Maarek',
  'Tutorials Dojo AWS Cheat Sheets',
  'Official AWS Practice Question Set',
  'Tutorials Dojo Practice Exams (Jon Bonso)',
] as const;

const TIER_D_RESOURCES = [
  'SAA-C03 Exam Guide',
  'AWS Well-Architected Framework',
  'Ultimate SAA-C03 Course by Stephane Maarek',
  'Tutorials Dojo AWS Cheat Sheets',
  'Official AWS Practice Question Set',
  'Tutorials Dojo Practice Exams (Jon Bonso)',
] as const;

const TIER_E_RESOURCES = [
  'SAA-C03 Exam Guide',
  'AWS Well-Architected Framework',
  'AWS Skill Builder: SAA-C03 Learning Plan',
  'SAA-C03 Course by Adrian Cantrill',
  'AWS Disaster Recovery Whitepaper',
  'Amazon Route 53 Routing Policies',
  'Amazon VPC User Guide',
  'EC2 Auto Scaling Documentation',
  'IAM Best Practices',
  'AWS KMS Developer Guide',
  'Amazon RDS Best Practices',
  'Amazon S3 Storage Classes',
  'Amazon SQS Developer Guide',
  'Tutorials Dojo AWS Cheat Sheets',
  'Official AWS Practice Question Set',
  'Tutorials Dojo Practice Exams (Jon Bonso)',
] as const;

const TIER_F_RESOURCES = [
  'SAA-C03 Exam Guide',
  'AWS Well-Architected Framework',
  'AWS Skill Builder: SAA-C03 Learning Plan',
  'Ultimate SAA-C03 Course by Stephane Maarek',
  'SAA-C03 Course by Adrian Cantrill',
  'AWS Disaster Recovery Whitepaper',
  'Amazon Route 53 Routing Policies',
  'Amazon VPC User Guide',
  'EC2 Auto Scaling Documentation',
  'IAM Best Practices',
  'AWS KMS Developer Guide',
  'Amazon RDS Best Practices',
  'Amazon S3 Storage Classes',
  'Amazon SQS Developer Guide',
  'Amazon VPC Lattice User Guide',
  'AWS Architecture Center',
  'AWS re:Invent Deep Dive YouTube Playlist',
  'Amazon Bedrock & GenAI Overview',
  'Tutorials Dojo AWS Cheat Sheets',
  'Official AWS Practice Question Set',
  'ExamTopics SAA-C03 Community Questions',
  'Tutorials Dojo Practice Exams (Jon Bonso)',
] as const;

type ResourceTitles = readonly string[];

interface TierConfig {
  label: string;
  tagline: string;
  targetAudience: string;
  resources: ResourceTitles;
}

function getTier(totalHours: number): TierConfig {
  if (totalHours < 14) {
    return {
      label: 'Crash',
      tagline: 'Absolute minimum: know what is tested and practice the question format.',
      targetAudience: 'Experienced AWS engineers who need a very quick refresher before exam day.',
      resources: TIER_A_RESOURCES,
    };
  }
  if (totalHours < 28) {
    return {
      label: 'Blitz',
      tagline: 'Fast-track through the core course, then validate with official practice questions.',
      targetAudience: 'AWS professionals with hands-on experience aiming for a quick cert top-up.',
      resources: TIER_B_RESOURCES,
    };
  }
  if (totalHours < 56) {
    return {
      label: 'Focused',
      tagline: 'Cover the course in full, consolidate with cheat sheets, and practice under exam conditions.',
      targetAudience: 'Developers or cloud engineers with some AWS exposure who need a structured sprint.',
      resources: TIER_C_RESOURCES,
    };
  }
  if (totalHours < 100) {
    return {
      label: 'Standard',
      tagline: 'All must-have resources across every exam domain. Solid pass-rate track.',
      targetAudience: 'Candidates with 6+ months of AWS experience who want a reliable, well-paced preparation.',
      resources: TIER_D_RESOURCES,
    };
  }
  if (totalHours < 140) {
    return {
      label: 'Deep',
      tagline: 'Priority-1 and priority-2 resources for genuine architectural understanding.',
      targetAudience: 'Candidates who want to understand AWS properly, not just pass the exam.',
      resources: TIER_E_RESOURCES,
    };
  }
  return {
    label: 'Comprehensive',
    tagline: 'All 22 resources across every priority level. Full depth, maximum confidence.',
    targetAudience: 'Beginners, career-changers, or engineers aiming for a 900+ score with lasting knowledge.',
    resources: TIER_F_RESOURCES,
  };
}

function buildWeekRange(start: number, end: number): number[] {
  const weeks: number[] = [];
  for (let w = start; w <= end; w++) weeks.push(w);
  return weeks;
}

function buildPhases(
  weeks: number,
  resources: ResourceTitles,
): SeedStudyPlanPhase[] {
  // ── 1-2 weeks: single intensive phase ──────────────────────────────────────
  if (weeks <= 2) {
    return [
      {
        name: 'Phase 1: Intensive Preparation',
        description:
          'Work through all selected resources in a compressed schedule. '
          + 'Read the exam guide on day 1 to anchor the scope. '
          + 'If a course is included, pace it evenly across the remaining days. '
          + 'Reserve the final 20% of time exclusively for practice questions.',
        weekNumbers: buildWeekRange(1, weeks),
        resourceTitles: [...resources],
        focusTopicSlugs: [...ALL_TOPIC_SLUGS],
      },
    ];
  }

  // ── 3-4 weeks: 2 phases ────────────────────────────────────────────────────
  if (weeks <= 4) {
    const learningEnd = Math.floor(weeks * 0.65);
    const simStart = learningEnd + 1;

    const learningResources = resources.filter(
      (r) => !r.includes('Practice') && !r.includes('ExamTopics'),
    );
    const practiceResources = resources.filter(
      (r) => r.includes('Practice') || r.includes('ExamTopics') || r.includes('Cheat Sheets'),
    );

    return [
      {
        name: 'Phase 1: Learning',
        description:
          'Work through the exam guide and any included course(s). '
          + 'Take notes on service trade-offs and "when to use X vs Y" scenarios — '
          + 'these are the backbone of scenario-based exam questions. '
          + 'Review the Well-Architected Framework if included.',
        weekNumbers: buildWeekRange(1, learningEnd),
        resourceTitles: learningResources,
        focusTopicSlugs: [...ALL_TOPIC_SLUGS],
      },
      {
        name: 'Phase 2: Practice & Review',
        description:
          'Use cheat sheets to consolidate service comparisons. '
          + 'Work through all practice exams in Review Mode, reading every explanation. '
          + 'Re-study any topic where you score below 70%.',
        weekNumbers: buildWeekRange(simStart, weeks),
        resourceTitles: practiceResources.length > 0 ? practiceResources : [...resources],
        focusTopicSlugs: [...EXAM_FOCUS_TOPICS],
      },
    ];
  }

  // ── 6-8 weeks: 3 phases ────────────────────────────────────────────────────
  if (weeks <= 8) {
    const p2End = Math.floor(weeks * 0.7);
    const p3Start = p2End + 1;

    const orientationResources = resources.filter(
      (r) => r.includes('Exam Guide') || r.includes('Well-Architected') || r.includes('Skill Builder'),
    );
    const courseResources = resources.filter(
      (r) =>
        r.includes('Course') ||
        r.includes('Whitepaper') ||
        r.includes('User Guide') ||
        r.includes('Best Practices') ||
        r.includes('Developer Guide') ||
        r.includes('Routing Policies') ||
        r.includes('Storage Classes') ||
        r.includes('Documentation') ||
        r.includes('Architecture Center') ||
        r.includes('re:Invent') ||
        r.includes('Bedrock') ||
        r.includes('Lattice'),
    );
    const reviewResources = resources.filter(
      (r) => r.includes('Practice') || r.includes('Cheat Sheets') || r.includes('ExamTopics'),
    );

    return [
      {
        name: 'Phase 1: Orientation',
        description:
          'Read the exam guide and any orientation resources. '
          + 'Map every task statement to a domain and note unfamiliar services '
          + 'as your personal study focus list.',
        weekNumbers: [1],
        resourceTitles: orientationResources.length > 0 ? orientationResources : [resources[0]!],
        focusTopicSlugs: [...ALL_TOPIC_SLUGS],
      },
      {
        name: 'Phase 2: Core Learning',
        description:
          'Work through the main course(s) and interleave any service-specific documentation. '
          + 'Focus on understanding when to use each service and the relevant architectural trade-offs.',
        weekNumbers: buildWeekRange(2, p2End),
        resourceTitles:
          courseResources.length > 0 ? courseResources : resources.filter((r) => !r.includes('Exam Guide')),
        focusTopicSlugs: [...ALL_TOPIC_SLUGS],
      },
      {
        name: 'Phase 3: Review & Exam Simulation',
        description:
          'Use cheat sheets for comparison tables and service pairs you keep confusing. '
          + 'Then work through all practice exams. '
          + 'After each exam, revisit the relevant course section for any topic below 70%.',
        weekNumbers: buildWeekRange(p3Start, weeks),
        resourceTitles: reviewResources.length > 0 ? reviewResources : [resources[resources.length - 1]!],
        focusTopicSlugs: [...EXAM_FOCUS_TOPICS],
      },
    ];
  }

  // ── 10-12 weeks: 4 phases ──────────────────────────────────────────────────
  const p2End = Math.ceil(weeks * 0.45);
  const p3End = Math.ceil(weeks * 0.75);
  const p4Start = p3End + 1;

  const orientationResources = resources.filter(
    (r) => r.includes('Exam Guide') || r.includes('Well-Architected') || r.includes('Skill Builder'),
  );
  const resilienceResources = resources.filter(
    (r) =>
      r.includes('Course') ||
      r.includes('Whitepaper') ||
      r.includes('User Guide') ||
      r.includes('Routing Policies') ||
      r.includes('Documentation') ||
      r.includes('Lattice') ||
      r.includes('re:Invent') ||
      r.includes('Architecture Center'),
  );
  const securityCostResources = resources.filter(
    (r) =>
      r.includes('Best Practices') ||
      r.includes('Developer Guide') ||
      r.includes('Storage Classes') ||
      r.includes('Bedrock'),
  );
  const simResources = resources.filter(
    (r) => r.includes('Practice') || r.includes('Cheat Sheets') || r.includes('ExamTopics'),
  );

  return [
    {
      name: 'Phase 1: Orientation',
      description:
        'Read the exam guide in full and map every domain task statement. '
        + 'Skim any orientation resources to build a high-level service mental model.',
      weekNumbers: [1],
      resourceTitles: orientationResources.length > 0 ? orientationResources : [resources[0]!],
      focusTopicSlugs: [...ALL_TOPIC_SLUGS],
    },
    {
      name: 'Phase 2: Resilient & High-Performing Architectures',
      description:
        'Cover Domains 1 and 2 (resilience, performance). '
        + 'Work through the main course at a measured pace, interleaving any service docs. '
        + 'Focus on multi-tier patterns, DR strategies, compute scaling, and networking.',
      weekNumbers: buildWeekRange(2, p2End),
      resourceTitles:
        resilienceResources.length > 0
          ? resilienceResources
          : resources.slice(1, Math.ceil(resources.length * 0.6)),
      focusTopicSlugs: [...RESILIENCE_TOPICS],
    },
    {
      name: 'Phase 3: Secure & Cost-Optimized Architectures',
      description:
        'Cover Domains 3 and 4 (security, cost). '
        + 'Study IAM evaluation logic, encryption hierarchies, and cost-optimization levers. '
        + 'Read any security and cost-focused service docs.',
      weekNumbers: buildWeekRange(p2End + 1, p3End),
      resourceTitles:
        securityCostResources.length > 0 ? securityCostResources : resilienceResources,
      focusTopicSlugs: [...SECURITY_COST_TOPICS],
    },
    {
      name: 'Phase 4: Consolidation & Exam Simulation',
      description:
        'Review cheat sheets for comparison tables and service pairs. '
        + 'Work through all practice exams in Review Mode. '
        + 'Aim for a consistent 80%+ before booking the real exam.',
      weekNumbers: buildWeekRange(p4Start, weeks),
      resourceTitles: simResources.length > 0 ? simResources : [resources[resources.length - 1]!],
      focusTopicSlugs: [...EXAM_FOCUS_TOPICS],
    },
  ];
}

function buildCustomVariantPlan(weeks: number, hoursPerDay: number): SeedStudyPlan {
  const totalHours = weeks * 7 * hoursPerDay;
  const tier = getTier(totalHours);

  const weekLabel = weeks === 1 ? '1 week' : `${weeks} weeks`;
  const hourLabel = hoursPerDay === 1 ? '1 h/day' : `${hoursPerDay} h/day`;

  return {
    slug: `saa-c03-${weeks}w-${hoursPerDay}h`,
    name: `${weekLabel} · ${hourLabel} · ${tier.label}`,
    tagline: tier.tagline,
    description:
      `${totalHours}-hour plan spread over ${weekLabel} at ${hourLabel}. `
      + tier.tagline,
    totalHours,
    recommendedDailyHours: hoursPerDay,
    recommendedWeeks: weeks,
    targetAudience: tier.targetAudience,
    resourceTitles: [...tier.resources],
    phases: buildPhases(weeks, tier.resources),
  };
}

const CUSTOM_VARIANT_WEEKS = [1, 2, 3, 4, 6, 8, 10, 12] as const;
const CUSTOM_VARIANT_HOURS = [2, 3, 4, 5, 6, 7, 8] as const;

const CUSTOM_PLAN_VARIANTS: SeedStudyPlan[] = CUSTOM_VARIANT_WEEKS.flatMap((weeks) =>
  CUSTOM_VARIANT_HOURS.map((hours) => buildCustomVariantPlan(weeks, hours)),
);

// ─── Export ───────────────────────────────────────────────────────────────────

export const SAA_STUDY_PLANS: SeedStudyPlan[] = [
  PLAN_80H,
  PLAN_120H,
  PLAN_160H,
  ...CUSTOM_PLAN_VARIANTS,
];
