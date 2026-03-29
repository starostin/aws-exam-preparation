import type { StudyResourceLevel, StudyResourceType } from './saa-c03-materials';

/**
 * Tutorials Dojo cheat-sheet collection for SAA-C03.
 *
 * Design rules (mirrors saa-c03-courses.ts conventions):
 *  - Each section maps to one primary topic and carries its own URL because
 *    Tutorials Dojo publishes a separate cheat-sheet page per service.
 *  - Shared metadata (provider, type, priority, level, isFree) lives on the
 *    collection and is injected by the seed when building SeedResource objects.
 *  - `totalMinutes` = sum of all section estimatedMinutes.
 */

export interface TdSection {
  /** Kebab-case identifier for this section */
  slug: string;
  /** Human-readable cheat-sheet title shown to the user */
  title: string;
  /** Short description of what the cheat sheet covers */
  description: string;
  /** Direct URL to the specific Tutorials Dojo cheat-sheet page */
  url: string;
  /** Approximate read time in minutes */
  estimatedMinutes: number;
  /** Primary topic slug this section covers */
  topicSlug: string;
  tags: string[];
}

export interface TdCollection {
  /** Kebab-case identifier for this collection */
  slug: string;
  /**
   * Must exactly match `external_resources.title` in the DB so the service
   * can resolve study-plan resource references by title.
   */
  resourceTitle: string;
  provider: string;
  isFree: boolean;
  type: StudyResourceType;
  priority: number;
  level: StudyResourceLevel;
  /** Sum of all section estimatedMinutes */
  totalMinutes: number;
  sections: TdSection[];
}

// ─── Tutorials Dojo — SAA-C03 Cheat Sheets ───────────────────────────────────

