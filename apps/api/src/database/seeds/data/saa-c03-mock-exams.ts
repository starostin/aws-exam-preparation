import type { QuizDifficulty, SeedQuizOption } from './saa-c03-quizzes';

export interface SeedMockExam {
  slug: string;
  title: string;
  durationMinutes: number;
  totalQuestions: number;
}

export interface SeedMockExamQuestion {
  examSlug: string;
  topicSlug: string;
  text: string;
  options: SeedQuizOption[];
  explanation: string;
  difficulty: QuizDifficulty;
}

interface ScenarioTemplate {
  topicSlug: string;
  difficulty: QuizDifficulty;
  stem: string;
  correct: string;
  distractors: [string, string, string];
  rationale: string;
}

const EXAM_QUESTION_COUNT = 60;
const OPTION_IDS = ['a', 'b', 'c', 'd'] as const;

const ORGS = [
  'media streaming company',
  'fintech startup',
  'healthcare platform',
  'global ecommerce company',
  'logistics provider',
  'SaaS vendor',
  'gaming company',
  'public sector agency',
  'telemetry analytics team',
  'retail marketplace',
];

const WORKLOADS = [
  'a customer-facing API',
  'batch image processing',
  'an event-driven order pipeline',
  'real-time recommendation service',
  'a multi-region web application',
  'compliance reporting jobs',
  'session-heavy web traffic',
  'hybrid on-premises integration',
  'long-term log archival',
  'cross-account automation',
];

const CONSTRAINTS = [
  'the lowest operational overhead',
  'near-zero downtime during AZ failures',
  'strict least-privilege access controls',
  'predictable performance under spikes',
  'the most cost-effective long-term design',
  'secure encryption and key separation',
  'independent retries between services',
  'faster global response times',
  'auditable security detections',
  'minimal data-loss objectives',
];

const PRIORITIES = [
  'MOST cost-effective',
  'MOST operationally efficient',
  'MOST resilient',
  'MOST secure',
  'BEST-performing',
  'BEST fit for the requirement',
];

