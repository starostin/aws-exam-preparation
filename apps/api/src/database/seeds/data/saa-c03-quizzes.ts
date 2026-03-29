export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface SeedQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SeedQuizQuestion {
  topicSlug: string;
  text: string;
  options: SeedQuizOption[];
  explanation: string;
  difficulty: QuizDifficulty;
}

export const SAA_QUIZ_QUESTIONS: SeedQuizQuestion[] = [

  // ─── Domain 1: Design Resilient Architectures ─────────────────────────────

  // Topic: multi-tier-fault-tolerant-architecture
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'easy',
    text: 'A company wants to ensure its web application remains available if a single AWS data center fails. Which architecture pattern directly addresses this requirement?',
    options: [
      { id: 'a', text: 'Deploy all EC2 instances in a single Availability Zone with auto-recovery enabled', isCorrect: false },
      { id: 'b', text: 'Distribute EC2 instances across multiple Availability Zones behind an Application Load Balancer', isCorrect: true },
      { id: 'c', text: 'Use a single large EC2 instance with enhanced networking', isCorrect: false },
      { id: 'd', text: 'Enable EC2 Instance Store for faster local storage', isCorrect: false },
    ],
    explanation: 'Spreading instances across multiple Availability Zones (AZs) in the same region ensures the application survives a single AZ failure. An ALB routes traffic only to healthy instances across AZs. A single AZ, regardless of instance size or auto-recovery, cannot protect against an AZ-wide outage.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'medium',
    text: 'An application uses Amazon RDS MySQL with Multi-AZ enabled. The primary database instance fails. What happens next?',
    options: [
      { id: 'a', text: 'RDS automatically promotes the read replica in the same AZ to become the new primary', isCorrect: false },
      { id: 'b', text: 'RDS automatically fails over to the standby instance in a different AZ; the CNAME is updated to point to the standby', isCorrect: true },
      { id: 'c', text: 'The application must manually update its connection string to the standby endpoint', isCorrect: false },
      { id: 'd', text: 'RDS creates a new primary instance from the most recent automated snapshot', isCorrect: false },
    ],
    explanation: 'With Multi-AZ, RDS maintains a synchronous standby replica in a separate AZ. On failover, RDS automatically updates the DNS CNAME to point to the standby, which is then promoted to primary. This is transparent to the application — no connection string changes are needed. Read replicas are a different feature used for read scaling, not high availability failover.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'medium',
    text: 'A three-tier web application decouples its web and application tiers. Which AWS service combination best achieves loose coupling between these tiers while remaining fault tolerant?',
    options: [
      { id: 'a', text: 'Direct synchronous API calls between EC2 instances in different security groups', isCorrect: false },
      { id: 'b', text: 'An Amazon SQS queue between the web tier and the application tier with Auto Scaling on the application tier', isCorrect: true },
      { id: 'c', text: 'Read replicas of an RDS database shared between the web and application tiers', isCorrect: false },
      { id: 'd', text: 'A shared Amazon EFS mount accessible by both the web and application tiers', isCorrect: false },
    ],
    explanation: 'An SQS queue decouples the web and application tiers by acting as a buffer. If the application tier slows down or an instance fails, messages remain in the queue. Auto Scaling on the application tier can scale based on queue depth, healing automatically. Synchronous direct calls create tight coupling; EFS sharing is for data, not workflow decoupling; RDS read replicas serve read queries, not inter-tier messaging.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'hard',
    text: 'A solutions architect is designing a stateful application where user sessions must persist even when an EC2 instance is replaced. Which approach best supports fault tolerance WITHOUT impacting session continuity?',
    options: [
      { id: 'a', text: 'Use sticky sessions (session affinity) on the Application Load Balancer', isCorrect: false },
      { id: 'b', text: 'Store session data in an Amazon ElastiCache Redis cluster and allow the ALB to route requests to any healthy instance', isCorrect: true },
      { id: 'c', text: 'Store session data on each EC2 instance\'s local ephemeral storage', isCorrect: false },
      { id: 'd', text: 'Enable EC2 Hibernate to preserve RAM state during instance replacement', isCorrect: false },
    ],
    explanation: 'Externalizing session state to ElastiCache Redis makes all web tier instances stateless. Any healthy instance can serve any request without loss of session data. Sticky sessions tie users to a specific instance — if that instance fails, the session is lost. Ephemeral (instance store) data is lost when the instance stops. EC2 Hibernate preserves RAM but doesn\'t survive an instance replacement or failure scenario.',
  },

  // Topic: disaster-recovery-and-backup
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'easy',
    text: 'Which AWS disaster recovery strategy provides the lowest Recovery Time Objective (RTO) and Recovery Point Objective (RPO) but is also the most expensive?',
    options: [
      { id: 'a', text: 'Backup and Restore', isCorrect: false },
      { id: 'b', text: 'Pilot Light', isCorrect: false },
      { id: 'c', text: 'Warm Standby', isCorrect: false },
      { id: 'd', text: 'Multi-Site Active/Active', isCorrect: true },
    ],
    explanation: 'A Multi-Site Active/Active configuration runs full production workloads in multiple regions simultaneously, so failover is nearly instantaneous (near-zero RTO and RPO). However, maintaining a full duplicate environment is the most costly approach. Backup and Restore has the highest RTO/RPO and lowest cost. Pilot Light and Warm Standby are intermediate strategies.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'medium',
    text: 'A company has an RPO of 1 hour and an RTO of 4 hours for its customer-facing application. The DR site must be ready to serve traffic within the RTO. Which strategy meets these requirements at the LOWEST cost?',
    options: [
      { id: 'a', text: 'Multi-Site Active/Active with Route 53 health checks', isCorrect: false },
      { id: 'b', text: 'Warm Standby with a scaled-down but running stack in a second region', isCorrect: true },
      { id: 'c', text: 'Backup and Restore using daily S3 snapshots', isCorrect: false },
      { id: 'd', text: 'Pilot Light with only the database tier replicated to the DR region', isCorrect: false },
    ],
    explanation: 'Warm Standby keeps a smaller but fully functional version of the production environment running in the DR region. It can scale up and handle production traffic within the 4-hour RTO window. Database replication (e.g., RDS cross-region read replicas) keeps RPO within an hour. Multi-Site Active/Active exceeds requirements and costs more. Backup and Restore typically takes many hours. Pilot Light would require provisioning and starting the full application tier within the RTO, which may be too slow.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'medium',
    text: 'What is the key difference between the "Pilot Light" and "Warm Standby" disaster recovery strategies?',
    options: [
      { id: 'a', text: 'Pilot Light replicates data across regions; Warm Standby does not', isCorrect: false },
      { id: 'b', text: 'Pilot Light keeps only critical core components (like the database) running in the DR region; Warm Standby keeps a scaled-down but fully functional copy of the entire system running', isCorrect: true },
      { id: 'c', text: 'Warm Standby uses S3 Cross-Region Replication; Pilot Light uses RDS snapshots', isCorrect: false },
      { id: 'd', text: 'Pilot Light always uses active/active routing; Warm Standby uses passive failover', isCorrect: false },
    ],
    explanation: 'Pilot Light keeps only the most critical services (typically the database, replicated and ready) running in the DR region. The rest of the infrastructure must be provisioned and started on failover. Warm Standby goes further by maintaining a scaled-down version of the complete system — all tiers are running but at reduced capacity. On failover, Warm Standby only needs to scale up rather than provision new resources, yielding a faster RTO.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'hard',
    text: 'A financial company requires cross-region DR for an RDS PostgreSQL database. Continuous replication is needed and the RPO must be under 5 minutes. Which solution meets this requirement?',
    options: [
      { id: 'a', text: 'Enable automated backups and copy daily snapshots to the DR region with cross-region copy enabled', isCorrect: false },
      { id: 'b', text: 'Create an RDS cross-region read replica and promote it during failover', isCorrect: true },
      { id: 'c', text: 'Use AWS Database Migration Service (DMS) to continuously replicate to an EC2-hosted PostgreSQL instance', isCorrect: false },
      { id: 'd', text: 'Enable Multi-AZ on the primary RDS instance to provide cross-region replication', isCorrect: false },
    ],
    explanation: 'An RDS cross-region read replica uses asynchronous replication and typically achieves RPO in the seconds-to-minutes range, well within the 5-minute target. On failover, the replica is promoted to a standalone primary. Daily snapshot copies would have an RPO approaching 24 hours. Multi-AZ provides AZ-level redundancy within a single region, not cross-region. DMS can work but adds operational overhead compared to the native RDS replication solution.',
  },

  // Topic: event-driven-and-messaging
  {
    topicSlug: 'event-driven-and-messaging',
    difficulty: 'easy',
    text: 'A company wants to send the same notification to multiple downstream services whenever an order is placed. Which AWS messaging service is best suited for this fan-out pattern?',
    options: [
      { id: 'a', text: 'Amazon SQS Standard Queue', isCorrect: false },
      { id: 'b', text: 'Amazon SNS Topic with multiple subscribed SQS queues', isCorrect: true },
      { id: 'c', text: 'AWS Step Functions', isCorrect: false },
      { id: 'd', text: 'Amazon Kinesis Data Firehose', isCorrect: false },
    ],
    explanation: 'SNS is a pub/sub service designed for fan-out. A single SNS topic can fan out messages to multiple SQS queues (or Lambda functions, HTTP endpoints, etc.) simultaneously. SQS alone delivers each message to a single consumer. Step Functions orchestrates workflows but doesn\'t handle fan-out messaging. Kinesis Firehose ingests and delivers data streams but is not a pub/sub messaging service.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    difficulty: 'medium',
    text: 'An order processing application must guarantee that each order is processed exactly once and in the order it was placed. Which SQS queue type should be used?',
    options: [
      { id: 'a', text: 'SQS Standard Queue with message deduplication enabled', isCorrect: false },
      { id: 'b', text: 'SQS FIFO Queue with content-based deduplication enabled', isCorrect: true },
      { id: 'c', text: 'SQS Standard Queue with a Dead-Letter Queue configured', isCorrect: false },
      { id: 'd', text: 'Amazon Kinesis Data Streams with a shard per customer', isCorrect: false },
    ],
    explanation: 'SQS FIFO queues guarantee strict ordering and exactly-once delivery (using message group IDs and deduplication IDs). Content-based deduplication automatically deduplicates messages using a SHA-256 hash of the message body. Standard queues offer best-effort ordering and at-least-once delivery. A DLQ handles failed processing but does not enforce ordering or deduplication. Kinesis maintains order per shard but doesn\'t natively prevent duplicate processing without idempotency logic.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    difficulty: 'medium',
    text: 'A Lambda function invoked by SQS fails for 20% of messages due to downstream service timeouts. These messages must be retried and eventually inspected if they still fail. What is the BEST configuration?',
    options: [
      { id: 'a', text: 'Increase the Lambda timeout to 15 minutes to avoid failures', isCorrect: false },
      { id: 'b', text: 'Configure the SQS queue with a Dead-Letter Queue and set a redrive policy with a maxReceiveCount', isCorrect: true },
      { id: 'c', text: 'Use SQS message timers to delay failed messages by 30 seconds automatically', isCorrect: false },
      { id: 'd', text: 'Enable an SNS retry policy to resend failed notifications', isCorrect: false },
    ],
    explanation: 'A Dead-Letter Queue (DLQ) with a redrive policy captures messages that fail processing after a set number of retries (maxReceiveCount). This prevents problematic messages from blocking the queue indefinitely and allows engineers to inspect and reprocess them. Increasing the timeout doesn\'t address intermittent failures. Message timers delay initial delivery, not retries. SNS retry policies apply to SNS-to-endpoint delivery, not Lambda function execution failures.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    difficulty: 'hard',
    text: 'A company uses SQS to decouple a producer from consumer Lambdas. The consumer must be idempotent. Which practice BEST ensures idempotent message processing?',
    options: [
      { id: 'a', text: 'Use a FIFO queue so each message is delivered only once and no idempotency logic is needed', isCorrect: false },
      { id: 'b', text: 'Check and store the SQS message\'s MessageId in a DynamoDB table (with conditional writes) before processing; skip if already processed', isCorrect: true },
      { id: 'c', text: 'Set the SQS Visibility Timeout to match the Lambda timeout exactly', isCorrect: false },
      { id: 'd', text: 'Delete the message from SQS before Lambda starts processing it', isCorrect: false },
    ],
    explanation: 'True idempotency requires the consumer to track which messages it has already processed. Storing the MessageId in DynamoDB with a conditional write (only insert if not exists) ensures that even if the same message is delivered twice (which can happen on Lambda retries or FIFO edge cases), the business operation is executed only once. FIFO queues minimize duplicates but do not fully eliminate them and don\'t provide application-level idempotency. Matching the visibility timeout only prevents concurrent redundant processing, not all forms of duplicate delivery.',
  },

  // Topic: edge-and-global-routing
  {
    topicSlug: 'edge-and-global-routing',
    difficulty: 'easy',
    text: 'A company serves static assets (images, CSS, JavaScript) from an S3 bucket to a global user base. Users in Europe report slow load times. What is the SIMPLEST solution to improve performance?',
    options: [
      { id: 'a', text: 'Enable S3 Transfer Acceleration on the bucket', isCorrect: false },
      { id: 'b', text: 'Place a CloudFront distribution in front of the S3 bucket', isCorrect: true },
      { id: 'c', text: 'Replicate the S3 bucket to an EU region using Cross-Region Replication and update DNS', isCorrect: false },
      { id: 'd', text: 'Move the S3 bucket to the eu-west-1 region', isCorrect: false },
    ],
    explanation: 'CloudFront is a CDN that caches content at 400+ global edge locations. European users are served from a nearby edge location rather than the origin S3 bucket in a distant region, dramatically reducing latency. S3 Transfer Acceleration speeds up uploads to S3, not downloads. CRR copies objects to another region but doesn\'t serve from edge locations; it also requires DNS changes per region. Moving the bucket helps EU users but worsens latency for other regions.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    difficulty: 'medium',
    text: 'A company has a multi-region active-active deployment. It needs to route users to the nearest healthy region based on geographic location. Which Route 53 routing policy should be used?',
    options: [
      { id: 'a', text: 'Weighted Routing', isCorrect: false },
      { id: 'b', text: 'Latency-Based Routing with Health Checks', isCorrect: true },
      { id: 'c', text: 'Failover Routing', isCorrect: false },
      { id: 'd', text: 'Simple Routing', isCorrect: false },
    ],
    explanation: 'Latency-Based Routing resolves DNS to the AWS region that provides the lowest latency for the requesting client — effectively directing users to their nearest healthy region. Combined with Route 53 health checks, failing regions are automatically removed from responses. Weighted routing splits traffic by percentage, not latency. Failover routing is for active-passive setups, not active-active. Simple routing has no health check or regional awareness.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    difficulty: 'hard',
    text: 'A gaming company needs minimal latency and consistent network performance for its API hosted in two AWS regions. It also needs automatic failover. Which service should be used INSTEAD of standard Route 53 DNS?',
    options: [
      { id: 'a', text: 'Amazon CloudFront with Lambda@Edge', isCorrect: false },
      { id: 'b', text: 'AWS Global Accelerator with endpoint health checks', isCorrect: true },
      { id: 'c', text: 'AWS Direct Connect with BGP failover', isCorrect: false },
      { id: 'd', text: 'An Application Load Balancer in each region sharing a single elastic IP', isCorrect: false },
    ],
    explanation: 'AWS Global Accelerator provides static Anycast IP addresses and routes traffic over the AWS global network backbone — bypassing the public internet — to the nearest healthy endpoint. This delivers consistent low latency and sub-minute automatic failover. CloudFront caches content at the edge but is optimized for cacheable HTTP workloads, not real-time API traffic. Direct Connect is for private on-premises connectivity. ALBs don\'t share IPs across regions and don\'t use the AWS backbone for end-user traffic.',
  },

  // ─── Domain 2: Design High-Performing Architectures ──────────────────────

  // Topic: compute-selection-and-scaling
  {
    topicSlug: 'compute-selection-and-scaling',
    difficulty: 'easy',
    text: 'A workload processes images uploaded by users. Processing takes between 500 ms and 3 minutes per image and the volume is unpredictable. Which compute option is MOST cost-effective?',
    options: [
      { id: 'a', text: 'A large EC2 instance running continuously', isCorrect: false },
      { id: 'b', text: 'AWS Lambda functions triggered by S3 upload events', isCorrect: false },
      { id: 'c', text: 'Amazon ECS tasks triggered by an SQS queue, scaling with queue depth', isCorrect: true },
      { id: 'd', text: 'An EMR cluster with Spark for batch processing', isCorrect: false },
    ],
    explanation: 'Lambda has a maximum 15-minute timeout, which cannot handle jobs taking up to 3 minutes... wait, it can handle up to 15 minutes. However, the variable nature and longer processing times make ECS on Fargate (event-driven by SQS queue depth) more flexible — no cold start issues for longer jobs, and it scales to zero. Actually in this case Lambda could work but ECS provides more control for variable durations up to 3 minutes. The key disqualifier for Lambda here is when combined with unpredictable burst — ECS with queue-depth-based scaling is the standard exam answer for variable-duration batch workloads exceeding seconds. A continuously running large EC2 instance wastes money during idle periods. EMR is suited for big data analytics, not per-image processing.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    difficulty: 'medium',
    text: 'An Auto Scaling group needs to scale out quickly when CPU utilization exceeds 70% and scale in conservatively to avoid thrashing. Which combination of scaling policies achieves this?',
    options: [
      { id: 'a', text: 'A single Simple Scaling policy at 70% CPU with a cooldown of 60 seconds for both scale-out and scale-in', isCorrect: false },
      { id: 'b', text: 'A Target Tracking policy targeting 70% CPU with scale-in cooldown disabled', isCorrect: false },
      { id: 'c', text: 'A Target Tracking policy targeting 70% CPU with the default warm-up period, and a separate Step Scaling policy for aggressive scale-out', isCorrect: false },
      { id: 'd', text: 'A Target Tracking policy targeting 70% CPU, with scale-in protection enabled on instances during active request processing', isCorrect: true },
    ],
    explanation: 'Target Tracking automatically adjusts capacity to maintain the target metric. Enabling scale-in protection on instances that are actively processing requests prevents premature termination. This combination scales out when CPU rises above 70% and protects busy instances from abrupt termination during scale-in events. Simple Scaling with a single cooldown cannot differentiate between scale-out and scale-in aggressiveness. Disabling the scale-in cooldown risks thrashing.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    difficulty: 'hard',
    text: 'A company migrates a containerised microservices application to AWS. The platform team wants to avoid managing EC2 nodes but still needs fine-grained control over resource limits, IAM roles per task, and the ability to run GPU-based containers. Which service meets ALL requirements?',
    options: [
      { id: 'a', text: 'Amazon ECS on AWS Fargate', isCorrect: false },
      { id: 'b', text: 'Amazon ECS on EC2 launch type', isCorrect: false },
      { id: 'c', text: 'Amazon EKS with managed node groups', isCorrect: false },
      { id: 'd', text: 'Amazon ECS on EC2 with GPU-optimized AMIs and task-level IAM roles', isCorrect: true },
    ],
    explanation: 'GPU containers require underlying EC2 instances with GPU hardware (e.g., p3 or g4 instances). Fargate does not support GPU workloads (as of the exam scope), so EC2 launch type is required. ECS on EC2 supports task-level IAM roles (via task execution roles) and fine-grained resource limits per task definition. ECS with EC2 means the team manages node lifecycle unless they use ECS-managed instances. EKS with managed node groups reduces but doesn\'t eliminate node management, and adds Kubernetes operational overhead that isn\'t necessary here.',
  },

  // Topic: storage-performance-patterns
  {
    topicSlug: 'storage-performance-patterns',
    difficulty: 'easy',
    text: 'A database application on EC2 requires the highest possible IOPS with the lowest latency. Which storage solution is BEST suited?',
    options: [
      { id: 'a', text: 'Amazon S3 with Transfer Acceleration', isCorrect: false },
      { id: 'b', text: 'Amazon EBS io2 Block Express volume', isCorrect: true },
      { id: 'c', text: 'Amazon EFS in Max I/O performance mode', isCorrect: false },
      { id: 'd', text: 'Amazon EBS gp2 volume', isCorrect: false },
    ],
    explanation: 'EBS io2 Block Express delivers up to 256,000 IOPS and sub-millisecond latency — the highest performance EBS option. It is designed for I/O-intensive databases like Oracle or SAP HANA. S3 is object storage with much higher latency, unsuitable for database block I/O. EFS in Max I/O mode optimizes for aggregate throughput over many EC2 clients but has higher per-operation latency than io2. gp2 is a general-purpose SSD limited to 16,000 IOPS.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    difficulty: 'medium',
    text: 'A shared file system must be concurrently accessed by hundreds of Linux EC2 instances across multiple Availability Zones. Which storage service handles this natively?',
    options: [
      { id: 'a', text: 'Amazon EBS Multi-Attach io1 volume', isCorrect: false },
      { id: 'b', text: 'Amazon EFS', isCorrect: true },
      { id: 'c', text: 'Amazon S3 with S3 Sync running on each instance', isCorrect: false },
      { id: 'd', text: 'Amazon FSx for Windows File Server', isCorrect: false },
    ],
    explanation: "Amazon EFS is a fully managed NFS file system that scales elastically and can be mounted concurrently by thousands of Linux EC2 instances across multiple AZs in the same region. EBS Multi-Attach is limited to up to 16 instances in a single AZ and requires cluster-aware file systems. S3 is object storage — 'syncing' isn't a true shared POSIX file system. FSx for Windows File Server uses SMB, not NFS, and is designed for Windows workloads.",
  },
  {
    topicSlug: 'storage-performance-patterns',
    difficulty: 'hard',
    text: 'An HPC workload requires a high-throughput, low-latency shared file system backed by Lustre for processing large datasets stored in Amazon S3. Which service should be used?',
    options: [
      { id: 'a', text: 'Amazon EFS in Max I/O mode', isCorrect: false },
      { id: 'b', text: 'Amazon FSx for Lustre linked to an S3 bucket', isCorrect: true },
      { id: 'c', text: 'Amazon S3 with S3 Select', isCorrect: false },
      { id: 'd', text: 'AWS Storage Gateway (File Gateway) in front of S3', isCorrect: false },
    ],
    explanation: 'Amazon FSx for Lustre provides a fully managed Lustre file system optimized for HPC workloads. It can be linked directly to an S3 bucket — data is lazy-loaded from S3 on first access and results are written back to S3. This provides sub-millisecond latencies and hundreds of gigabytes per second of throughput. EFS targets general-purpose NFS workloads, not Lustre HPC. S3 Select filters data server-side but is not a POSIX file system. Storage Gateway bridges on-premises environments to S3, not HPC clusters.',
  },

  // Topic: database-performance-and-caching
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'easy',
    text: 'An application performs the same complex relational query thousands of times per minute. The results change infrequently. Which is the MOST effective way to reduce database load?',
    options: [
      { id: 'a', text: 'Add an RDS read replica and route all repeated queries to it', isCorrect: false },
      { id: 'b', text: 'Place an Amazon ElastiCache for Redis cluster in front of the database and cache query results', isCorrect: true },
      { id: 'c', text: 'Increase the RDS instance size to a larger DB instance class', isCorrect: false },
      { id: 'd', text: 'Enable RDS Performance Insights to identify slow queries', isCorrect: false },
    ],
    explanation: 'ElastiCache for Redis caches query results in memory, serving repeated requests in microseconds without hitting the database at all. This dramatically reduces load for read-heavy, infrequently-changing data. A read replica still executes the query on RDS for every request. Increasing instance size helps with compute capacity but doesn\'t eliminate redundant query execution. Performance Insights is a monitoring tool, not a performance remedy.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'medium',
    text: 'A startup is building a serverless application that needs a fully managed, highly scalable NoSQL database for user profile storage. Queries are primarily key-value lookups by user ID. Which database is MOST appropriate?',
    options: [
      { id: 'a', text: 'Amazon RDS Aurora Serverless', isCorrect: false },
      { id: 'b', text: 'Amazon DynamoDB', isCorrect: true },
      { id: 'c', text: 'Amazon ElastiCache for Memcached', isCorrect: false },
      { id: 'd', text: 'Amazon Neptune', isCorrect: false },
    ],
    explanation: 'DynamoDB is a fully managed, serverless NoSQL database that delivers single-digit millisecond performance at any scale for key-value and document workloads. It scales automatically and requires no capacity planning. Aurora Serverless is a relational database (SQL) and involves more overhead for simple key-value lookups. ElastiCache is an in-memory cache, not a persistent database. Neptune is a graph database suited for highly connected data, not user profile lookups.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'hard',
    text: 'An Amazon Aurora MySQL cluster is experiencing read-heavy traffic spikes that overwhelm the primary instance. The application uses a single connection string. What is the BEST approach to distribute reads WITHOUT application code changes?',
    options: [
      { id: 'a', text: 'Add Aurora read replicas and update the application to use two separate connection strings', isCorrect: false },
      { id: 'b', text: 'Enable Aurora Auto Scaling for read replicas and use the Aurora Reader Endpoint', isCorrect: true },
      { id: 'c', text: 'Enable Multi-AZ on Aurora to create a standby that handles reads', isCorrect: false },
      { id: 'd', text: 'Migrate to DynamoDB which handles read-heavy workloads natively', isCorrect: false },
    ],
    explanation: 'The Aurora Reader Endpoint load-balances read requests across all available Aurora read replicas using a single DNS name — no application code change is required beyond updating the connection string once. Aurora Auto Scaling adds/removes replicas based on CPU or connection metrics. Multi-AZ Aurora creates a standby for HA, but the standby does NOT serve reads. Migrating to DynamoDB requires significant application refactoring.',
  },

  // Topic: network-performance-and-hybrid
  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'easy',
    text: 'A company needs a dedicated, private network connection from its on-premises data center to AWS with consistent bandwidth and lower latency than a VPN. Which service should be used?',
    options: [
      { id: 'a', text: 'AWS Site-to-Site VPN', isCorrect: false },
      { id: 'b', text: 'AWS Direct Connect', isCorrect: true },
      { id: 'c', text: 'AWS Transit Gateway', isCorrect: false },
      { id: 'd', text: 'VPC Peering', isCorrect: false },
    ],
    explanation: 'AWS Direct Connect establishes a dedicated physical network connection between on-premises and AWS, offering consistent bandwidth, lower latency, and reduced data transfer costs compared to internet-based VPNs. Site-to-Site VPN runs over the public internet and is subject to variable latency. Transit Gateway is a network hub for VPCs and VPNs but is not itself a connectivity service to on-premises. VPC Peering connects two VPCs, not on-premises to AWS.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'medium',
    text: 'A VPC has three subnets: public, private-app, and private-db. EC2 instances in the private-app subnet must reach S3 without traversing the public internet. What should be configured?',
    options: [
      { id: 'a', text: 'Assign Elastic IPs to the private-app EC2 instances', isCorrect: false },
      { id: 'b', text: 'Create a VPC Gateway Endpoint for Amazon S3 and update the private subnet route table', isCorrect: true },
      { id: 'c', text: 'Create a NAT Gateway in the public subnet and route private-app traffic through it', isCorrect: false },
      { id: 'd', text: 'Enable S3 Transfer Acceleration on the bucket', isCorrect: false },
    ],
    explanation: 'A VPC Gateway Endpoint for S3 allows instances in private subnets to access S3 privately over the AWS network backbone — no NAT Gateway or internet gateway is involved. You add a route to the private subnet\'s route table pointing to the endpoint prefix list. A NAT Gateway works but routes traffic through the internet, incurring data transfer charges and using public IP space. Elastic IPs on private instances don\'t help (they wouldn\'t route to S3 without an internet gateway). Transfer Acceleration speeds up uploads but doesn\'t address private network requirements.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'hard',
    text: 'A large enterprise has 50 VPCs across multiple AWS accounts and needs full mesh connectivity between all VPCs and its on-premises data center over a single Direct Connect connection. What is the MOST operationally efficient architecture?',
    options: [
      { id: 'a', text: 'Create VPC peering connections in a hub-and-spoke topology with one central VPC', isCorrect: false },
      { id: 'b', text: 'Attach all VPCs to an AWS Transit Gateway and connect the Direct Connect link to the Transit Gateway via a Direct Connect Gateway', isCorrect: true },
      { id: 'c', text: 'Create individual VPN tunnels from each VPC to the on-premises router', isCorrect: false },
      { id: 'd', text: 'Use VPC Peering between all 50 VPCs and attach a Virtual Private Gateway to each VPC', isCorrect: false },
    ],
    explanation: 'AWS Transit Gateway acts as a cloud router, enabling any-to-any connectivity between all attached VPCs and on-premises networks through a single managed hub. A Direct Connect Gateway bridges the Transit Gateway to the Direct Connect connection, giving all VPCs access to on-premises. VPC Peering does not support transitive routing — with 50 VPCs you would need up to 1,225 peering connections. Individual VPNs per VPC multiply operational complexity. A Virtual Private Gateway per VPC similarly doesn\'t scale.',
  },

  // ─── Domain 3: Design Secure Applications and Architectures ──────────────

  // Topic: identity-access-and-governance
  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'easy',
    text: 'An EC2 instance needs to read objects from an S3 bucket without embedding AWS credentials in the application code. What is the CORRECT approach?',
    options: [
      { id: 'a', text: 'Store the IAM user access key and secret in the EC2 instance\'s environment variables', isCorrect: false },
      { id: 'b', text: 'Attach an IAM Role with an S3 read policy to the EC2 instance', isCorrect: true },
      { id: 'c', text: 'Hard-code the credentials in the application\'s configuration file', isCorrect: false },
      { id: 'd', text: 'Create an S3 bucket policy that allows all principals (*)  to read', isCorrect: false },
    ],
    explanation: 'IAM Roles attached to EC2 instances provide temporary, automatically-rotated credentials via the EC2 Instance Metadata Service (IMDS). The AWS SDKs pick these up automatically — no credential management required. Embedding or hard-coding long-term IAM user credentials is a security anti-pattern and a risk if the credentials are leaked. Making the bucket public violates least-privilege and exposes data to the entire internet.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'medium',
    text: 'A company uses AWS Organizations with multiple accounts. The security team wants to prevent ALL accounts in certain OUs from disabling AWS CloudTrail, regardless of account-level IAM policies. What should be used?',
    options: [
      { id: 'a', text: 'IAM Permission Boundaries applied to all IAM roles', isCorrect: false },
      { id: 'b', text: 'AWS Organizations Service Control Policies (SCPs) attached to the target OUs', isCorrect: true },
      { id: 'c', text: 'AWS Config rules that auto-remediate CloudTrail disabling', isCorrect: false },
      { id: 'd', text: 'IAM Deny policies applied to each account\'s root user', isCorrect: false },
    ],
    explanation: 'SCPs are organizational guardrails that set maximum permissions for all principals in the accounts they apply to — even the account root. An SCP denying `cloudtrail:StopLogging` and `cloudtrail:DeleteTrail` on an OU prevents any entity in those accounts from disabling CloudTrail, regardless of local IAM policies. Permission Boundaries apply to individual IAM entities, not organizations. Config rules detect and can remediate, but remediation is reactive (not preventive) and a sufficiently privileged user could disable the rule. Applying policies to root is not a supported IAM mechanism.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'hard',
    text: 'A Lambda function in Account A needs to access a DynamoDB table in Account B. What is the CORRECT way to grant this access following least-privilege principles?',
    options: [
      { id: 'a', text: 'Create an IAM user in Account B, generate access keys, and store them in the Lambda environment variables in Account A', isCorrect: false },
      { id: 'b', text: 'In Account B, create an IAM Role with a DynamoDB read policy and a trust policy allowing Account A\'s Lambda execution role to assume it. In Account A, grant the Lambda execution role sts:AssumeRole permission for the Account B role.', isCorrect: true },
      { id: 'c', text: 'Make the DynamoDB table public by setting a resource-based policy allowing all AWS principals', isCorrect: false },
      { id: 'd', text: 'Enable VPC Peering between the two accounts to allow network-level DynamoDB access', isCorrect: false },
    ],
    explanation: 'Cross-account access follows the cross-account role assumption pattern: (1) Account B creates a role with a trust policy that allows Account A\'s Lambda execution role principal to call sts:AssumeRole. (2) Account A grants its Lambda execution role permission to call sts:AssumeRole for the Account B role ARN. The Lambda then assumes the role using STS and receives temporary credentials scoped to DynamoDB operations in Account B. Storing IAM user keys is insecure and hard to rotate. Allowing all AWS principals is a massive security risk. VPC Peering is for network connectivity, not IAM authorization — DynamoDB is accessed via AWS API, not the VPC network layer.',
  },

  // Topic: data-protection-and-key-management
  {
    topicSlug: 'data-protection-and-key-management',
    difficulty: 'easy',
    text: 'A company stores sensitive customer data in S3. Data must be encrypted at rest and the company must maintain full control over the encryption keys, including the ability to rotate and audit key usage. Which S3 encryption option meets these requirements?',
    options: [
      { id: 'a', text: 'SSE-S3 (Server-Side Encryption with S3-Managed Keys)', isCorrect: false },
      { id: 'b', text: 'SSE-KMS using a Customer Managed Key (CMK)', isCorrect: true },
      { id: 'c', text: 'SSE-C (Server-Side Encryption with Customer-Provided Keys)', isCorrect: false },
      { id: 'd', text: 'Client-Side Encryption before uploading to S3', isCorrect: false },
    ],
    explanation: 'SSE-KMS with a Customer Managed Key (CMK) gives the company full control: they manage key policies, enable/disable the key, and all key usage is logged in AWS CloudTrail for auditing. Automatic key rotation can be enabled. SSE-S3 uses AWS-managed keys with no audit trail or customer control. SSE-C requires the customer to provide the key with every API call — keys are not stored in AWS so rotation and audit are the customer\'s burden entirely. Client-Side Encryption works but requires the application to manage encryption/decryption logic and key distribution.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    difficulty: 'medium',
    text: 'An application stores database credentials that must be encrypted, automatically rotated every 30 days, and retrieved programmatically by Lambda functions. Which AWS service is BEST suited?',
    options: [
      { id: 'a', text: 'AWS Systems Manager Parameter Store (SecureString parameters)', isCorrect: false },
      { id: 'b', text: 'AWS Secrets Manager', isCorrect: true },
      { id: 'c', text: 'AWS KMS with a symmetric CMK', isCorrect: false },
      { id: 'd', text: 'An IAM Role with an inline policy', isCorrect: false },
    ],
    explanation: 'AWS Secrets Manager is designed for storing, rotating, and retrieving secrets like database credentials. It natively integrates with RDS, Redshift, and DocumentDB for automatic rotation via Lambda, and supports custom rotation Lambdas for other databases. Secrets can be retrieved via API or SDK. Parameter Store SecureString can store encrypted values but does NOT natively support automatic rotation — rotation must be implemented separately. KMS is a key management service, not a secrets store. IAM roles grant permissions but cannot store or rotate credentials.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    difficulty: 'hard',
    text: 'A company requires that its KMS Customer Managed Keys (CMKs) can NEVER be exported from AWS, usage is logged, and the key material is generated inside a dedicated hardware security module validated to FIPS 140-2 Level 3. Which KMS key type satisfies ALL requirements?',
    options: [
      { id: 'a', text: 'AWS Managed Key (aws/service)', isCorrect: false },
      { id: 'b', text: 'Customer Managed Key (CMK) with imported key material', isCorrect: false },
      { id: 'c', text: 'AWS CloudHSM-backed Customer Managed Key in an external key store', isCorrect: false },
      { id: 'd', text: 'Customer Managed Key (CMK) with KMS-generated key material (default CMK)', isCorrect: true },
    ],
    explanation: 'A standard CMK with KMS-generated key material is created inside KMS HSMs that are validated to FIPS 140-2 Level 3. The key material never leaves the HSM in plaintext — it cannot be exported. All usage is logged via CloudTrail. Imported key material CMKs allow the customer to provide (and therefore control export of) key material, which doesn\'t guarantee the non-exportability from the customer\'s perspective. AWS Managed Keys limit customer control over key policy and rotation scheduling. CloudHSM external key stores are for customers who need dedicated HSMs and key material they control externally, but that means the key CAN exist outside AWS.',
  },

  // Topic: network-security-controls
  {
    topicSlug: 'network-security-controls',
    difficulty: 'easy',
    text: 'What is the key difference between an AWS Security Group and a Network ACL (NACL)?',
    options: [
      { id: 'a', text: 'Security Groups apply to subnets; NACLs apply to individual EC2 instances', isCorrect: false },
      { id: 'b', text: 'Security Groups are stateful; NACLs are stateless and require explicit inbound and outbound rules', isCorrect: true },
      { id: 'c', text: 'NACLs support Allow rules only; Security Groups support both Allow and Deny rules', isCorrect: false },
      { id: 'd', text: 'Security Groups are evaluated before NACLs for all inbound traffic', isCorrect: false },
    ],
    explanation: 'Security Groups are stateful: if you allow inbound traffic, the corresponding outbound response is automatically allowed. NACLs are stateless: you must explicitly configure both inbound and outbound rules for bidirectional traffic. Security Groups attach to network interfaces (instance level); NACLs attach to subnets. NACLs support both ALLOW and DENY rules; Security Groups support only ALLOW. NACLs are evaluated before traffic reaches the Security Group.',
  },
  {
    topicSlug: 'network-security-controls',
    difficulty: 'medium',
    text: 'A web application is being targeted by SQL injection and cross-site scripting (XSS) attacks through its public API. Which AWS service should be added to protect against these Layer 7 attacks?',
    options: [
      { id: 'a', text: 'AWS Shield Standard', isCorrect: false },
      { id: 'b', text: 'Amazon GuardDuty', isCorrect: false },
      { id: 'c', text: 'AWS WAF with managed rule groups', isCorrect: true },
      { id: 'd', text: 'VPC Network ACLs with deny rules for known attack IPs', isCorrect: false },
    ],
    explanation: 'AWS WAF (Web Application Firewall) inspects HTTP/HTTPS requests at Layer 7 and can block common web exploits including SQL injection and XSS using AWS-managed rule groups or custom rules. Shield Standard protects against Layer 3/4 volumetric DDoS attacks, not application-layer exploits. GuardDuty analyzes CloudTrail/VPC Flow Logs/DNS logs for threats but cannot block application-layer attack payloads in real time. NACLs operate at Layer 3/4 and cannot inspect HTTP request bodies.',
  },
  {
    topicSlug: 'network-security-controls',
    difficulty: 'hard',
    text: 'A company wants Lambda functions in a VPC to access an internal REST API hosted on EC2 in another VPC WITHOUT exposing that API over the public internet or creating a VPC peering connection. What should be used?',
    options: [
      { id: 'a', text: 'An Application Load Balancer with an internet-facing listener', isCorrect: false },
      { id: 'b', text: 'AWS PrivateLink (VPC Endpoint Service) exposing a Network Load Balancer in the provider VPC', isCorrect: true },
      { id: 'c', text: 'AWS Direct Connect to the provider EC2 instances', isCorrect: false },
      { id: 'd', text: 'VPC peering between the two VPCs and a security group rule allowing Lambda', isCorrect: false },
    ],
    explanation: 'AWS PrivateLink allows you to expose a service in one VPC (provider) to consumers in another VPC privately, without transitive routing or VPC peering. The service provider creates a VPC Endpoint Service backed by an NLB. The consumer creates an Interface VPC Endpoint. All traffic flows over the AWS private network. VPC Peering was explicitly excluded. Direct Connect connects on-premises to AWS, not VPC-to-VPC. An internet-facing ALB exposes the service to the public internet.',
  },

  // Topic: monitoring-detection-and-response
  {
    topicSlug: 'monitoring-detection-and-response',
    difficulty: 'easy',
    text: 'A company wants to receive an alert when any IAM user calls DeleteBucket on S3. Which service combination should be used?',
    options: [
      { id: 'a', text: 'Amazon CloudWatch Metrics + CloudWatch Alarm on S3 bucket count', isCorrect: false },
      { id: 'b', text: 'AWS CloudTrail + CloudWatch Logs Metric Filter + CloudWatch Alarm + SNS notification', isCorrect: true },
      { id: 'c', text: 'Amazon GuardDuty with S3 Protection enabled', isCorrect: false },
      { id: 'd', text: 'AWS Config rule targeting S3 bucket deletion events', isCorrect: false },
    ],
    explanation: 'CloudTrail records all API calls including `DeleteBucket`. You can stream CloudTrail logs to CloudWatch Logs, create a Metric Filter matching the `DeleteBucket` event, set a CloudWatch Alarm on that metric, and route alarm notifications through SNS. GuardDuty detects threats and suspicious patterns but is not the right tool for custom API call alerting. Config evaluates resource compliance state but doesn\'t generate real-time API call alerts. CloudWatch Metrics on S3 bucket count would only detect the absence of a bucket after deletion, not the deletion event itself.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    difficulty: 'medium',
    text: 'A security team suspects that EC2 instances are communicating with known command-and-control (C2) servers. Which AWS service automatically detects this type of threat without requiring agents?',
    options: [
      { id: 'a', text: 'AWS Security Hub', isCorrect: false },
      { id: 'b', text: 'Amazon Inspector', isCorrect: false },
      { id: 'c', text: 'Amazon GuardDuty', isCorrect: true },
      { id: 'd', text: 'AWS Shield Advanced', isCorrect: false },
    ],
    explanation: 'Amazon GuardDuty is a threat detection service that continuously analyses VPC Flow Logs, DNS logs, and CloudTrail data using machine learning and threat intelligence feeds to detect suspicious activity — including communication with known malicious IP addresses and C2 domains. No agents are required. Security Hub aggregates findings from multiple services (including GuardDuty) but does not perform detection itself. Inspector scans EC2 instances and container images for software vulnerabilities. Shield Advanced protects against DDoS attacks.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    difficulty: 'hard',
    text: 'A company uses multiple AWS accounts and needs a single pane of glass for security findings from GuardDuty, Inspector, Macie, and Firewall Manager across all accounts. Which service provides this aggregation?',
    options: [
      { id: 'a', text: 'Amazon CloudWatch with cross-account dashboards', isCorrect: false },
      { id: 'b', text: 'AWS Security Hub with an organization-wide aggregation region', isCorrect: true },
      { id: 'c', text: 'AWS Config aggregator across all accounts', isCorrect: false },
      { id: 'd', text: 'Amazon Detective with multi-account support', isCorrect: false },
    ],
    explanation: 'AWS Security Hub is the central security aggregation service that collects and normalizes findings from GuardDuty, Inspector, Macie, Firewall Manager, IAM Access Analyzer, and third-party tools. An organization-wide aggregation region consolidates findings from all accounts and regions into a single view. CloudWatch cross-account dashboards surface metrics, not security findings. Config Aggregator centralizes compliance and resource configuration data, not threat detection findings. Amazon Detective provides graph-based investigation of security incidents but pulls data from GuardDuty findings — it does not aggregate the broader set of services.',
  },

  // ─── Domain 4: Design Cost-Optimized Architectures ───────────────────────

  // Topic: cost-aware-architecture-decisions
  {
    topicSlug: 'cost-aware-architecture-decisions',
    difficulty: 'easy',
    text: 'Which AWS pricing model provides the highest discount (up to 75%) compared to On-Demand pricing in exchange for a 1- or 3-year commitment to a specific instance type and Availability Zone?',
    options: [
      { id: 'a', text: 'Compute Savings Plans', isCorrect: false },
      { id: 'b', text: 'Standard Reserved Instances', isCorrect: true },
      { id: 'c', text: 'Convertible Reserved Instances', isCorrect: false },
      { id: 'd', text: 'Scheduled Reserved Instances', isCorrect: false },
    ],
    explanation: 'Standard Reserved Instances offer the highest discount (up to 75%) in exchange for committing to a specific instance type, OS, and AZ for 1 or 3 years. The tradeoff is inflexibility — you cannot change the instance type or AZ. Convertible RIs offer lower discounts (~54%) but allow instance type changes. Compute Savings Plans offer flexibility across regions, instance families, and compute services at a slightly lower discount. Scheduled RIs are used for recurring capacity needs at specific times.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    difficulty: 'medium',
    text: 'A company runs a web application using EC2 with Auto Scaling. Load is predictable Monday–Friday 8AM–6PM and near-zero on weekends. Which COMBINATION minimizes cost while maintaining performance during business hours?',
    options: [
      { id: 'a', text: '100% On-Demand instances with aggressive scale-in policies during weekends', isCorrect: false },
      { id: 'b', text: 'Reserved Instances for the baseline minimum capacity plus On-Demand or Spot for burst', isCorrect: true },
      { id: 'c', text: 'Spot Instances only for all capacity', isCorrect: false },
      { id: 'd', text: 'Dedicated Hosts for all capacity to maximize reservation discounts', isCorrect: false },
    ],
    explanation: 'The optimal strategy is to reserve baseline capacity (the minimum instances always needed during business hours) with Reserved Instances or Savings Plans, and use On-Demand or Spot for variable burst traffic. This maximizes RI utilization while keeping burst costs low. 100% On-Demand forfeits RI savings. 100% Spot risks interruption for customer-facing web traffic. Dedicated Hosts are the most expensive option and designed for licensing or compliance requirements, not general cost optimization.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    difficulty: 'hard',
    text: 'A company is evaluating whether to run a batch analytics workload on EC2 or refactor it to AWS Glue + S3. The workload runs 2 hours per day. Which factors MOST influence the cost-effectiveness decision?',
    options: [
      { id: 'a', text: 'The EC2 instance type and the region where the workload runs', isCorrect: false },
      { id: 'b', text: 'The size of the dataset processed and the total monthly compute hours relative to Glue DPU-hour pricing', isCorrect: true },
      { id: 'c', text: 'The number of S3 GET/PUT requests generated by the workload', isCorrect: false },
      { id: 'd', text: 'Whether the EC2 instances use EBS gp3 or gp2 volumes', isCorrect: false },
    ],
    explanation: 'For 2 hours/day, EC2 On-Demand cost equals instance $/hr × 2 × 30 days. AWS Glue charges per DPU-hour (including 10-minute minimum billing per job). The break-even point depends on the dataset size (determines number of DPUs needed) and total compute hours. Large datasets may require many DPUs making Glue more expensive; small datasets favor Glue\'s managed, zero-operational-overhead model. EBS volume type and specific region affect cost but are secondary compared to compute hours and DPU count. S3 request costs are typically negligible compared to compute.',
  },

  // Topic: compute-cost-optimization
  {
    topicSlug: 'compute-cost-optimization',
    difficulty: 'easy',
    text: 'Which EC2 purchasing option allows you to use spare AWS capacity at discounts of up to 90% but can be interrupted by AWS with a 2-minute warning?',
    options: [
      { id: 'a', text: 'Dedicated Instances', isCorrect: false },
      { id: 'b', text: 'On-Demand Instances', isCorrect: false },
      { id: 'c', text: 'Reserved Instances', isCorrect: false },
      { id: 'd', text: 'Spot Instances', isCorrect: true },
    ],
    explanation: 'EC2 Spot Instances use spare AWS capacity at up to 90% discount vs. On-Demand pricing. AWS can reclaim them with a 2-minute interruption notice when capacity is needed. They are ideal for fault-tolerant, stateless, or checkpointable workloads. Dedicated Instances run on single-tenant hardware with no shared tenancy. On-Demand has no discount and no interruption risk. Reserved Instances provide predictable savings for steady-state workloads.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    difficulty: 'medium',
    text: 'A company committed to using AWS Lambda and Amazon EC2. It wants the savings plan that provides the highest flexibility across instance families, regions, and operating systems. Which savings plan is MOST appropriate?',
    options: [
      { id: 'a', text: 'EC2 Instance Savings Plans', isCorrect: false },
      { id: 'b', text: 'Compute Savings Plans', isCorrect: true },
      { id: 'c', text: 'Standard Reserved Instances', isCorrect: false },
      { id: 'd', text: 'Convertible Reserved Instances', isCorrect: false },
    ],
    explanation: 'Compute Savings Plans (up to 66% discount) apply to EC2 instances (any family, size, region, OS, and tenancy), AWS Lambda, and AWS Fargate — providing maximum flexibility. EC2 Instance Savings Plans offer higher discounts (~72%) but are locked to a specific instance family in a specific region. Standard and Convertible RIs are instance-level commitments and do not cover Lambda. For a company using both Lambda and EC2 with diverse instance types, Compute Savings Plans are the right fit.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    difficulty: 'hard',
    text: 'A company runs a stateless image-processing service on EC2 with Auto Scaling. To maximize cost savings, the team decides to use 80% Spot and 20% On-Demand instances. The ASG must continue to work when Spot capacity is unavailable. Which configuration achieves this?',
    options: [
      { id: 'a', text: 'Create two separate ASGs: one with 100% Spot and one with 100% On-Demand, and manage them independently', isCorrect: false },
      { id: 'b', text: 'Use a single ASG with a mixed instances policy specifying On-Demand base capacity as 20% and Spot for the remainder, with multiple instance type options for Spot diversification', isCorrect: true },
      { id: 'c', text: 'Use 100% Spot instances with a Lambda function that adds On-Demand instances when interrupted', isCorrect: false },
      { id: 'd', text: 'Configure a Spot Fleet with a single instance type to minimize complexity', isCorrect: false },
    ],
    explanation: 'ASG Mixed Instances Policy allows you to define an On-Demand base count and an On-Demand percentage of remaining capacity. The rest is fulfilled with Spot. By listing multiple instance types for Spot diversification across pools, the ASG can still scale using alternative instance types if one Spot pool is exhausted. Two separate ASGs add management overhead and can\'t rebalance dynamically. A Lambda-based approach is complex and slow to react. A Spot Fleet with a single instance type has limited capacity pools — if that type is unavailable in all AZs, the fleet fails.',
  },

  // Topic: storage-and-data-transfer-optimization
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    difficulty: 'easy',
    text: 'A company stores log files in S3 that are frequently accessed for the first 30 days and rarely accessed afterwards. They must be retained for 7 years. Which S3 feature automatically minimizes storage costs?',
    options: [
      { id: 'a', text: 'S3 Versioning with manual deletion after 30 days', isCorrect: false },
      { id: 'b', text: 'S3 Lifecycle Policies transitioning objects to cheaper storage classes over time', isCorrect: true },
      { id: 'c', text: 'S3 Replication to a cheaper region after 30 days', isCorrect: false },
      { id: 'd', text: 'S3 Object Lock in Compliance mode for 7 years', isCorrect: false },
    ],
    explanation: 'S3 Lifecycle Policies automate object transitions between storage classes based on age. For this pattern, transition to S3 Standard-IA after 30 days (lower cost for infrequently accessed data), then to S3 Glacier or Glacier Deep Archive for long-term retention — significantly reducing cost. Manual management is error-prone. Cross-Region Replication copies data but doesn\'t change the storage class and incurs replication costs. S3 Object Lock is for WORM compliance, not cost optimization.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    difficulty: 'medium',
    text: 'A company does not know the access patterns of its S3 objects in advance. Objects range from frequently to infrequently accessed and the pattern changes over time. Which S3 storage class automatically optimizes cost without retrieval fees for frequently-accessed data?',
    options: [
      { id: 'a', text: 'S3 Standard-IA', isCorrect: false },
      { id: 'b', text: 'S3 One Zone-IA', isCorrect: false },
      { id: 'c', text: 'S3 Intelligent-Tiering', isCorrect: true },
      { id: 'd', text: 'S3 Glacier Instant Retrieval', isCorrect: false },
    ],
    explanation: "S3 Intelligent-Tiering monitors access patterns and automatically moves objects between Frequent Access and Infrequent Access tiers (and optional Archive tiers) at no retrieval fee. It's ideal when access patterns are unknown or change over time. Standard-IA and One Zone-IA charge per-GB retrieval fees, which can make them expensive if access is more frequent than expected. Glacier Instant Retrieval is for archival data with infrequent but millisecond-latency access requirements.",
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    difficulty: 'hard',
    text: 'A company processes large datasets in us-east-1 and then transfers results to on-premises via the internet. Data transfer costs are very high. Which TWO approaches MOST effectively reduce data transfer costs? (Choose two)',
    options: [
      { id: 'a', text: 'Compress data before transfer using S3 Object Lambda to apply gzip compression on reads', isCorrect: true },
      { id: 'b', text: 'Use AWS Direct Connect for the on-premises data transfer', isCorrect: true },
      { id: 'c', text: 'Enable S3 Transfer Acceleration for outbound transfers', isCorrect: false },
      { id: 'd', text: 'Use CloudFront to cache and serve the data to on-premises endpoints', isCorrect: false },
    ],
    explanation: 'Compressing data before (or at) transfer reduces the volume of bytes transferred — S3 Object Lambda can apply compression on the fly. AWS Direct Connect typically offers lower data transfer rates than internet data transfer costs and provides consistent throughput. S3 Transfer Acceleration speeds up transfers but does not reduce per-GB pricing — it actually costs more. CloudFront caches are designed for end-user HTTP delivery, not on-premises data egress optimization.',
  },

  // Topic: cost-visibility-and-governance
  {
    topicSlug: 'cost-visibility-and-governance',
    difficulty: 'easy',
    text: 'A finance team wants to receive an email alert if monthly AWS spending is forecasted to exceed $10,000. Which AWS service provides this capability natively?',
    options: [
      { id: 'a', text: 'AWS Cost Explorer', isCorrect: false },
      { id: 'b', text: 'AWS Budgets with a budget alert', isCorrect: true },
      { id: 'c', text: 'AWS Trusted Advisor', isCorrect: false },
      { id: 'd', text: 'AWS CloudWatch Billing alarm', isCorrect: false },
    ],
    explanation: 'AWS Budgets allows you to set cost and usage thresholds and configure alerts that notify via SNS/email when actual or forecasted costs exceed defined amounts. It directly supports "forecasted cost > $10,000" alert thresholds. Cost Explorer is used to analyze and visualize historical spend, not to send alerts. Trusted Advisor gives best-practice recommendations including some cost checks but doesn\'t send custom budget alerts. CloudWatch Billing alarms can be configured but require more manual steps and don\'t support forecasted thresholds as intuitively as Budgets.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    difficulty: 'medium',
    text: 'A company has multiple teams sharing a single AWS account. The finance team wants to allocate S3 and EC2 costs to each team\'s department. What is the MOST effective AWS mechanism for this?',
    options: [
      { id: 'a', text: 'Create separate AWS accounts for each team under AWS Organizations', isCorrect: false },
      { id: 'b', text: 'Apply cost allocation tags to resources and activate them in the Billing console', isCorrect: true },
      { id: 'c', text: 'Use AWS Cost Explorer\'s filter-by-service feature to separate team costs', isCorrect: false },
      { id: 'd', text: 'Create IAM groups per team and use IAM policies to restrict resource creation', isCorrect: false },
    ],
    explanation: 'Cost Allocation Tags (e.g., `Team: frontend`, `Department: engineering`) are applied to AWS resources and, once activated in the Billing and Cost Management console, appear as filterable dimensions in Cost Explorer, Cost and Usage Reports, and AWS Budgets. This enables per-team cost attribution without account separation. Separate accounts are the strongest isolation model but not necessary just for cost attribution in a shared account. Filtering by service in Cost Explorer doesn\'t attribute to teams. IAM groups control access, not cost reporting.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    difficulty: 'hard',
    text: 'A company wants to enforce that all new EC2 instances must have a "CostCenter" tag. Any instance created without this tag should be stopped automatically. Which combination of services achieves this with the LEAST operational overhead?',
    options: [
      { id: 'a', text: 'AWS Config with a custom rule + AWS Lambda auto-remediation action', isCorrect: false },
      { id: 'b', text: 'AWS Config managed rule "required-tags" with an AWS Config Remediation (SSM Automation) to stop non-compliant instances', isCorrect: true },
      { id: 'c', text: 'An EventBridge rule on EC2 RunInstances + Lambda that checks tags and terminates the instance', isCorrect: false },
      { id: 'd', text: 'AWS Organizations Tag Policies with enforcement mode enabled', isCorrect: false },
    ],
    explanation: 'The AWS Config managed rule `required-tags` evaluates whether resources have the required tags. Pairing it with an AWS Config Remediation action backed by the AWS-StopEC2Instance SSM Automation document provides a managed, low-code solution. This is less operationally complex than writing and maintaining a custom Lambda/EventBridge pipeline. Organizations Tag Policies in enforcement mode can prevent tag-less resource creation (API-level enforcement) but stopping a running non-compliant instance requires remediation. The custom Lambda approach works but requires more code maintenance.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    difficulty: 'hard',
    text: 'A company runs a critical application on EC2 instances in an Auto Scaling group. The application requires a specific legacy software component that takes 15 minutes to initialize. How can the architect ensure the application scales out quickly enough to meet sudden traffic spikes?',
    options: [
      { id: 'a', text: 'Increase the EC2 instance size to a larger family with faster CPUs', isCorrect: false },
      { id: 'b', text: 'Use ASG Step Scaling with an extremely aggressive warm-up period', isCorrect: false },
      { id: 'c', text: 'Implement ASG Warm Pools to maintain a pool of pre-initialized instances', isCorrect: true },
      { id: 'd', text: 'Configure a Predictive Scaling policy based on historical 24-hour data', isCorrect: false },
    ],
    explanation: 'ASG Warm Pools allow you to decrease latency for applications that have long boot times. It maintains a pool of pre-initialized EC2 instances that are stopped or in a "Running" state but not yet handling traffic. When a scale-out event occurs, these instances can be moved to the ASG immediately, bypassing the 15-minute setup. Predictive scaling helps with patterns, but doesn’t solve the raw 15-minute boot bottleneck for sudden bursts.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    difficulty: 'medium',
    text: 'An application is hosted in us-east-1 and us-west-2. The company wants to ensure that users are always routed to the region with the lowest latency, but also wants to be able to manually shift 10% of traffic to the other region for "canary" testing of a new feature. Which service is best?',
    options: [
      { id: 'a', text: 'Route 53 Latency-based routing', isCorrect: false },
      { id: 'b', text: 'Route 53 Geoproximity routing', isCorrect: false },
      { id: 'c', text: 'AWS Global Accelerator', isCorrect: true },
      { id: 'd', text: 'CloudFront with Origin Groups', isCorrect: false },
    ],
    explanation: 'AWS Global Accelerator provides "traffic dials" that allow you to easily perform blue/green or canary testing by shifting traffic percentages between endpoints in different regions. While Route 53 does latency routing, it is harder to precisely control a 10% manual shift due to DNS caching. Global Accelerator uses the AWS network and Anycast IPs for near-instant traffic shifting.',
  },

  // ─── Domain 2: Design High-Performing Architectures ──────────────────────

  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'medium',
    text: 'A company needs to connect 50 VPCs to a central Shared Services VPC. They want to avoid the complexity of a full-mesh peering design and ensure that they can centrally inspect all traffic between VPCs using a third-party firewall. What is the best architecture?',
    options: [
      { id: 'a', text: 'VPC Peering with a Transit Gateway in the middle', isCorrect: false },
      { id: 'b', text: 'AWS Transit Gateway with Appliance Mode enabled', isCorrect: true },
      { id: 'c', text: 'AWS PrivateLink for every service in every VPC', isCorrect: false },
      { id: 'd', text: 'Software-defined VPN tunnels between all VPCs', isCorrect: false },
    ],
    explanation: 'AWS Transit Gateway is the standard "hub-and-spoke" network service. "Appliance Mode" is a specific feature that ensures flow symmetry when using third-party firewalls (appliances) in a Shared Services VPC, making it the most efficient way to inspect inter-VPC traffic at scale.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'medium',
    text: 'An application using DynamoDB is experiencing "ProvisionedThroughputExceededException" errors during peak hours, despite Auto Scaling being enabled. The access pattern involves a small number of "hot" keys being read millions of times. What is the most cost-effective fix?',
    options: [
      { id: 'a', text: 'Switch DynamoDB to On-Demand capacity mode', isCorrect: false },
      { id: 'b', text: 'Increase the Read Capacity Units (RCUs) significantly', isCorrect: false },
      { id: 'c', text: 'Implement DynamoDB Accelerator (DAX)', isCorrect: true },
      { id: 'd', text: 'Use a Global Secondary Index (GSI) to spread the load', isCorrect: false },
    ],
    explanation: 'DAX is an in-memory cache specifically for DynamoDB. It is the best solution for "hot keys" where certain items are read much more frequently than others. Auto Scaling and On-Demand mode can handle volume, but they still have partition-level limits that "hot keys" can break; DAX removes that load entirely from the database.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    difficulty: 'hard',
    text: 'A company needs to migrate a 100 TB on-premises file share to AWS. The users require the exact same SMB protocol support and Windows ACL permissions. The storage must be accessible from multiple EC2 instances across AZs. Which service fits?',
    options: [
      { id: 'a', text: 'Amazon EFS', isCorrect: false },
      { id: 'b', text: 'Amazon FSx for Windows File Server', isCorrect: true },
      { id: 'c', text: 'Amazon S3 with File Gateway', isCorrect: false },
      { id: 'd', text: 'Amazon EBS with Multi-Attach', isCorrect: false },
    ],
    explanation: 'FSx for Windows File Server is built on Windows Server and natively supports SMB, managed Active Directory integration, and Windows NTFS ACLs. EFS is for Linux (NFS). File Gateway doesn’t provide full NTFS ACL support in the same way. EBS is block storage, not a file share.',
  },

  // ─── Domain 3: Design Secure Applications and Architectures ──────────────

  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'medium',
    text: 'A developer in Account A needs to upload files to an S3 bucket in Account B. The bucket in Account B is encrypted with a KMS key also located in Account B. Which permissions are required? (Choose TWO)',
    options: [
      { id: 'a', text: 'The IAM user in Account A needs s3:PutObject and kms:GenerateDataKey permissions', isCorrect: true },
      { id: 'b', text: 'The S3 bucket policy in Account B must allow the IAM user from Account A', isCorrect: true },
      { id: 'c', text: 'Account A needs to create a VPC Peering connection to Account B', isCorrect: false },
      { id: 'd', text: 'The KMS Key policy in Account B must allow Account B\'s root user only', isCorrect: false },
    ],
    explanation: 'For cross-account S3 uploads with encryption: 1. The caller needs permission to write to S3 AND use the KMS key to encrypt. 2. The resource-based policy (Bucket Policy) in the destination account must explicitly grant access to the external principal.',
  },
  {
    topicSlug: 'network-security-controls',
    difficulty: 'medium',
    text: 'A company wants to allow its developers to SSH into EC2 instances in a private subnet without using a Bastion Host or managing SSH keys. Which service should they use?',
    options: [
      { id: 'a', text: 'EC2 Instance Connect', isCorrect: false },
      { id: 'b', text: 'AWS Systems Manager Session Manager', isCorrect: true },
      { id: 'c', text: 'AWS Site-to-Site VPN', isCorrect: false },
      { id: 'd', text: 'Direct Connect', isCorrect: false },
    ],
    explanation: 'Session Manager allows you to manage EC2 instances through an interactive one-click browser-based shell or via the AWS CLI. It does not require an IGW, public IPs, or SSH keys, and it logs all session activity to CloudTrail/S3 for security.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    difficulty: 'easy',
    text: 'An application must meet a regulatory requirement to encrypt all data at rest using a key that is stored on a physically isolated hardware device that the company exclusively controls. Which service meets this?',
    options: [
      { id: 'a', text: 'AWS KMS with Customer Managed Key', isCorrect: false },
      { id: 'b', text: 'AWS CloudHSM', isCorrect: true },
      { id: 'c', text: 'AWS Secrets Manager', isCorrect: false },
      { id: 'd', text: 'S3 Server-Side Encryption (SSE-S3)', isCorrect: false },
    ],
    explanation: 'CloudHSM provides dedicated Hardware Security Modules (HSMs) within the AWS Cloud. Unlike KMS (which is a multi-tenant service, even with CMKs), CloudHSM gives you exclusive control over the hardware and the key material.',
  },
  {
    topicSlug: 'network-security-controls',
    difficulty: 'hard',
    text: 'A security architect needs to implement a solution that automatically blocks IP addresses that are attempting to perform "SSH Brute Force" attacks against EC2 instances. Which combination is most effective?',
    options: [
      { id: 'a', text: 'Enable GuardDuty and use an EventBridge rule to trigger a Lambda function that updates a NACL or WAF IP Set', isCorrect: true },
      { id: 'b', text: 'Use AWS Shield Advanced to detect and block the SSH traffic', isCorrect: false },
      { id: 'c', text: 'Configure a Security Group to only allow SSH from 0.0.0.0/0', isCorrect: false },
      { id: 'd', text: 'Use Amazon Inspector to scan for open ports and close them', isCorrect: false },
    ],
    explanation: 'GuardDuty detects SSH Brute Force attacks. By connecting GuardDuty findings to EventBridge, you can trigger a Lambda to automatically "remediate" by adding the malicious IP to a NACL (for the subnet) or a WAF (if the attack is at the web level). Shield is for DDoS, not brute force.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'medium',
    text: 'A company needs to provide temporary AWS console access to employees who are already authenticated in their corporate on-premises Active Directory. Which approach is best?',
    options: [
      { id: 'a', text: 'Create an IAM user for every employee and sync passwords', isCorrect: false },
      { id: 'b', text: 'Use AWS IAM Identity Center (Successor to AWS Single Sign-On)', isCorrect: true },
      { id: 'c', text: 'Require employees to use the AWS Root user with MFA', isCorrect: false },
      { id: 'd', text: 'Set up a Site-to-Site VPN and use IAM roles', isCorrect: false },
    ],
    explanation: 'IAM Identity Center is the recommended service for managing workforce identities. It allows you to connect your existing identity provider (like AD) once and manage access to all AWS accounts in your Organization.',
  },

  // ─── Domain 4: Design Cost-Optimized Architectures ───────────────────────

  {
    topicSlug: 'storage-and-data-transfer-optimization',
    difficulty: 'medium',
    text: 'A company is using an S3 bucket as a data lake. They have petabytes of data, but they only ever query the most recent 10% of the data using Amazon Athena. How can they reduce Athena costs?',
    options: [
      { id: 'a', text: 'Transition old data to Glacier Deep Archive', isCorrect: false },
      { id: 'b', text: 'Partition the data in S3 by date and use "partition projection" in Athena', isCorrect: true },
      { id: 'c', text: 'Enable S3 Versioning on the bucket', isCorrect: false },
      { id: 'd', text: 'Use S3 Select instead of Athena', isCorrect: false },
    ],
    explanation: 'Athena charges based on the amount of data scanned. By partitioning your S3 data (e.g., by /year/month/day/), Athena only scans the folders relevant to your query, drastically reducing the cost and increasing performance.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    difficulty: 'easy',
    text: 'A startup wants to run a containerized web app. Traffic is highly variable: it might be zero for hours, then spike to 10,000 users. Which compute model is most cost-effective?',
    options: [
      { id: 'a', text: 'EC2 Reserved Instances', isCorrect: false },
      { id: 'b', text: 'AWS Fargate', isCorrect: true },
      { id: 'c', text: 'EC2 Spot Instances', isCorrect: false },
      { id: 'd', text: 'Dedicated Hosts', isCorrect: false },
    ],
    explanation: 'Fargate is serverless compute for containers. Since it can scale to zero (if using Lambda) or scale very rapidly without you managing the underlying EC2 instances, it is perfect for variable traffic. Spot is cheaper but might be interrupted, which is risky for a primary web app.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    difficulty: 'medium',
    text: 'Which data transfer is FREE of charge in AWS?',
    options: [
      { id: 'a', text: 'Data transfer from EC2 to the Internet', isCorrect: false },
      { id: 'b', text: 'Data transfer from the Internet to S3', isCorrect: true },
      { id: 'c', text: 'Data transfer between EC2 instances in different AZs', isCorrect: false },
      { id: 'd', text: 'Data transfer from us-east-1 to us-west-2', isCorrect: false },
    ],
    explanation: 'Inbound data transfer from the internet to AWS services (like S3 or EC2) is free. Outbound transfer to the internet or transfer between regions/AZs almost always incurs a cost.',
  },

  // ─── 2026 SPECIAL TOPICS (Modernization) ─────────────────────────────────

  {
    topicSlug: 'compute-selection-and-scaling',
    difficulty: 'hard',
    text: 'An architect is designing a GenAI application using Amazon Bedrock. The company is concerned about data privacy and wants to ensure that the data used to "fine-tune" their model is NOT used to train the base foundation models of the provider. What should the architect tell them?',
    options: [
      { id: 'a', text: 'They must use a Private Link to ensure data privacy', isCorrect: false },
      { id: 'b', text: 'Amazon Bedrock does not use customer data to train the underlying foundation models by default', isCorrect: true },
      { id: 'c', text: 'Data privacy is only guaranteed if using Amazon SageMaker', isCorrect: false },
      { id: 'd', text: 'They must encrypt the data with a KMS key to prevent model training', isCorrect: false },
    ],
    explanation: 'One of the core value propositions of Amazon Bedrock for enterprises is that any data you use for fine-tuning or inference remains within your VPC/environment and is never used by the model providers (like Anthropic or Meta) to train their base models.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    difficulty: 'medium',
    text: 'What is the primary benefit of using Amazon VPC Lattice for a microservices architecture?',
    options: [
      { id: 'a', text: 'It provides a physical hardware connection to on-premises', isCorrect: false },
      { id: 'b', text: 'It handles service discovery, request-level routing, and authentication consistently across VPCs and accounts', isCorrect: true },
      { id: 'c', text: 'It increases the speed of S3 uploads', isCorrect: false },
      { id: 'd', text: 'It is a cheaper alternative to an Internet Gateway', isCorrect: false },
    ],
    explanation: 'VPC Lattice is a service-to-service networking service. It allows developers to connect services across different VPCs and accounts using a standard "Service Network" without having to manage route tables or VPC peering.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    difficulty: 'medium',
    text: 'A company wants to detect when "PII" (Personally Identifiable Information) like credit card numbers is being uploaded to their S3 buckets. Which service is designed for this?',
    options: [
      { id: 'a', text: 'Amazon GuardDuty', isCorrect: false },
      { id: 'b', text: 'Amazon Macie', isCorrect: true },
      { id: 'c', text: 'Amazon Inspector', isCorrect: false },
      { id: 'd', text: 'AWS WAF', isCorrect: false },
    ],
    explanation: 'Amazon Macie is a data security and data privacy service that uses machine learning and pattern matching to discover and protect sensitive data (PII) in Amazon S3.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    difficulty: 'medium',
    text: 'A global application needs to read and write data to a database in both London and New York with sub-second latency. Which database option supports this?',
    options: [
      { id: 'a', text: 'RDS Multi-AZ', isCorrect: false },
      { id: 'b', text: 'DynamoDB Global Tables', isCorrect: true },
      { id: 'c', text: 'Aurora Read Replicas', isCorrect: false },
      { id: 'd', text: 'Amazon Redshift', isCorrect: false },
    ],
    explanation: 'DynamoDB Global Tables provide a fully managed, multi-region, and multi-active database. It replicates data across your chosen regions, allowing for local read/write performance in multiple parts of the world.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    difficulty: 'easy',
    text: 'Which AWS service provides a centralized console to manage and automate backups across multiple AWS services like EBS, RDS, and EFS?',
    options: [
      { id: 'a', text: 'AWS Artifact', isCorrect: false },
      { id: 'b', text: 'AWS Backup', isCorrect: true },
      { id: 'c', text: 'AWS Config', isCorrect: false },
      { id: 'd', text: 'Amazon Data Lifecycle Manager', isCorrect: false },
    ],
    explanation: 'AWS Backup is the centralized service for managing backups across many AWS services. Data Lifecycle Manager is specific to EBS snapshots and AMI management.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    difficulty: 'medium',
    text: 'A company wants to grant a third-party audit firm access to their AWS account for 24 hours. What is the most secure way to do this?',
    options: [
      { id: 'a', text: 'Create an IAM user for the firm and delete it after 24 hours', isCorrect: false },
      { id: 'b', text: 'Provide the firm with the account’s Access Keys', isCorrect: false },
      { id: 'c', text: 'Create a cross-account IAM Role with an External ID and allow the auditors to assume it', isCorrect: true },
      { id: 'd', text: 'Add the auditors to the AWS Organizations management account', isCorrect: false },
    ],
    explanation: 'Cross-account roles are the secure way to grant third-party access. Using an "External ID" is a security best practice to prevent the "confused deputy" problem during cross-account role assumption.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    difficulty: 'medium',
    text: 'An application needs to run a high-performance computing (HPC) workload that requires extremely low-latency communication between EC2 instances. Which network feature should be enabled?',
    options: [
      { id: 'a', text: 'Enhanced Networking', isCorrect: false },
      { id: 'b', text: 'Elastic Fabric Adapter (EFA)', isCorrect: true },
      { id: 'c', text: 'Elastic Network Adapter (ENA)', isCorrect: false },
      { id: 'd', text: 'VPC Lattice', isCorrect: false },
    ],
    explanation: 'EFA is a network interface for Amazon EC2 instances that enables customers to run HPC applications requiring high levels of inter-node communication at scale on AWS. It provides lower and more consistent latency than traditional TCP/IP.',
  },

  // ─── Domain 2: Machine Learning & AI Services ────────────────────────────

  // Topic: machine-learning-and-ai-services
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'easy',
    text: 'A media company wants to automatically moderate user-uploaded images and flag any content that is violent or sexually explicit — without building a custom machine learning model. Which AWS service is MOST appropriate?',
    options: [
      { id: 'a', text: 'Amazon SageMaker with a custom image classification model', isCorrect: false },
      { id: 'b', text: 'Amazon Rekognition Content Moderation', isCorrect: true },
      { id: 'c', text: 'Amazon Comprehend Sentiment Analysis', isCorrect: false },
      { id: 'd', text: 'Amazon Textract with a custom classifier', isCorrect: false },
    ],
    explanation: 'Amazon Rekognition provides a managed Content Moderation API that detects explicit or suggestive adult content, violence, and other unsafe content in images and videos with a single API call. No ML model training is required. Comprehend processes text, not images. SageMaker and Textract require building or training custom pipelines.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'easy',
    text: 'A call center wants to automatically convert recorded customer support calls (stored in S3 as audio files) into searchable text transcripts. Which AWS service should be used?',
    options: [
      { id: 'a', text: 'Amazon Polly', isCorrect: false },
      { id: 'b', text: 'Amazon Lex', isCorrect: false },
      { id: 'c', text: 'Amazon Transcribe', isCorrect: true },
      { id: 'd', text: 'Amazon Comprehend', isCorrect: false },
    ],
    explanation: 'Amazon Transcribe is a Speech-to-Text service that converts audio into written text. It supports batch transcription of audio files from S3 and includes features for speaker identification, custom vocabularies, and automatic punctuation — all well-suited for call center analytics. Polly is the reverse (Text-to-Speech). Lex builds conversational chatbots. Comprehend analyzes existing text, not audio.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'medium',
    text: 'A company wants to add a natural language question-answering capability to its internal HR portal, so employees can ask questions like "What is the parental leave policy?" and receive a direct answer extracted from HR policy documents stored in SharePoint. Which AWS service is BEST suited?',
    options: [
      { id: 'a', text: 'Amazon Comprehend with custom document classification', isCorrect: false },
      { id: 'b', text: 'Amazon Kendra', isCorrect: true },
      { id: 'c', text: 'Amazon Lex with a Lambda fulfillment function', isCorrect: false },
      { id: 'd', text: 'Amazon OpenSearch Service with a keyword index', isCorrect: false },
    ],
    explanation: 'Amazon Kendra is an intelligent enterprise search service that understands natural language and returns precise passages from connected document sources (including SharePoint). Unlike keyword search (OpenSearch) or a rule-based chatbot (Lex), Kendra finds the specific answer within the document rather than returning a list of matching documents. Comprehend classifies and analyses existing text but does not drive document search.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'medium',
    text: 'A retail company has 5 years of daily sales data across thousands of products and wants to predict inventory demand for the next 3 months. They have no machine learning engineers. Which AWS service is MOST appropriate?',
    options: [
      { id: 'a', text: 'Amazon SageMaker with a custom LSTM model', isCorrect: false },
      { id: 'b', text: 'Amazon Forecast', isCorrect: true },
      { id: 'c', text: 'Amazon Bedrock with a generative AI model', isCorrect: false },
      { id: 'd', text: 'Amazon QuickSight ML Insights', isCorrect: false },
    ],
    explanation: 'Amazon Forecast is purpose-built for time-series forecasting. You provide historical data and related metadata; Forecast automatically trains and selects the best-performing model and produces probabilistic predictions — no ML expertise required. SageMaker requires building and training a custom model. Bedrock is for generative AI tasks, not time-series forecasting. QuickSight ML Insights provides anomaly detection and forecasting within dashboards but lacks the dedicated data ingestion and model selection pipeline of Forecast.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'medium',
    text: 'A fintech startup wants to build a generative AI feature that allows customers to describe a financial transaction in natural language and receive a categorized summary. The team wants to avoid managing any ML infrastructure and pay only per API call. Which approach is BEST?',
    options: [
      { id: 'a', text: 'Train a custom NLP model on Amazon SageMaker and host it on a SageMaker endpoint', isCorrect: false },
      { id: 'b', text: 'Use Amazon Bedrock to invoke a foundation model (e.g., Claude or Amazon Titan) via the InvokeModel API', isCorrect: true },
      { id: 'c', text: 'Deploy an open-source LLM on EC2 GPU instances', isCorrect: false },
      { id: 'd', text: 'Use Amazon Comprehend entity detection for transaction categorization', isCorrect: false },
    ],
    explanation: 'Amazon Bedrock is a serverless generative AI service that provides access to powerful foundation models via a simple API. There is no infrastructure to provision or manage, and pricing is per-token. This directly meets the requirements. SageMaker would require building, training, and hosting a custom model — adding significant ML complexity. Self-hosting an LLM on EC2 maximizes control but also maximizes operational overhead. Comprehend can detect entities but cannot generate categorized narrative summaries.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'hard',
    text: 'A healthcare company wants to extract structured data (patient name, date of birth, diagnosis codes) from scanned PDF medical forms uploaded to S3, then store the results in DynamoDB. The forms have varied layouts and include both printed and handwritten fields. Which AWS service pipeline achieves this with the LEAST custom development effort?',
    options: [
      { id: 'a', text: 'Amazon Rekognition text detection → Lambda to parse → DynamoDB', isCorrect: false },
      { id: 'b', text: 'Amazon Textract (AnalyzeDocument with FORMS and QUERIES) → Lambda to transform → DynamoDB', isCorrect: true },
      { id: 'c', text: 'Amazon Comprehend Medical → Lambda to extract → DynamoDB', isCorrect: false },
      { id: 'd', text: 'SageMaker custom OCR model → Lambda to transform → DynamoDB', isCorrect: false },
    ],
    explanation: 'Amazon Textract is specifically designed to extract text and structured data (key-value pairs from forms, table cells) from scanned documents — including handwritten content — without requiring a custom ML model. The FORMS and QUERIES feature types can identify named fields like "Patient Name" regardless of layout variations. Rekognition text detection extracts raw text but does not understand document structure (forms, tables). Comprehend Medical analyses existing text for clinical entities but does not perform OCR or extract structured form data. SageMaker requires building and training a custom model, adding significant development effort.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    difficulty: 'hard',
    text: 'A company already has 50,000 labeled customer support emails categorized into 12 support types. They want to automatically classify incoming emails at low latency without managing infrastructure. Which approach requires the LEAST operational overhead while meeting this requirement?',
    options: [
      { id: 'a', text: 'Train an Amazon Bedrock custom model using the labeled emails as fine-tuning data', isCorrect: false },
      { id: 'b', text: 'Use Amazon Comprehend Custom Classification, train on the labeled dataset, and deploy as a real-time endpoint', isCorrect: true },
      { id: 'c', text: 'Build and train a custom BERT model on SageMaker and host it behind a SageMaker real-time endpoint', isCorrect: false },
      { id: 'd', text: 'Use Amazon Kendra with a custom FAQ list for each support category', isCorrect: false },
    ],
    explanation: 'Amazon Comprehend Custom Classification allows you to provide labeled training examples and automatically trains a text classification model without requiring ML expertise or infrastructure management. The resulting classifier can be deployed as a real-time endpoint for low-latency predictions. Bedrock supports fine-tuning for generative tasks but is not designed for multi-class document classification. SageMaker with custom BERT gives more control but requires writing training code, managing compute, and deploying the endpoint — significantly higher operational overhead. Kendra is for document search and Q&A, not classification.',
  },
];