export const TUTORIALS_DOJO_SAA: TdCollection = {
  slug: 'tutorials-dojo-saa-c03',
  resourceTitle: 'Tutorials Dojo AWS Cheat Sheets',
  provider: 'Tutorials Dojo',
  isFree: true,
  type: 'docs',
  priority: 2,
  level: 'mixed',
  totalMinutes: 370,
  sections: [
    {
      slug: 'aws-cheat-sheets-overview',
      title: 'AWS Cheat Sheets Overview',
      description: 'AWS cheat sheets overview — high-level comparison tables for all major services. Perfect for last-week review.',
      url: 'https://tutorialsdojo.com/aws-cheat-sheets/',
      estimatedMinutes: 30,
      topicSlug: 'intro-general',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'comparisons'],
    },
    {
      slug: 'elastic-load-balancing',
      title: 'Elastic Load Balancing',
      description: 'ELB cheat sheet covering ALB, NLB, and CLB routing behaviour, target groups, and sticky sessions for multi-tier HA designs.',
      url: 'https://tutorialsdojo.com/aws-elastic-load-balancing-elb/',
      estimatedMinutes: 20,
      topicSlug: 'multi-tier-fault-tolerant-architecture',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'load-balancing'],
    },
    {
      slug: 'aws-backup',
      title: 'AWS Backup',
      description: 'AWS Backup cheat sheet covering backup plans, vaults, cross-region and cross-account copy, and retention policies.',
      url: 'https://tutorialsdojo.com/aws-backup/',
      estimatedMinutes: 20,
      topicSlug: 'disaster-recovery-and-backup',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'backup'],
    },
    {
      slug: 'amazon-sqs',
      title: 'Amazon SQS',
      description: 'SQS cheat sheet covering Standard vs FIFO, visibility timeout, DLQ, and long polling for decoupled messaging patterns.',
      url: 'https://tutorialsdojo.com/amazon-sqs/',
      estimatedMinutes: 20,
      topicSlug: 'event-driven-and-messaging',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'messaging'],
    },
    {
      slug: 'amazon-cloudfront',
      title: 'Amazon CloudFront',
      description: 'CloudFront cheat sheet covering distributions, origins, caching behaviours, signed URLs, and Lambda@Edge.',
      url: 'https://tutorialsdojo.com/amazon-cloudfront/',
      estimatedMinutes: 20,
      topicSlug: 'edge-and-global-routing',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'cdn'],
    },
    {
      slug: 'amazon-ec2',
      title: 'Amazon EC2',
      description: 'EC2 cheat sheet covering instance types, purchasing models, placement groups, AMIs, and Auto Scaling integration.',
      url: 'https://tutorialsdojo.com/amazon-ec2/',
      estimatedMinutes: 20,
      topicSlug: 'compute-selection-and-scaling',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'compute'],
    },
    {
      slug: 'amazon-s3',
      title: 'Amazon S3',
      description: 'Amazon S3 cheat sheet covering storage classes, versioning, lifecycle rules, replication, and access control.',
      url: 'https://tutorialsdojo.com/amazon-s3/',
      estimatedMinutes: 20,
      topicSlug: 'storage-performance-patterns',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'storage'],
    },
    {
      slug: 'amazon-elasticache',
      title: 'Amazon ElastiCache',
      description: 'ElastiCache cheat sheet covering Redis vs Memcached trade-offs, cluster modes, replication, and use cases.',
      url: 'https://tutorialsdojo.com/amazon-elasticache/',
      estimatedMinutes: 20,
      topicSlug: 'database-performance-and-caching',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'caching'],
    },
    {
      slug: 'amazon-vpc',
      title: 'Amazon VPC',
      description: 'Amazon VPC cheat sheet covering subnets, route tables, NAT, security groups, NACLs, endpoints, and peering.',
      url: 'https://tutorialsdojo.com/amazon-vpc/',
      estimatedMinutes: 20,
      topicSlug: 'network-performance-and-hybrid',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'networking'],
    },
    {
      slug: 'aws-iam',
      title: 'AWS IAM',
      description: 'IAM cheat sheet covering users, roles, policies, permission boundaries, SCP, and identity federation patterns.',
      url: 'https://tutorialsdojo.com/aws-identity-and-access-management-iam/',
      estimatedMinutes: 20,
      topicSlug: 'identity-access-and-governance',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'iam'],
    },
    {
      slug: 'aws-kms',
      title: 'AWS KMS',
      description: 'AWS KMS cheat sheet covering CMKs, key policies, envelope encryption, grants, and cross-account usage.',
      url: 'https://tutorialsdojo.com/aws-key-management-service-aws-kms/',
      estimatedMinutes: 20,
      topicSlug: 'data-protection-and-key-management',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'kms'],
    },
    {
      slug: 'aws-shield',
      title: 'AWS Shield',
      description: 'AWS Shield cheat sheet covering Standard vs Advanced, WAF integration, DDoS protection, and threat landscape.',
      url: 'https://tutorialsdojo.com/aws-shield/',
      estimatedMinutes: 20,
      topicSlug: 'network-security-controls',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'network-security'],
    },
    {
      slug: 'amazon-cloudwatch',
      title: 'Amazon CloudWatch',
      description: 'CloudWatch cheat sheet covering metrics, logs, alarms, dashboards, events, and integration with GuardDuty and CloudTrail.',
      url: 'https://tutorialsdojo.com/amazon-cloudwatch/',
      estimatedMinutes: 20,
      topicSlug: 'monitoring-detection-and-response',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'monitoring'],
    },
    {
      slug: 'well-architected-framework',
      title: 'Well-Architected Framework',
      description: 'Well-Architected Framework cheat sheet covering the 6 pillars and design principles for cost-aware architecture decisions.',
      url: 'https://tutorialsdojo.com/aws-well-architected-framework/',
      estimatedMinutes: 20,
      topicSlug: 'cost-aware-architecture-decisions',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'architecture'],
    },
    {
      slug: 'aws-savings-plans',
      title: 'AWS Savings Plans',
      description: 'AWS Savings Plans cheat sheet covering Compute, EC2 Instance, and SageMaker plans, commitments, and flexibility.',
      url: 'https://tutorialsdojo.com/aws-savings-plans/',
      estimatedMinutes: 20,
      topicSlug: 'compute-cost-optimization',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'cost-optimization'],
    },
    {
      slug: 's3-storage-classes',
      title: 'S3 Storage Classes',
      description: 'S3 Storage Classes cheat sheet covering Standard, IA, Glacier tiers, lifecycle transitions, and cost trade-offs.',
      url: 'https://tutorialsdojo.com/amazon-s3-storage-classes/',
      estimatedMinutes: 20,
      topicSlug: 'storage-and-data-transfer-optimization',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'storage-cost'],
    },
    {
      slug: 'aws-cost-explorer',
      title: 'AWS Cost Explorer',
      description: 'AWS Cost Explorer cheat sheet covering cost analysis, filtering, forecasting, and rightsizing recommendations.',
      url: 'https://tutorialsdojo.com/aws-cost-explorer/',
      estimatedMinutes: 20,
      topicSlug: 'cost-visibility-and-governance',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'cost-governance'],
    },
    {
      slug: 'amazon-sagemaker',
      title: 'Amazon SageMaker',
      description: 'SageMaker cheat sheet covering training, hosting, endpoints, pipelines, and integration with Bedrock and AI services.',
      url: 'https://tutorialsdojo.com/amazon-sagemaker/',
      estimatedMinutes: 20,
      topicSlug: 'machine-learning-and-ai-services',
      tags: ['NICE-TO-HAVE', 'cheat-sheets', 'ml'],
    },
  ],
};

/** All supported Tutorials Dojo collections, in precedence order (primary first). */
export const TD_CATALOG: TdCollection[] = [TUTORIALS_DOJO_SAA];