const SCENARIOS: ScenarioTemplate[] = [
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'medium',
    stem: 'An {org} runs {workload}. The system must stay online if one AZ fails and the team wants {constraint}. Which architecture is the {priority} choice?',
    correct: 'Deploy an Application Load Balancer with targets in at least two AZs and run stateless app instances across both AZs',
    distractors: [
      'Use a single large EC2 instance with Auto Recovery enabled',
      'Run all instances in one AZ and rely on EBS snapshots',
      'Use only Route 53 simple routing with one origin',
    ],
    rationale: 'Multi-AZ app tiers behind ALB are the baseline pattern for AZ-level high availability.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'hard',
    stem: 'A {org} operates {workload} and requires {constraint} across regions. Which DR strategy is the {priority} option for near-immediate recovery?',
    correct: 'Use an active/active multi-region deployment with traffic steering and continuous data replication',
    distractors: [
      'Use weekly backups and restore in a second region during incidents',
      'Use pilot light with database only and provision all app tiers after disaster',
      'Use a single-region Multi-AZ setup as cross-region DR',
    ],
    rationale: 'Active/active provides the lowest practical RTO/RPO at the highest cost and complexity.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    difficulty: 'medium',
    stem: 'A {org} needs to fan out events from {workload} to multiple consumers with independent retries and failure isolation. Which is the {priority} design?',
    correct: 'Publish to an SNS topic and subscribe one SQS queue per consumer service',
    distractors: [
      'Send events directly from producer to each consumer over synchronous HTTP',
      'Use one shared SQS queue for all consumers',
      'Store all events in CloudWatch Logs and poll from consumers',
    ],
    rationale: 'SNS plus dedicated SQS queues provides fan-out and independent back-pressure handling.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    difficulty: 'medium',
    stem: 'A {org} serves {workload} globally and wants {constraint}. Which service is the {priority} fit?',
    correct: 'Use AWS Global Accelerator with regional endpoints and health checks',
    distractors: [
      'Use a single-region ALB and increase instance size',
      'Use Route 53 simple routing only',
      'Use CloudTrail Lake to optimize request latency',
    ],
    rationale: 'Global Accelerator improves pathing and failover using Anycast and AWS global backbone routing.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    difficulty: 'hard',
    stem: 'A {org} has {workload} with unpredictable spikes and per-job runtime between seconds and several minutes. They need {constraint}. Which solution is the {priority}?',
    correct: 'Use SQS with ECS/Fargate workers that scale on queue depth',
    distractors: [
      'Use a permanently overprovisioned EC2 Auto Scaling group with fixed desired count',
      'Use CloudFront Functions for background processing',
      'Use one Lambda function with no queue buffering for all traffic bursts',
    ],
    rationale: 'Queue-based Fargate workers balance elasticity, reliability, and operational simplicity for bursty async jobs.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    difficulty: 'medium',
    stem: 'A {org} needs shared POSIX-compliant file storage for Linux instances in multiple AZs for {workload}. Which option is the {priority}?',
    correct: 'Use Amazon EFS mounted by instances across AZs',
    distractors: [
      'Use Amazon S3 Standard as a drop-in POSIX file system',
      'Attach one EBS volume to all instances simultaneously',
      'Use DynamoDB for shared file system semantics',
    ],
    rationale: 'EFS is managed, elastic, and multi-AZ for shared NFS workloads.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'medium',
    stem: 'A {org} observes repeated reads of hot keys in {workload}. They need {constraint}. Which architecture is the {priority}?',
    correct: 'Place ElastiCache Redis in front of the primary datastore for hot read caching',
    distractors: [
      'Increase only database storage capacity',
      'Store sessions in instance local disk',
      'Move all hot reads to CloudTrail Insights',
    ],
    rationale: 'Redis reduces read latency and offloads repetitive database access.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'medium',
    stem: 'A {org} requires private connectivity between on-premises and AWS for {workload} with {constraint}. Which is the {priority} option?',
    correct: 'Use AWS Direct Connect with appropriate redundancy',
    distractors: [
      'Use internet-only TLS endpoints for all hybrid traffic',
      'Use NAT Gateway as the primary hybrid connection method',
      'Use S3 Transfer Acceleration for database replication',
    ],
    rationale: 'Direct Connect provides private and predictable network characteristics for hybrid workloads.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'easy',
    stem: 'A {org} must enforce least privilege for {workload} and wants {constraint}. Which IAM approach is the {priority}?',
    correct: 'Grant scoped IAM permissions to roles using only required actions and resources',
    distractors: [
      'Attach AdministratorAccess to all service roles',
      'Use root credentials for operational scripts',
      'Avoid policy conditions for easier management',
    ],
    rationale: 'Least privilege is achieved by minimizing actions, resources, and conditions to exact needs.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    difficulty: 'hard',
    stem: 'A {org} needs encryption for data at rest and in transit for {workload}, plus key separation between environments. Which is the {priority} design?',
    correct: 'Use AWS KMS CMKs per environment, enforce TLS, and restrict key usage with IAM/key policies',
    distractors: [
      'Use one shared account-wide key for all environments and teams',
      'Encrypt only backups and leave primary storage unencrypted',
      'Rely on application obfuscation instead of KMS-managed encryption',
    ],
    rationale: 'Per-environment keys and strict policies enforce separation and auditable cryptographic controls.',
  },
  {
    topicSlug: 'network-security-controls',
    difficulty: 'medium',
    stem: 'A {org} must protect public HTTP endpoints in {workload} from common web exploits while keeping overhead low. Which service is the {priority}?',
    correct: 'Use AWS WAF with managed rule groups on ALB or CloudFront',
    distractors: [
      'Use only security groups for SQL injection protection',
      'Use only NACLs for application-layer filtering',
      'Use CloudWatch alarms as a request firewall',
    ],
    rationale: 'WAF provides L7 protections and managed signatures for common attack classes.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    difficulty: 'medium',
    stem: 'A {org} needs managed threat detection across AWS logs for {workload} with {constraint}. Which tool is the {priority}?',
    correct: 'Enable Amazon GuardDuty and integrate findings into incident response workflows',
    distractors: [
      'Use CloudFormation drift detection as a threat engine',
      'Use only AWS Config without threat analytics',
      'Use Systems Manager Patch Manager for runtime intrusion detection',
    ],
    rationale: 'GuardDuty analyzes telemetry sources to identify suspicious activity and compromise patterns.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    difficulty: 'medium',
    stem: 'A {org} is redesigning {workload} and wants {constraint}. Which decision is generally the {priority}?',
    correct: 'Right-size services and choose managed options that reduce idle capacity and operations overhead',
    distractors: [
      'Use the largest instance families everywhere to avoid future resizing',
      'Force all workloads onto dedicated hosts regardless utilization',
      'Disable autoscaling to simplify architecture diagrams',
    ],
    rationale: 'Cost-aware design balances performance with right sizing and managed elasticity.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    difficulty: 'easy',
    stem: 'A {org} has steady baseline EC2 usage for {workload} over multiple years. Which purchasing option is the {priority}?',
    correct: 'Adopt Savings Plans for baseline usage and combine with On-Demand or Spot as needed',
    distractors: [
      'Use On-Demand only regardless utilization profile',
      'Use Spot for all production components with no fallback',
      'Use Dedicated Hosts by default for all instances',
    ],
    rationale: 'Savings Plans generally provide strong discounts for predictable long-running usage.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    difficulty: 'medium',
    stem: 'A {org} keeps compliance logs for years and rarely accesses data after 90 days. Which lifecycle pattern is the {priority}?',
    correct: 'Transition objects from S3 Standard to archival classes such as S3 Glacier Flexible Retrieval after 90 days',
    distractors: [
      'Keep all objects permanently in S3 Standard',
      'Move logs to EBS volumes attached to admin instances',
      'Store logs in DynamoDB tables for long-term retention',
    ],
    rationale: 'Lifecycle transitions reduce storage cost while retaining durability and retrieval options.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    difficulty: 'easy',
    stem: 'A {org} needs team-level spend accountability for {workload} and {constraint}. Which combo is the {priority}?',
    correct: 'Enforce tagging standards and configure AWS Budgets with alerts by account/project dimensions',
    distractors: [
      'Use CloudTrail only for cost chargeback reports',
      'Rely on monthly invoices without tagging policy',
      'Use Route 53 health checks for spend governance',
    ],
    rationale: 'Tagging plus budgets enables ownership visibility and proactive spend controls.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'easy',
    stem: 'A {org} wants to build and deploy custom models for {workload} with managed infrastructure and {constraint}. Which service is the {priority}?',
    correct: 'Use Amazon SageMaker for model development, training, and deployment',
    distractors: [
      'Use Amazon Route 53 for model hosting workflows',
      'Use AWS Budgets as a model serving platform',
      'Use Amazon S3 static website hosting for training orchestration',
    ],
    rationale: 'SageMaker provides managed ML lifecycle capabilities for custom model workflows.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    difficulty: 'hard',
    stem: 'A {org} requires strict ordering and deduplication for {workload}. Which queue design is the {priority}?',
    correct: 'Use Amazon SQS FIFO with appropriate message group and deduplication strategy',
    distractors: [
      'Use SQS Standard and rely on best-effort ordering',
      'Use SNS topic only without queue consumers',
      'Use CloudWatch Logs subscription filters for ordered processing',
    ],
    rationale: 'FIFO queues provide ordered processing guarantees and deduplication controls.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'medium',
    stem: 'A {org} targets moderate RTO/RPO for {workload} and needs a lower-cost alternative to active/active. Which strategy is the {priority}?',
    correct: 'Use warm standby with scaled-down but running services in a secondary region',
    distractors: [
      'Use backup and restore as the primary low-RTO approach',
      'Use single-region Multi-AZ as cross-region DR',
      'Use daily AMI snapshots without replication testing',
    ],
    rationale: 'Warm standby is a practical middle ground between pilot light and active/active.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'hard',
    stem: 'A {org} runs {workload} and user sessions must survive instance replacement with {constraint}. Which architecture is the {priority}?',
    correct: 'Externalize session state to ElastiCache Redis and keep web instances stateless',
    distractors: [
      'Use sticky sessions only and store session data in instance memory',
      'Persist sessions in instance store volumes',
      'Use hibernation to preserve session state during replacement',
    ],
    rationale: 'External session stores allow any healthy instance to serve requests without session loss.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'hard',
    stem: 'A {org} needs read scaling for {workload} while keeping write consistency on a primary relational DB. Which approach is the {priority}?',
    correct: 'Use read replicas for read-heavy traffic and keep writes directed to the primary instance',
    distractors: [
      'Split writes randomly across replicas and primary',
      'Use snapshots as a read-scaling strategy',
      'Replace relational database with CloudWatch metrics storage',
    ],
    rationale: 'Read replicas scale read throughput while preserving single-writer semantics.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    difficulty: 'easy',
    stem: 'A {org} serves static assets for {workload} worldwide and needs {constraint}. What is the {priority} solution?',
    correct: 'Put Amazon CloudFront in front of the static content origin',
    distractors: [
      'Move all content to one larger regional EC2 instance',
      'Use S3 Transfer Acceleration as a CDN replacement for downloads',
      'Use Route 53 private hosted zones for global edge caching',
    ],
    rationale: 'CloudFront caches content close to users and reduces global latency.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'hard',
    stem: 'A {org} must privately access AWS services from VPC workloads in {workload} without traversing the public internet. Which is the {priority} pattern?',
    correct: 'Use VPC endpoints (Gateway/Interface) for private service connectivity',
    distractors: [
      'Force traffic through internet gateway and rely on TLS only',
      'Use NAT Gateway for all inbound private service access',
      'Use CloudFront origin access controls for database endpoints',
    ],
    rationale: 'VPC endpoints keep traffic within AWS network paths and improve security posture.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    difficulty: 'medium',
    stem: 'A {org} wants centralized security posture visibility and control mapping for {workload}. Which managed service is the {priority} addition?',
    correct: 'Use AWS Security Hub to aggregate findings and benchmark controls',
    distractors: [
      'Use EC2 Auto Scaling notifications as a security posture dashboard',
      'Use only CloudFront access logs for all security controls',
      'Use Route 53 resolver logs as the single source of all security compliance',
    ],
    rationale: 'Security Hub centralizes findings from integrated services and compliance standards.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    difficulty: 'medium',
    stem: 'A {org} stores regulated data for {workload}. They require customer-managed key rotation and auditability. Which setup is the {priority}?',
    correct: 'Use customer-managed KMS keys with rotation and CloudTrail auditing for key usage events',
    distractors: [
      'Use default service keys and disable audit logs to reduce noise',
      'Use one hard-coded application key stored in source control',
      'Rely only on transport encryption and skip encryption at rest',
    ],
    rationale: 'CMKs with rotation and audited key usage align with regulated encryption governance needs.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    difficulty: 'medium',
    stem: 'A {org} has non-critical interruptible workloads in {workload}. Which approach is the {priority} for lowering compute cost?',
    correct: 'Use EC2 Spot for interruptible portions with fallback capacity strategies',
    distractors: [
      'Use only On-Demand instances for all interruptible jobs',
      'Use Dedicated Hosts for all burst workers',
      'Disable autoscaling so jobs wait for fixed capacity',
    ],
    rationale: 'Spot can dramatically reduce cost when workloads are fault-tolerant to interruptions.',
  },
];

