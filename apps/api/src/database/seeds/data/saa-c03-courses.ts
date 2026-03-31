/**
 * SAA-C03 Course Curriculum Data
 *
 * Breaks down both main SAA-C03 courses into sections, each mapped to the
 * primary topic slug it covers. This data is consumed by the study-plans
 * service to build a topic-driven daily schedule: every day the user sees
 * which topic they are studying, what course section to watch, and their
 * quiz + flashcard tasks for that topic.
 *
 * Design rules:
 *  - `topicSlugs[0]` is the PRIMARY topic (used for scheduling).
 *  - Additional slugs are secondary coverage (informational only, not
 *    used to create duplicate tasks).
 *  - Empty `topicSlugs` = intro / supplementary section (no topic
 *    assignment; scheduled last with topicId = null).
 *  - `resourceTitle` must EXACTLY match the `external_resources.title`
 *    value in the DB so the service can join to the DB row.
 *  - Minute estimates are approximate, calibrated to the real course lengths
 *    (~75 h for Cantrill, ~27 h for Maarek).
 */

export interface CourseSection {
  /** Kebab-case identifier for this section */
  slug: string;
  /** Human-readable section title shown to the user */
  title: string;
  /** Approximate watch / study time for this section in minutes */
  estimatedMinutes: number;
  /**
   * Topic slugs covered by this section.
   * Index 0 = primary topic used for scheduling.
   * Additional entries are informational secondary topics.
   * Empty array = no topic (intro / supplementary content).
   */
  topicSlugs: string[];
}

export interface SaaCourse {
  /** Kebab-case identifier for this course */
  slug: string;
  /**
   * Must exactly match `external_resources.title` in the DB so the
   * service can look up the corresponding resource row by title.
   */
  resourceTitle: string;
  provider: string;
  url: string;
  isFree: boolean;
  /** Sum of all section estimatedMinutes */
  totalMinutes: number;
  sections: CourseSection[];
}

// ─── Adrian Cantrill — SAA-C03 (~75 h) ──────────────────────────────────────

export const CANTRILL_SAA_COURSE: SaaCourse = {
  slug: 'cantrill-saa-c03',
  resourceTitle: 'SAA-C03 Course by Adrian Cantrill',
  provider: 'Cantrill.io',
  url: 'https://learn.cantrill.io/p/aws-certified-solutions-architect-associate-saa-c03',
  isFree: false,
  totalMinutes: 4545,
  sections: [
    {
      slug: 'intro-cloud-fundamentals',
      title: 'Introduction & Cloud Fundamentals',
      estimatedMinutes: 45,
      topicSlugs: ['intro-general'],
    },
    {
      slug: 'aws-accounts',
      title: 'AWS Accounts',
      estimatedMinutes: 60,
      topicSlugs: ['identity-access-and-governance'],
    },
    {
      slug: 'iam-accounts-organizations',
      title: 'IAM, Accounts & AWS Organizations',
      estimatedMinutes: 270,
      topicSlugs: ['identity-access-and-governance'],
    },
    {
      slug: 'simple-storage-service',
      title: 'Simple Storage Service (S3)',
      estimatedMinutes: 420,
      topicSlugs: ['storage-performance-patterns', 'storage-and-data-transfer-optimization'],
    },
    {
      slug: 'vpc-basics',
      title: 'Virtual Private Cloud (VPC) Basics',
      estimatedMinutes: 240,
      topicSlugs: ['network-security-controls', 'network-performance-and-hybrid'],
    },
    {
      slug: 'ec2-basics',
      title: 'Elastic Compute Cloud (EC2) Basics',
      estimatedMinutes: 300,
      topicSlugs: ['compute-selection-and-scaling', 'compute-cost-optimization'],
    },
    {
      slug: 'containers-ecs',
      title: 'Containers & ECS',
      estimatedMinutes: 180,
      topicSlugs: ['compute-selection-and-scaling'],
    },
    {
      slug: 'advanced-ec2',
      title: 'Advanced EC2',
      estimatedMinutes: 240,
      topicSlugs: ['compute-cost-optimization', 'compute-selection-and-scaling'],
    },
    {
      slug: 'route53-dns',
      title: 'Route 53 — Global DNS',
      estimatedMinutes: 240,
      topicSlugs: ['edge-and-global-routing', 'multi-tier-fault-tolerant-architecture'],
    },
    {
      slug: 'rds',
      title: 'Relational Database Service (RDS)',
      estimatedMinutes: 300,
      topicSlugs: ['database-performance-and-caching', 'multi-tier-fault-tolerant-architecture'],
    },
    {
      slug: 'network-storage-data-lifecycle',
      title: 'Network Storage & Data Lifecycle',
      estimatedMinutes: 180,
      topicSlugs: ['storage-and-data-transfer-optimization', 'storage-performance-patterns'],
    },
    {
      slug: 'ha-and-scaling',
      title: 'High Availability & Scaling',
      estimatedMinutes: 240,
      topicSlugs: ['multi-tier-fault-tolerant-architecture'],
    },
    {
      slug: 'serverless-application-services',
      title: 'Serverless & Application Services',
      estimatedMinutes: 420,
      topicSlugs: [
        'event-driven-and-messaging',
        'compute-selection-and-scaling',
        'database-performance-and-caching',
      ],
    },
    {
      slug: 'cdn-and-optimization',
      title: 'CDN & Optimization',
      estimatedMinutes: 180,
      topicSlugs: ['edge-and-global-routing'],
    },
    {
      slug: 'advanced-vpc-networking',
      title: 'Advanced VPC Networking',
      estimatedMinutes: 180,
      topicSlugs: ['network-performance-and-hybrid'],
    },
    {
      slug: 'hybrid-environments-migration',
      title: 'Hybrid Environments & Migration',
      estimatedMinutes: 300,
      topicSlugs: ['disaster-recovery-and-backup', 'network-performance-and-hybrid'],
    },
    {
      slug: 'security-deployment-operations',
      title: 'Security, Deployment & Operations',
      estimatedMinutes: 240,
      topicSlugs: [
        'monitoring-detection-and-response',
        'data-protection-and-key-management',
        'network-security-controls',
      ],
    },
    {
      slug: 'nosql-dynamodb',
      title: 'NoSQL Databases & DynamoDB',
      estimatedMinutes: 150,
      topicSlugs: ['database-performance-and-caching'],
    },
    {
      slug: 'machine-learning',
      title: 'Machine Learning',
      estimatedMinutes: 60,
      topicSlugs: ['machine-learning-and-ai-services'],
    },
    {
      slug: 'other-services-features',
      title: 'Other Services & Features',
      estimatedMinutes: 120,
      topicSlugs: ['cost-visibility-and-governance', 'cost-aware-architecture-decisions'],
    },
  ],
};

