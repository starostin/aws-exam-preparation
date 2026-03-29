import type { StudyResourceLevel, StudyResourceType } from './saa-c03-materials';

/**
 * AWS Well-Architected Framework pillar data for SAA-C03.
 *
 * Each section maps to one SAA-C03 topic and carries the URL + title of the
 * specific pillar document most relevant to that topic.
 *
 * Design rules (mirrors saa-c03-tutorials-dojo.ts conventions):
 *  - Each section has its own `title` and `url` because different topics map
 *    to different pillars (and therefore different pillar documents).
 *  - `topicSlug` is the PRIMARY topic the section covers.
 *  - multi-tier-fault-tolerant-architecture is intentionally absent —
 *    the "AWS Well-Architected Reliability Pillar" entry in
 *    saa-c03-materials.ts already covers it with the same URL.
 *  - `totalMinutes` = sum of all section estimatedMinutes.
 */

export interface WafSection {
  /** Kebab-case identifier for this section */
  slug: string;
  /** Pillar document title shown to the user */
  title: string;
  /** Topic-specific description explaining the pillar angle for this topic */
  description: string;
  /** Direct URL to the specific pillar document */
  url: string;
  /** Approximate read time in minutes */
  estimatedMinutes: number;
  /** Primary topic slug this section covers */
  topicSlug: string;
  tags: string[];
}

export interface WafCollection {
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
  sections: WafSection[];
}

// ─── AWS Well-Architected Framework — SAA-C03 ────────────────────────────────

export const WELL_ARCHITECTED_SAA: WafCollection = {
  slug: 'aws-well-architected-saa-c03',
  resourceTitle: 'AWS Well-Architected Framework',
  provider: 'AWS Documentation',
  isFree: true,
  type: 'docs',
  priority: 2,
  level: 'intermediate',
  totalMinutes: 650,
  sections: [
    // ── Reliability Pillar ───────────────────────────────────────────────────
    {
      slug: 'reliability-disaster-recovery-and-backup',
      title: 'Reliability Pillar',
      description: 'Reliability pillar guidance on fault isolation, automatic recovery, and workload architecture for resilient disaster recovery strategies.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'disaster-recovery-and-backup',
      tags: ['NICE-TO-HAVE', 'well-architected', 'reliability'],
    },

    // ── Security Pillar ──────────────────────────────────────────────────────
    {
      slug: 'security-identity-access-and-governance',
      title: 'Security Pillar',
      description: 'Security pillar covering identity, access management, detection controls, and account governance principles.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'identity-access-and-governance',
      tags: ['NICE-TO-HAVE', 'well-architected', 'security'],
    },
    {
      slug: 'security-data-protection-and-key-management',
      title: 'Security Pillar',
      description: 'Security pillar guidance on protecting data at rest and in transit, encryption strategies, and key management.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'data-protection-and-key-management',
      tags: ['NICE-TO-HAVE', 'well-architected', 'security'],
    },
    {
      slug: 'security-network-security-controls',
      title: 'Security Pillar',
      description: 'Security pillar covering network protection, traffic segmentation, and infrastructure security controls.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'network-security-controls',
      tags: ['NICE-TO-HAVE', 'well-architected', 'security'],
    },

    // ── Performance Efficiency Pillar ────────────────────────────────────────
    {
      slug: 'performance-compute-selection-and-scaling',
      title: 'Performance Efficiency Pillar',
      description: 'Performance efficiency pillar on compute selection, right-sizing, and scaling strategies for high-performing workloads.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'compute-selection-and-scaling',
      tags: ['NICE-TO-HAVE', 'well-architected', 'performance'],
    },
    {
      slug: 'performance-storage-performance-patterns',
      title: 'Performance Efficiency Pillar',
      description: 'Performance efficiency pillar on storage selection and trade-offs for throughput, latency, and access patterns.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'storage-performance-patterns',
      tags: ['NICE-TO-HAVE', 'well-architected', 'performance'],
    },
    {
      slug: 'performance-database-performance-and-caching',
      title: 'Performance Efficiency Pillar',
      description: 'Performance efficiency pillar on database selection, caching layers, and query optimization strategies.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'database-performance-and-caching',
      tags: ['NICE-TO-HAVE', 'well-architected', 'performance'],
    },
    {
      slug: 'performance-network-performance-and-hybrid',
      title: 'Performance Efficiency Pillar',
      description: 'Performance efficiency pillar on network architecture, proximity, and hybrid connectivity for low-latency workloads.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'network-performance-and-hybrid',
      tags: ['NICE-TO-HAVE', 'well-architected', 'performance'],
    },

    // ── Cost Optimization Pillar ─────────────────────────────────────────────
    {
      slug: 'cost-cost-aware-architecture-decisions',
      title: 'Cost Optimization Pillar',
      description: 'Cost optimization pillar on architecture-level trade-offs, expenditure awareness, and total cost of ownership analysis.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'cost-aware-architecture-decisions',
      tags: ['NICE-TO-HAVE', 'well-architected', 'cost'],
    },
    {
      slug: 'cost-compute-cost-optimization',
      title: 'Cost Optimization Pillar',
      description: 'Cost optimization pillar on compute purchasing models, right-sizing, and serverless economics.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'compute-cost-optimization',
      tags: ['NICE-TO-HAVE', 'well-architected', 'cost'],
    },
    {
      slug: 'cost-storage-and-data-transfer-optimization',
      title: 'Cost Optimization Pillar',
      description: 'Cost optimization pillar on storage lifecycle, data transfer reduction, and architecture-level traffic control.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'storage-and-data-transfer-optimization',
      tags: ['NICE-TO-HAVE', 'well-architected', 'cost'],
    },
    {
      slug: 'cost-cost-visibility-and-governance',
      title: 'Cost Optimization Pillar',
      description: 'Cost optimization pillar on expenditure governance, tagging strategies, budgets, and financial management.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'cost-visibility-and-governance',
      tags: ['NICE-TO-HAVE', 'well-architected', 'cost'],
    },

    // ── Operational Excellence Pillar ────────────────────────────────────────
    {
      slug: 'opex-monitoring-detection-and-response',
      title: 'Operational Excellence Pillar',
      description: 'Operational excellence pillar on monitoring, alerting, observability, and incident response process design.',
      url: 'https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html',
      estimatedMinutes: 50,
      topicSlug: 'monitoring-detection-and-response',
      tags: ['NICE-TO-HAVE', 'well-architected', 'operational-excellence'],
    },
  ],
};

/** All Well-Architected collections, in precedence order (primary first). */
export const WAF_CATALOG: WafCollection[] = [WELL_ARCHITECTED_SAA];