export const SAA_MOCK_EXAMS: SeedMockExam[] = [
  {
    slug: 'saa-mock-001',
    title: 'SAA-C03 Mock Exam 1',
    durationMinutes: 130,
    totalQuestions: EXAM_QUESTION_COUNT,
  },
  {
    slug: 'saa-mock-002',
    title: 'SAA-C03 Mock Exam 2',
    durationMinutes: 130,
    totalQuestions: EXAM_QUESTION_COUNT,
  },
  {
    slug: 'saa-final-readiness',
    title: 'SAA-C03 Final Readiness Mock Exam',
    durationMinutes: 130,
    totalQuestions: EXAM_QUESTION_COUNT,
  },
];

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i++) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length]!;
}

function shuffle<T>(items: T[], seed: number): T[] {
  const copy = [...items];
  let s = seed || 1;

  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = tmp;
  }

  return copy;
}

function renderStem(template: string, seed: number): string {
  return template
    .replace('{org}', pick(ORGS, seed + 11))
    .replace('{workload}', pick(WORKLOADS, seed + 23))
    .replace('{constraint}', pick(CONSTRAINTS, seed + 37))
    .replace('{priority}', pick(PRIORITIES, seed + 41));
}

function buildOptions(correct: string, distractors: [string, string, string], seed: number): SeedQuizOption[] {
  const shuffled = shuffle(
    [
      { text: correct, isCorrect: true },
      { text: distractors[0], isCorrect: false },
      { text: distractors[1], isCorrect: false },
      { text: distractors[2], isCorrect: false },
    ],
    seed,
  );

  return shuffled.map((option, index) => ({
    id: OPTION_IDS[index]!,
    text: option.text,
    isCorrect: option.isCorrect,
  }));
}

function buildExamQuestions(examSlug: string, offset: number): SeedMockExamQuestion[] {
  return Array.from({ length: EXAM_QUESTION_COUNT }, (_, index) => {
    const template = SCENARIOS[(index + offset) % SCENARIOS.length]!;
    const seed = hash(`${examSlug}:${index}`);

    return {
      examSlug,
      topicSlug: template.topicSlug,
      difficulty: template.difficulty,
      text: renderStem(template.stem, seed),
      options: buildOptions(template.correct, template.distractors, seed),
      explanation: `${template.rationale} This is commonly favored in AWS exam-style scenarios where trade-offs are explicit.`,
    };
  });
}

export const SAA_MOCK_EXAM_QUESTIONS: SeedMockExamQuestion[] = [
  ...buildExamQuestions('saa-mock-001', 0),
  ...buildExamQuestions('saa-mock-002', 7),
  ...buildExamQuestions('saa-final-readiness', 13),
];