// ─── Stephane Maarek — Ultimate SAA-C03 (~27 h) ─────────────────────────────

export const MAAREK_SAA_COURSE: SaaCourse = {
  slug: 'maarek-saa-c03',
  resourceTitle: 'Ultimate SAA-C03 Course by Stephane Maarek',
  provider: 'Udemy',
  url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
  isFree: false,
  totalMinutes: 1634,
  sections: [
    {
      slug: 'getting-started',
      title: 'Getting Started with AWS',
      estimatedMinutes: 20,
      topicSlugs: ['intro-general'],
    },
    {
      slug: 'iam-cli',
      title: 'IAM & AWS CLI',
      estimatedMinutes: 105,
      topicSlugs: ['identity-access-and-governance'],
    },
    {
      slug: 'ec2-fundamentals',
      title: 'EC2 Fundamentals',
      estimatedMinutes: 85,
      topicSlugs: ['compute-selection-and-scaling'],
    },
    {
      slug: 'ec2-saa-level',
      title: 'EC2 — Solutions Architect Level',
      estimatedMinutes: 130,
      topicSlugs: ['compute-cost-optimization', 'multi-tier-fault-tolerant-architecture', 'compute-selection-and-scaling'],
    },
    {
      slug: 'ec2-instance-storage',
      title: 'EC2 Instance Storage',
      estimatedMinutes: 70,
      topicSlugs: ['storage-performance-patterns'],
    },
    {
      slug: 'elb-asg',
      title: 'High Availability & Scalability: ELB & ASG',
      estimatedMinutes: 120,
      topicSlugs: ['multi-tier-fault-tolerant-architecture'],
    },
    {
      slug: 'rds-aurora-elasticache',
      title: 'RDS + Aurora + ElastiCache',
      estimatedMinutes: 110,
      topicSlugs: ['database-performance-and-caching'],
    },
    {
      slug: 'route53',
      title: 'Route 53',
      estimatedMinutes: 85,
      topicSlugs: ['edge-and-global-routing'],
    },
    {
      slug: 'classic-solutions-architecture',
      title: 'Classic Solutions Architecture Discussions',
      estimatedMinutes: 80,
      topicSlugs: ['cost-aware-architecture-decisions', 'multi-tier-fault-tolerant-architecture'],
    },
    {
      slug: 's3-introduction',
      title: 'Amazon S3 Introduction',
      estimatedMinutes: 55,
      topicSlugs: ['storage-performance-patterns'],
    },
    {
      slug: 's3-advanced',
      title: 'Advanced Amazon S3',
      estimatedMinutes: 65,
      topicSlugs: ['storage-and-data-transfer-optimization', 'storage-performance-patterns'],
    },
    {
      slug: 's3-security',
      title: 'Amazon S3 Security',
      estimatedMinutes: 55,
      topicSlugs: ['data-protection-and-key-management'],
    },
    {
      slug: 'cloudfront-global-accelerator',
      title: 'CloudFront & AWS Global Accelerator',
      estimatedMinutes: 65,
      topicSlugs: ['edge-and-global-routing'],
    },
    {
      slug: 'storage-extras',
      title: 'AWS Storage Extras',
      estimatedMinutes: 50,
      topicSlugs: ['storage-and-data-transfer-optimization'],
    },
    {
      slug: 'integration-messaging',
      title: 'Integration & Messaging: SQS, SNS & Kinesis',
      estimatedMinutes: 90,
      topicSlugs: ['event-driven-and-messaging'],
    },
    {
      slug: 'containers-on-aws',
      title: 'Containers on AWS: ECS, Fargate, ECR & EKS',
      estimatedMinutes: 70,
      topicSlugs: ['compute-selection-and-scaling'],
    },
    {
      slug: 'serverless-lambda',
      title: 'AWS Serverless: Lambda',
      estimatedMinutes: 75,
      topicSlugs: ['event-driven-and-messaging', 'compute-selection-and-scaling'],
    },
    {
      slug: 'serverless-dynamodb',
      title: 'AWS Serverless: DynamoDB',
      estimatedMinutes: 65,
      topicSlugs: ['database-performance-and-caching'],
    },
    {
      slug: 'serverless-api-gateway',
      title: 'AWS Serverless: API Gateway',
      estimatedMinutes: 45,
      topicSlugs: ['event-driven-and-messaging'],
    },
    {
      slug: 'serverless-sam',
      title: 'AWS Serverless: SAM',
      estimatedMinutes: 25,
      topicSlugs: ['compute-selection-and-scaling'],
    },
    {
      slug: 'serverless-cognito',
      title: 'AWS Serverless: Cognito',
      estimatedMinutes: 25,
      topicSlugs: ['identity-access-and-governance'],
    },
    {
      slug: 'databases-in-aws',
      title: 'Databases in AWS',
      estimatedMinutes: 55,
      topicSlugs: ['database-performance-and-caching'],
    },
    {
      slug: 'data-analytics',
      title: 'Data & Analytics',
      estimatedMinutes: 70,
      topicSlugs: ['storage-performance-patterns', 'database-performance-and-caching'],
    },
    {
      slug: 'machine-learning',
      title: 'Machine Learning',
      estimatedMinutes: 40,
      topicSlugs: ['machine-learning-and-ai-services'],
    },
    {
      slug: 'monitoring-audit',
      title: 'Monitoring, Audit & Performance',
      estimatedMinutes: 70,
      topicSlugs: ['monitoring-detection-and-response', 'cost-visibility-and-governance'],
    },
    {
      slug: 'advanced-identity',
      title: 'Advanced Identity in AWS',
      estimatedMinutes: 45,
      topicSlugs: ['identity-access-and-governance'],
    },
    {
      slug: 'security-encryption',
      title: 'Security & Encryption: KMS, SSM, Shield, WAF',
      estimatedMinutes: 90,
      topicSlugs: ['data-protection-and-key-management', 'network-security-controls'],
    },
    {
      slug: 'vpc',
      title: 'Networking — VPC',
      estimatedMinutes: 115,
      topicSlugs: ['network-security-controls', 'network-performance-and-hybrid'],
    },
    {
      slug: 'disaster-recovery-migration',
      title: 'Disaster Recovery & Migrations',
      estimatedMinutes: 70,
      topicSlugs: ['disaster-recovery-and-backup'],
    },
    {
      slug: 'more-solution-architectures',
      title: 'More Solution Architectures',
      estimatedMinutes: 55,
      topicSlugs: ['cost-aware-architecture-decisions', 'multi-tier-fault-tolerant-architecture'],
    },
    {
      slug: 'other-services',
      title: 'Other Services',
      estimatedMinutes: 45,
      topicSlugs: ['cost-visibility-and-governance'],
    },
    {
      slug: 'whitepapers-architectures',
      title: 'WhitePapers & Well-Architected Framework',
      estimatedMinutes: 25,
      topicSlugs: ['intro-general'],
    },
    {
      slug: 'exam-prep',
      title: 'Preparing & Practicing for the Exam',
      estimatedMinutes: 15,
      topicSlugs: ['intro-general'],
    },
  ],
};

/** All supported course curricula, in precedence order (primary first). */
export const COURSE_CATALOG: SaaCourse[] = [CANTRILL_SAA_COURSE, MAAREK_SAA_COURSE];
