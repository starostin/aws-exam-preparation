export interface SeedFlashcard {
  topicSlug: string;
  front: string;
  back: string;
}

export const SAA_FLASHCARDS: SeedFlashcard[] = [

  // ─── Domain 1: Design Resilient Architectures ─────────────────────────────

  // Topic: multi-tier-fault-tolerant-architecture
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'What is the minimum number of Availability Zones recommended for a highly available multi-tier architecture?',
    back: 'Two (2) Availability Zones. Distributing resources across at least two AZs ensures the application survives a single AZ failure. A third AZ further improves resilience but two is the minimum for HA.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'What happens during an Amazon RDS Multi-AZ failover?',
    back: 'RDS automatically updates the endpoint DNS (CNAME) to point to the standby instance in a different AZ. The standby is promoted to primary. No application connection string changes are required. Failover typically completes in 1–2 minutes.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'What is the difference between an RDS Multi-AZ standby and a Read Replica?',
    back: 'Multi-AZ standby: synchronous replication, no reads allowed, automatic failover for HA.\nRead Replica: asynchronous replication, serves read traffic, manual promotion. Multi-AZ is for durability; Read Replicas are for read scalability.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'Why is storing session state on EC2 instance local storage a problem in an auto-scaled fleet?',
    back: 'When a user\'s request is routed to a different instance (after a scale-in or failure), their session data is lost. Session state must be stored externally — in ElastiCache Redis or DynamoDB — to make instances stateless and interchangeable.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'How does an SQS queue improve fault tolerance between the web and application tiers?',
    back: 'SQS decouples the tiers. If the application tier is slow or fails, messages buffer in the queue. The web tier continues accepting requests without waiting for the app tier. Auto Scaling on the app tier can then scale based on queue depth (ApproximateNumberOfMessagesVisible metric).',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'What is the role of an Application Load Balancer health check in a fault-tolerant architecture?',
    back: 'The ALB periodically sends HTTP/HTTPS requests to each registered target. If a target fails the health check threshold, the ALB stops routing traffic to it. Traffic shifts automatically to healthy instances, preventing users from hitting a broken backend.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'Why should an Auto Scaling group span multiple Availability Zones?',
    back: 'If one Availability Zone fails, the Auto Scaling group can keep serving traffic from healthy AZs and launch replacement instances there. Combined with a load balancer, this is a core AWS pattern for high availability and self-healing.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'Why should shared uploads and static assets be stored outside EC2 instances in a resilient architecture?',
    back: 'Files stored on a single EC2 instance are lost if that instance fails, is terminated, or traffic shifts to another instance. Storing assets in S3 or shared files in EFS keeps the application tier stateless and fault tolerant.',
  },

  // Topic: disaster-recovery-and-backup
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'What are the four AWS disaster recovery strategies, ordered from lowest to highest cost?',
    back: '1. Backup & Restore – cheapest, highest RTO/RPO (hours)\n2. Pilot Light – core services running, scale up on disaster\n3. Warm Standby – scaled-down full clone, minutes RTO\n4. Multi-Site Active/Active – full duplicate, near-zero RTO/RPO, most expensive',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'What is the difference between RTO and RPO?',
    back: 'RTO (Recovery Time Objective): maximum acceptable time to restore service after an outage.\nRPO (Recovery Point Objective): maximum acceptable amount of data loss measured in time (e.g., "we can lose up to 1 hour of data").\nLower RTO/RPO = more expensive, more complex recovery strategy.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'In a Pilot Light DR strategy, what is "always running" vs. what is provisioned on failover?',
    back: 'Always running: core database tier (e.g., RDS with replication), possibly with minimal compute.\nProvisioned on failover: web/application tier EC2 instances are launched from AMIs, Auto Scaling groups are activated, DNS is updated. Lower cost at rest, higher RTO than Warm Standby.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'How does AWS Backup help with cross-region disaster recovery?',
    back: 'AWS Backup centralises backup policies across many AWS services (EC2, EBS, RDS, DynamoDB, EFS, FSx). Cross-region copy rules automatically replicate recovery points to a secondary region, reducing RPO without manual scripting.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'What S3 feature helps protect against accidental deletion and supports RPO goals?',
    back: 'S3 Versioning keeps all versions of every object, including deleted ones (via delete markers). Combined with S3 Cross-Region Replication (CRR), it enables recovery from accidental deletion and provides a geographically redundant copy for DR.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'When should you choose Warm Standby over Pilot Light for disaster recovery?',
    back: 'Choose Warm Standby when you need a lower RTO because a scaled-down but fully functional environment is already running in the recovery Region. Pilot Light is cheaper, but more infrastructure must be launched during failover, so recovery takes longer.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'How do cross-Region read replicas support disaster recovery for relational databases?',
    back: 'A cross-Region read replica keeps an asynchronously replicated copy of the database in another Region. In a regional disaster, you can promote the replica to become the new primary. This improves RPO and recovery speed, but replication lag means some recent writes can still be lost.',
  },

  // Topic: event-driven-and-messaging
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is the key difference between SQS Standard and SQS FIFO queues?',
    back: 'Standard: at-least-once delivery, best-effort ordering, unlimited throughput.\nFIFO: exactly-once processing, strict ordering (by MessageGroupId), 300 msg/s (3,000 with batching). Use FIFO when order and deduplication matter; Standard for maximum throughput.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is the SQS visibility timeout and why does it matter?',
    back: 'After a consumer receives a message, the message remains in the queue but becomes invisible for the visibility timeout duration. If the consumer doesn\'t delete it before the timeout expires, the message reappears for another consumer. Set the timeout longer than the maximum processing time to avoid duplicate processing.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is the difference between SNS and SQS?',
    back: 'SNS: pub/sub, push-based, fan-out to multiple subscribers (SQS, Lambda, HTTP, email) simultaneously.\nSQS: pull-based queue for single consumer (or competing consumers), stores messages for later processing.\nCommon pattern: SNS → multiple SQS queues (fan-out) for parallel, independent processing.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is Amazon EventBridge and when should you use it over SNS?',
    back: 'EventBridge is a serverless event bus with content-based filtering, schema registry, and cross-account/partner event support. Use it when: routing rules depend on event content, integrating with SaaS partners (e.g. Shopify, Zendesk), or building complex event-driven workflows. SNS is simpler for basic fan-out without content filtering.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is an SQS Dead Letter Queue (DLQ) and when is it triggered?',
    back: 'A DLQ receives messages that fail processing after a configurable number of receive attempts (maxReceiveCount). It prevents poison-pill messages from blocking the main queue. You can inspect DLQ messages for debugging and replay them after fixing the processing bug.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is SQS long polling and why is it recommended?',
    back: 'Long polling lets SQS wait for messages to arrive before returning a response instead of immediately returning empty results. It reduces the number of empty API calls, lowers cost, and improves efficiency compared with short polling.',
  },
  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What do MessageGroupId and MessageDeduplicationId do in an SQS FIFO queue?',
    back: 'MessageGroupId preserves ordering within a group of related messages. MessageDeduplicationId prevents duplicate messages from being processed within the deduplication window. Together they provide ordered, exactly-once processing behavior for FIFO use cases.',
  },

  // Topic: edge-and-global-routing
  {
    topicSlug: 'edge-and-global-routing',
    front: 'What are the main Route 53 routing policies and their use cases?',
    back: 'Simple: single resource, no health checks.\nWeighted: split traffic by percentage (blue-green, A/B testing).\nLatency-based: route to lowest-latency region.\nFailover: active-passive HA with health checks.\nGeolocation: route by user country/continent.\nGeoproximity: route by geographic distance (with bias).\nMultivalue Answer: returns multiple IPs, basic client-side load balancing.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    front: 'What is Amazon CloudFront and what are its main benefits?',
    back: 'CloudFront is a global CDN with 400+ edge locations. Benefits: low-latency content delivery (cached at edge), DDoS protection (integrated with Shield Standard), TLS termination at edge, Lambda@Edge/CloudFront Functions for edge logic, reduced origin load and cost.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    front: 'What does AWS Global Accelerator do differently from CloudFront?',
    back: 'Global Accelerator uses the AWS global network (not the public internet) to route TCP/UDP traffic to the nearest healthy endpoint. Unlike CloudFront, it does NOT cache content — it improves availability and performance for non-HTTP workloads (gaming, IoT, VoIP) or APIs requiring static IP addresses.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    front: 'What is a CloudFront Origin Access Control (OAC) and why is it used?',
    back: 'OAC is an identity that allows CloudFront to access a private S3 bucket on behalf of users. It replaces the older Origin Access Identity (OAI). By granting the OAC permission on the S3 bucket policy and blocking direct public access, you ensure users can only reach S3 content through CloudFront.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    front: 'How do Route 53 health checks work with failover routing?',
    back: 'Route 53 health checks monitor the primary endpoint. If it becomes unhealthy, failover routing automatically returns the secondary record instead. This is a common SAA-C03 pattern for active-passive disaster recovery, especially with public endpoints across regions.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    front: 'What is the difference between a Route 53 Alias record and a CNAME record?',
    back: 'An Alias record is an AWS-specific record type that can point to AWS resources such as ALB, CloudFront, or S3 website endpoints and can be used at the zone apex. A CNAME cannot be used at the root domain and points only to another domain name. Alias queries to AWS targets are free.',
  },
  {
    topicSlug: 'edge-and-global-routing',
    front: 'When should you use CloudFront signed URLs or signed cookies?',
    back: 'Use signed URLs or signed cookies when you need to restrict access to private content distributed through CloudFront. Signed URLs are best for individual files; signed cookies are better when a user needs access to multiple protected files without generating a separate URL for each one.',
  },

  // ─── Domain 2: Design High-Performing Architectures ───────────────────────

  // Topic: compute-selection-and-scaling
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What are the three EC2 Auto Scaling scaling policy types?',
    back: 'Target Tracking: maintains a metric at a target value (e.g., CPU at 50%); AWS manages scaling.\nStep Scaling: scales by defined amounts based on CloudWatch alarm thresholds; supports warm-up time.\nScheduled Scaling: scales at a specific time (e.g., every Monday 8 AM for predictable load).',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'When should you use AWS Lambda instead of EC2 for compute?',
    back: 'Lambda is ideal for: event-driven, short-duration workloads (max 15 min), unpredictable traffic bursts, no server management, pay-per-invocation. Use EC2 when: workloads run longer than 15 min, need custom OS/runtime, require persistent connections, or need fine-grained CPU/memory control.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What is the difference between ECS on EC2 and ECS on Fargate?',
    back: 'ECS on EC2: you manage and pay for the underlying EC2 instances; more control, lower per-unit cost at scale.\nFargate: serverless container execution, no cluster management, pay per task vCPU/memory-second. Fargate is easier to operate; EC2 launch type is preferred for cost optimisation at high, predictable scale.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What EC2 purchasing options exist and when is each most cost-effective?',
    back: 'On-Demand: flexible, short-term, no commitment.\nReserved (1 or 3 year): steady-state, predictable workloads (up to 72% savings).\nSavings Plans: flexible commitment by spend (Compute or EC2).\nSpot: fault-tolerant, interruption-tolerant batch/stateless workloads (up to 90% savings).\nDedicated Hosts: compliance/licensing requirements.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What metric does Auto Scaling use out-of-the-box to scale based on SQS queue depth?',
    back: 'There is no native target tracking integration, but you can scale on the custom metric ApproximateNumberOfMessagesVisible (from CloudWatch for SQS). Divide by the number of current instances to get "backlog per instance" and set a target for that value. This is a common pattern for queue-based worker fleets.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What is the difference between Lambda Reserved Concurrency and Provisioned Concurrency?',
    back: 'Reserved Concurrency sets aside a maximum and guaranteed portion of account concurrency for a function. Provisioned Concurrency keeps function environments pre-initialized to reduce cold starts. Reserved Concurrency controls capacity limits; Provisioned Concurrency improves startup latency.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'When is horizontal scaling preferred over vertical scaling?',
    back: 'Horizontal scaling is preferred when you want higher availability, better fault tolerance, and elasticity by adding more instances behind a load balancer. Vertical scaling increases the size of one server, but it has limits and creates a larger single point of failure.',
  },

  // Topic: storage-performance-patterns
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What is the difference between EBS gp3 and io2 volume types?',
    back: 'gp3: general purpose SSD, up to 16,000 IOPS and 1,000 MB/s throughput, independently configurable, cost-effective.\nio2 / io2 Block Express: provisioned IOPS SSD, up to 256,000 IOPS, 99.999% durability, for I/O-intensive databases requiring guaranteed low latency. io2 costs more but is required for extreme IOPS.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What S3 storage class should you use for data accessed less than once per month but that needs immediate retrieval?',
    back: 'S3 Standard-Infrequent Access (S3 Standard-IA) or S3 One Zone-IA. Standard-IA has the same millisecond retrieval as S3 Standard but charges a per-GB retrieval fee. Use One Zone-IA when data can be recreated if an AZ is lost (lower cost, single AZ only).',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'When should you use Amazon EFS vs Amazon EBS?',
    back: 'EBS: block storage attached to a single EC2 instance (except Multi-Attach io1/io2 in limited scenarios), low latency, suitable for databases and OS drives.\nEFS: shared POSIX file system mounted by many EC2 instances simultaneously, elastic scaling, suitable for shared home directories, CMS content, and container storage.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What is S3 Transfer Acceleration and when should you enable it?',
    back: 'S3 Transfer Acceleration routes uploads through the nearest CloudFront edge location and then across the optimised AWS backbone to the S3 bucket. Enable it when users upload large files from geographically distant locations. Not beneficial for transfers within the same region.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What is an S3 multipart upload and when is it required?',
    back: 'Multipart upload breaks a large object into parts uploaded in parallel, then assembled in S3. Required for objects ≥ 5 GB. Recommended above 100 MB for better throughput and the ability to retry failed parts without restarting the entire upload.',
  },
    {
      topicSlug: 'storage-performance-patterns',
      front: 'What is the difference between Amazon FSx for Windows File Server and Amazon EFS?',
      back: 'FSx for Windows File Server provides a managed SMB file system for Windows workloads and can integrate with Active Directory, NTFS permissions, and DFS. EFS provides a managed NFS file system for Linux-based workloads and shared POSIX access. Use FSx for Windows apps; use EFS for Linux fleets and containers.',
    },
    {
      topicSlug: 'storage-performance-patterns',
      front: 'How do EBS snapshots store data and why are repeated snapshots cheaper?',
      back: 'EBS snapshots are incremental and stored in S3. The first snapshot copies all blocks on the volume, but later snapshots save only changed blocks since the previous snapshot. That reduces storage consumed and speeds up recurring backups.',
    },
    {
      topicSlug: 'storage-performance-patterns',
      front: 'What is EBS Multi-Attach and when should you use it?',
      back: 'EBS Multi-Attach allows a single io1 or io2 volume to be attached to multiple EC2 instances in the same Availability Zone at the same time. It is for cluster-aware applications that coordinate shared block storage. It is not a replacement for a shared file system like EFS.',
    },
    {
      topicSlug: 'storage-performance-patterns',
      front: 'What does S3 strong read-after-write consistency mean?',
      back: 'After a successful PUT, overwrite, or DELETE, any subsequent read or list request immediately returns the latest version of the object. You no longer need to design around eventual consistency for standard S3 object operations.',
    },
    {
      topicSlug: 'storage-performance-patterns',
      front: 'What is the difference between EFS General Purpose and Max I/O performance modes?',
      back: 'General Purpose delivers lower latency for most applications and is the default choice. Max I/O supports higher levels of aggregate throughput and parallelism for large-scale workloads, but with higher latency. Choose General Purpose unless you specifically need very high distributed throughput.',
    },

  // Topic: database-performance-and-caching
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is the difference between ElastiCache Redis and Memcached?',
    back: 'Redis: supports data structures (lists, sets, sorted sets), persistence, pub/sub, replication, Multi-AZ with automatic failover, Lua scripting. Use for sessions, leaderboards, pub/sub.\nMemcached: simpler, multi-threaded, horizontal scaling, no persistence. Use for pure high-throughput object caching.\nFor most SAA-C03 scenarios, Redis is the answer.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is Amazon Aurora and how does it differ from standard RDS?',
    back: 'Aurora is an AWS-built relational engine compatible with MySQL and PostgreSQL. It uses shared distributed storage (6 copies across 3 AZs), supports up to 15 read replicas with < 10 ms replica lag, auto-scales storage up to 128 TiB, and offers faster failover than standard RDS Multi-AZ.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'When should you use DynamoDB instead of an RDS database?',
    back: 'DynamoDB is ideal for: single-digit millisecond performance at any scale, serverless/NoSQL key-value or document access patterns, unpredictable or massive scale, no complex joins or transactions needed (though basic transactions are supported). Avoid if you need complex SQL queries, flexible schema with joins, or ACID across many tables.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is DynamoDB DAX and what problem does it solve?',
    back: 'DAX (DynamoDB Accelerator) is an in-memory caching layer compatible with the DynamoDB API. It reduces read latency from milliseconds to microseconds for cached items. It is ideal for read-heavy, latency-sensitive applications where the same items are read repeatedly.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is a cache-aside (lazy loading) pattern and how does it work with ElastiCache?',
    back: '1. Application checks cache for data.\n2. Cache hit: return data immediately.\n3. Cache miss: fetch from database, write result to cache, return data.\nData is only loaded into cache when needed. Downside: first request after cache expiry has higher latency (cold miss). Compare with write-through: cache is updated on every write.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is Amazon RDS Proxy and what problem does it solve?',
    back: 'RDS Proxy is a managed database proxy that pools and shares database connections for applications such as Lambda. It reduces connection storms, improves scalability, and helps applications fail over faster to a new database instance.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is the difference between DynamoDB on-demand and provisioned capacity modes?',
    back: 'On-demand capacity automatically scales based on traffic and is best for unpredictable workloads. Provisioned capacity requires you to set read and write capacity ahead of time and is more cost-effective for predictable steady traffic, especially with auto scaling.',
  },

  // Topic: network-performance-and-hybrid
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is the difference between AWS Direct Connect and AWS Site-to-Site VPN?',
    back: 'Direct Connect: dedicated private physical connection, consistent low latency, high bandwidth (1–100 Gbps), no internet traversal. Expensive, 1–3 months to provision.\nSite-to-Site VPN: encrypted tunnel over the public internet, set up in minutes, lower cost, variable latency. Use VPN as a backup to Direct Connect or for quick hybrid connectivity.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is a VPC Endpoint and what are the two types?',
    back: 'VPC Endpoints allow private access to AWS services without traversing the internet.\nInterface Endpoint: ENI with private IP, powered by AWS PrivateLink. Works with most services (e.g., SSM, Secrets Manager, KMS).\nGateway Endpoint: added to route table, free, only for S3 and DynamoDB.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is AWS Transit Gateway and what problem does it solve?',
    back: 'Transit Gateway is a hub-and-spoke network transit hub that connects VPCs and on-premises networks through a single gateway. Without it, connecting N VPCs requires N×(N-1)/2 peering connections. TGW simplifies the network, supports transitive routing, and can attach to Direct Connect and VPN.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is Placement Group and when is each type used?',
    back: 'Cluster: packs instances close together in a single AZ for the lowest network latency and highest bandwidth (HPC, big data). Single point of failure.\nSpread: distributes instances across distinct hardware (max 7 per AZ); reduces simultaneous hardware failure risk.\nPartition: divides instances into logical partitions on separate hardware (HDFS, Kafka, Cassandra).',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is the difference between VPC Peering and Transit Gateway?',
    back: 'VPC Peering creates a direct one-to-one connection between two VPCs, but it is not transitive and does not scale well across many VPCs. Transit Gateway is a central hub that supports transitive routing between many VPCs and on-premises networks. Peering is fine for a small number of VPCs; TGW is better for larger hub-and-spoke topologies.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is a NAT Gateway and what are its main cost and security tradeoffs?',
    back: 'A NAT Gateway lets instances in private subnets initiate outbound internet access without allowing inbound internet connections. It improves security by keeping private instances non-addressable from the internet, but it adds hourly charges plus per-GB data processing charges. Use VPC Endpoints for S3 and DynamoDB to avoid unnecessary NAT data transfer costs.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What are Route 53 Resolver inbound and outbound endpoints used for?',
    back: 'Inbound endpoints let on-premises DNS resolvers forward queries into Route 53 Resolver so they can resolve private AWS names. Outbound endpoints let Route 53 Resolver forward queries from AWS to on-premises DNS servers. They are used in hybrid DNS architectures where workloads need private name resolution across environments.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is Accelerated Site-to-Site VPN and when is it useful?',
    back: 'Accelerated Site-to-Site VPN uses the AWS global network to improve the path between a remote site and AWS, often reducing latency and jitter compared with standard internet-based VPN routing. Use it when you need quicker VPN setup than Direct Connect but want more consistent performance for long-distance hybrid connectivity.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'Why is Direct Connect often paired with a Site-to-Site VPN?',
    back: 'Direct Connect provides consistent private connectivity, but it is common to pair it with a VPN for backup. If the Direct Connect link fails, the VPN can maintain connectivity over the internet. This is a classic hybrid resilience pattern on the SAA exam.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'Why can overlapping CIDR ranges prevent VPC peering?',
    back: 'VPC peering does not support overlapping IP address ranges because routing would be ambiguous. If two VPCs overlap, use alternatives such as AWS PrivateLink, Transit Gateway with redesign, or NAT-based patterns instead of direct peering.',
  },

  // ─── Domain 3: Design Secure Applications and Architectures ───────────────

  // Topic: identity-access-and-governance
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is the principle of least privilege in IAM?',
    back: 'Grant only the permissions required to perform a specific task, nothing more. Start with no permissions and add only what is needed. Use condition keys and resource-level permissions to restrict access further. Regularly review and revoke unused permissions.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is the difference between an IAM Role and an IAM User?',
    back: 'IAM User: permanent long-term credentials (access key + secret) for a specific person or service. Not recommended for applications.\nIAM Role: temporary credentials via STS, assumed by EC2, Lambda, ECS tasks, other accounts, or federated users. Preferred for applications, cross-account access, and temporary elevation.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What are Service Control Policies (SCPs) and where do they apply?',
    back: 'SCPs are AWS Organizations policies that define the maximum permissions available to accounts in an OU or the entire organisation. They do NOT grant permissions — they act as guardrails that RESTRICT what IAM policies in member accounts can allow. The root account is also subject to SCPs (except in the management account).',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is the AWS IAM policy evaluation logic (simplified)?',
    back: '1. By default, all requests are DENIED (implicit deny).\n2. An explicit ALLOW from any applicable policy allows the request.\n3. An explicit DENY from any policy always overrides any allow.\nDeny > Allow > Implicit Deny. SCPs and resource-based policies are also evaluated in this chain.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is AWS IAM Identity Center (formerly SSO) and when is it used?',
    back: 'IAM Identity Center provides centralised workforce single sign-on across multiple AWS accounts and applications. Users authenticate with a corporate identity provider (Okta, Azure AD) or the built-in directory. Recommended for multi-account environments to avoid managing individual IAM users per account.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is the difference between a trust policy and a permissions policy on an IAM role?',
    back: 'A trust policy defines who is allowed to assume the role. A permissions policy defines what the role is allowed to do after it is assumed. Think of trust policy as "who can get in" and permissions policy as "what they can do inside."',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What does AWS STS AssumeRole provide and why is it preferred for applications?',
    back: 'STS AssumeRole issues temporary credentials instead of long-term access keys. This reduces the risk of credential leakage, supports automatic expiration, and is the preferred way for applications and cross-account access to obtain AWS permissions.',
  },

  // Topic: data-protection-and-key-management
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What are the three types of AWS KMS keys?',
    back: 'AWS Managed Keys: created and managed by AWS, free, used automatically by services (e.g., S3-SSE-KMS default). Cannot be deleted or customised.\nCustomer Managed Keys (CMK): created by you, you control rotation and policy, charged per key per month.\nCustomer Provided Keys (SSE-C for S3): you supply and manage keys outside AWS; AWS uses but never stores them.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What is the difference between server-side encryption options for S3?',
    back: 'SSE-S3 (AES-256): AWS manages keys, no extra cost, least control.\nSSE-KMS: keys in KMS, audit trail in CloudTrail, CMK rotation, slight cost per API call.\nSSE-C: customer provides per-request key, AWS encrypts/decrypts but never stores the key.\nClient-side encryption: encrypted before upload; AWS never sees plaintext.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What is AWS Secrets Manager and how does it differ from Parameter Store?',
    back: 'Secrets Manager: purpose-built for secrets (DB passwords, API keys), supports automatic rotation via Lambda, cross-account sharing. Charged per secret per month.\nParameter Store: broader parameter storage (config + secrets with SecureString using KMS), no built-in rotation, lower cost (Standard tier free). Use Secrets Manager when automatic rotation is needed.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What is S3 Object Lock and when is it used?',
    back: 'S3 Object Lock prevents object deletion or overwrite for a fixed or indefinite period (WORM — Write Once Read Many). Used for regulatory compliance (SEC, FINRA), legal holds, and ransomware protection. Two modes: Governance (specific IAM users can override) and Compliance (no one can delete, including root).',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What is envelope encryption in AWS KMS?',
    back: 'Envelope encryption means the actual data is encrypted with a data key, and that data key is then encrypted with a KMS key. This combines strong security with better performance because large amounts of data do not have to be encrypted directly by KMS.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'When would you use AWS CloudHSM instead of AWS KMS?',
    back: 'Use CloudHSM when you need dedicated hardware security modules under your control, custom key management, or compliance requirements that KMS cannot satisfy. KMS is easier and preferred for most workloads; CloudHSM is for stricter security or regulatory needs.',
  },

  // Topic: network-security-controls
  {
    topicSlug: 'network-security-controls',
    front: 'What is the difference between a Security Group and a Network ACL?',
    back: 'Security Group: stateful (return traffic auto-allowed), operates at instance level, allow rules only.\nNetwork ACL: stateless (must explicitly allow inbound AND outbound for each flow), operates at subnet level, allow and deny rules. NACLs are evaluated in rule number order; first match wins.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What does AWS WAF protect against and where can it be deployed?',
    back: 'WAF (Web Application Firewall) filters malicious HTTP/HTTPS traffic using managed or custom rule groups (OWASP Top 10: SQLi, XSS, etc.). Deploy in front of: CloudFront distributions, ALBs, API Gateway, AppSync. Cannot be attached directly to EC2.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What is the difference between AWS Shield Standard and AWS Shield Advanced?',
    back: 'Shield Standard: automatic, always-on DDoS protection at no cost for all AWS customers. Protects against layer 3/4 network-level attacks.\nShield Advanced: paid ($3,000/month), adds layer 7 protection, DDoS cost protection, 24/7 support from the AWS DRT team, and near real-time attack visibility.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What is a private subnet and how does it differ from a public subnet?',
    back: 'Public Subnet: has a route to an Internet Gateway (0.0.0.0/0 → IGW); resources can be directly reachable from the internet if they have an Elastic IP.\nPrivate Subnet: no direct internet route; outbound internet access is via a NAT Gateway placed in a public subnet. Backend servers and databases should always be in private subnets.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What is AWS PrivateLink and what problem does it solve?',
    back: 'PrivateLink allows you to expose a service in your VPC to other VPCs (or AWS customers) without VPC peering or internet traversal. Traffic stays on the AWS network. Enables services to be accessed via Interface Endpoints. Solves CIDR overlap issues that prevent VPC peering.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What is AWS Network Firewall and when should you use it?',
    back: 'AWS Network Firewall is a managed stateful firewall service for inspecting and filtering traffic at the VPC level. Use it when you need centralized layer 3 to layer 7 traffic inspection, domain filtering, or intrusion prevention rules across subnets and VPCs.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'Why do Network ACLs often require ephemeral port rules?',
    back: 'Because Network ACLs are stateless, you must explicitly allow both the inbound request and the outbound response traffic. That means return traffic often needs ephemeral port ranges opened, or otherwise connections will fail even if the primary service port is allowed.',
  },

  // Topic: monitoring-detection-and-response
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What does AWS CloudTrail record and where does it store logs?',
    back: 'CloudTrail records API calls made to AWS services (who, what, when, from where). Logs are stored in an S3 bucket. Enable multi-region trail for complete coverage. CloudTrail is the primary tool for compliance auditing, security investigation, and incident response.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is the difference between CloudWatch Logs, CloudWatch Metrics, and CloudWatch Alarms?',
    back: 'Logs: stores and queries log events (application logs, VPC Flow Logs, Lambda logs).\nMetrics: time-series numerical data points (CPU, request count, custom metrics).\nAlarms: watch a metric and trigger actions (SNS notification, Auto Scaling, EC2 stop/start) when a threshold is breached.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is Amazon GuardDuty and what data sources does it analyse?',
    back: 'GuardDuty is a threat detection service using machine learning to identify malicious activity. Data sources: CloudTrail event logs, VPC Flow Logs, Route 53 DNS logs, and optionally S3 access logs, EKS audit logs, and Lambda network activity. Requires no agents and is enabled at the account level.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is AWS Security Hub and how does it relate to other security services?',
    back: 'Security Hub provides a centralised view of security findings across multiple AWS security services (GuardDuty, Inspector, Macie, IAM Access Analyzer, Firewall Manager) and partner tools. It runs automated security checks against CIS AWS Foundations Benchmark and PCI DSS. Good for a single-pane security posture view.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is VPC Flow Logs and what do they NOT capture?',
    back: 'Flow Logs capture accepted/rejected IP traffic metadata at the ENI, subnet, or VPC level. They do NOT capture: DNS traffic to the Route 53 resolver, Windows activation traffic, traffic to 169.254.169.254 (instance metadata), DHCP traffic, and mirrored traffic. Flow Logs are stored in CloudWatch Logs or S3.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is AWS Config and how does it differ from CloudTrail?',
    back: 'AWS Config records resource configuration states and tracks how they change over time, helping with compliance and drift detection. CloudTrail records API activity. Config answers "what changed in the resource configuration" while CloudTrail answers "who made the API call."',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What does Amazon Inspector assess?',
    back: 'Amazon Inspector continuously scans supported workloads such as EC2 instances, container images, and Lambda functions for software vulnerabilities and unintended network exposure. It helps identify patching and exposure issues before they become incidents.',
  },

  // ─── Domain 4: Design Cost-Optimized Architectures ────────────────────────

  // Topic: cost-aware-architecture-decisions
  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'What are the five pillars of the AWS Well-Architected Framework?',
    back: '1. Operational Excellence\n2. Security\n3. Reliability\n4. Performance Efficiency\n5. Cost Optimization\n(A sixth pillar, Sustainability, was added later.)\nFor the SAA-C03 exam, focus on Reliability, Security, Performance Efficiency, and Cost Optimization.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'When is serverless (Lambda + API Gateway + DynamoDB) more cost-effective than always-on EC2?',
    back: 'Serverless is most cost-effective for: irregular or bursty traffic, low average utilisation, short-running tasks. Pay only per invocation and GB-second. EC2 costs accrue whether idle or busy. If traffic is consistently high and predictable, Reserved EC2 + RDS will usually be cheaper due to serverless invocation costs at scale.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'What are S3 Intelligent-Tiering costs and when does it make sense?',
    back: 'S3 Intelligent-Tiering automatically moves objects between Frequent, Infrequent, and Archive tiers based on access patterns at a small monitoring cost per object. It makes sense when access patterns are unknown or variable. For data you know is always hot, Standard is cheaper; for data you know is always cold, Glacier is cheaper.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'When should you choose Reserved Instances or Savings Plans over On-Demand pricing?',
    back: 'Choose Reserved Instances or Savings Plans for steady-state workloads that run continuously or predictably over 1 or 3 years. They trade commitment for lower cost. Use On-Demand when workloads are short-lived, unpredictable, or likely to change significantly.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'When is Single-AZ deployment cheaper but less appropriate than Multi-AZ?',
    back: 'Single-AZ is cheaper because you pay for fewer redundant resources, but it is less resilient. Use it for non-critical dev, test, or workloads that can tolerate downtime. For production systems that require high availability, Multi-AZ is usually the right architecture despite higher cost.',
  },
  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'When is S3 One Zone-IA cheaper than Standard-IA and what is the tradeoff?',
    back: 'S3 One Zone-IA is cheaper for infrequently accessed data that can be recreated if an Availability Zone is lost. The tradeoff is lower resilience because objects are stored in only one AZ. Use Standard-IA when you still need multi-AZ durability.',
  },

  // Topic: compute-cost-optimization
  {
    topicSlug: 'compute-cost-optimization',
    front: 'What is the difference between EC2 Savings Plans and Compute Savings Plans?',
    back: 'EC2 Savings Plans: commit to a specific instance family in a specific region (e.g., m5 in us-east-1). Up to 72% savings. Less flexible.\nCompute Savings Plans: apply across any instance family, region, OS, and tenancy. Also cover Lambda and Fargate. Up to 66% savings. More flexible, slightly lower discount.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    front: 'What workloads are best suited for EC2 Spot Instances?',
    back: 'Workloads that can tolerate a 2-minute interruption notice and be restarted. Best uses: batch processing, scientific simulations, rendering, CI/CD build agents, stateless web tier with mix of On-Demand + Spot. NOT suitable for: databases, stateful applications, critical real-time systems.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    front: 'What is AWS Compute Optimizer and what does it recommend?',
    back: 'Compute Optimizer analyses utilisation metrics (CloudWatch) and recommends right-sized resources for EC2 instances, EBS volumes, Lambda functions, ECS on Fargate, and Auto Scaling groups. It uses machine learning to suggest over-provisioned or under-provisioned resources, potentially finding significant cost savings.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    front: 'What is the Lambda pricing model?',
    back: 'Lambda charges based on: number of invocations (first 1M free per month) + duration in GB-seconds (memory allocated × time in seconds, billed in 1-ms increments). No charges when idle. Additional costs for Provisioned Concurrency, storage beyond 512 MB, and data transfer.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    front: 'Why do AWS Graviton instances often improve cost optimization?',
    back: 'Graviton instances use AWS-designed ARM-based processors and often deliver better price-performance than comparable x86 instances. They are a common exam answer when the requirement is to reduce compute cost without sacrificing performance for supported workloads.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    front: 'How can scheduling non-production resources reduce AWS costs?',
    back: 'Development and test resources often do not need to run 24/7. Automatically stopping EC2 instances or scaling down environments outside business hours can significantly reduce compute spend without changing the architecture.',
  },

  // Topic: storage-and-data-transfer-optimization
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What is an S3 Lifecycle policy and what transitions can it perform?',
    back: 'An S3 Lifecycle policy automates the transition of objects between storage classes or expiration after a set number of days. Allowed transitions (in order): Standard → Standard-IA → One Zone-IA → Glacier Instant Retrieval → Glacier Flexible Retrieval → Glacier Deep Archive. Cannot transition backwards.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What are the data retrieval times and typical use cases for S3 Glacier storage classes?',
    back: 'Glacier Instant Retrieval: millisecond retrieval, data accessed ~once per quarter.\nGlacier Flexible Retrieval: minutes to hours (Expedited 1–5 min, Standard 3–5 hr, Bulk 5–12 hr), archives, compliance.\nGlacier Deep Archive: 12–48 hours retrieval, cheapest, long-term compliance archives (7+ years).',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What are the main data transfer cost patterns in AWS to design around?',
    back: 'Free: data INTO AWS, data between services in the same AZ using private IPs.\nCharged: data OUT of AWS to internet, data between AZs, data between regions.\nKey design patterns: use VPC Endpoints to avoid internet NAT charges, keep compute and data in the same AZ for cross-AZ savings, use CloudFront to reduce direct S3 egress costs.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What is AWS Snow Family and when is it used for data transfer?',
    back: 'AWS Snowball Edge / Snowcone / Snowmobile are physical devices for offline data transfer when the internet is too slow, costly, or unavailable.\nRule of thumb: If transferring over the internet would take more than a week, Snow Family is worth considering.\nSnowball Edge: up to 80 TB, edge compute.\nSnowmobile: up to 100 PB, a literal truck.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What is AWS DataSync and when should you use it?',
    back: 'AWS DataSync is an online data transfer service for moving large amounts of data between on-premises storage and AWS services such as S3, EFS, and FSx. It handles parallel transfer, encryption, scheduling, and integrity checks. Use it when you need recurring or one-time bulk transfers over the network without building custom copy tooling.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What is AWS Transfer Family and which protocols does it support?',
    back: 'AWS Transfer Family is a managed file transfer service that gives users access to S3 or EFS over traditional file transfer protocols. It supports SFTP, FTPS, FTP, and AS2. Use it when business partners or legacy systems need standard file transfer interfaces instead of direct AWS APIs.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What is AWS Storage Gateway and what are its main deployment modes?',
    back: 'Storage Gateway connects on-premises environments to AWS storage. File Gateway exposes NFS or SMB shares backed by S3. Volume Gateway exposes iSCSI block volumes for cached or stored hybrid storage. Tape Gateway presents virtual tapes for backup applications and stores them in AWS. It is used when you need local access patterns with AWS-backed storage.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'When is CloudFront often more cost-effective than serving downloads directly from S3?',
    back: 'CloudFront is often cheaper for high-volume public content delivery because cached responses reduce repeated origin fetches and CDN data transfer pricing is often better than direct S3 internet egress. It also improves latency for global users and offloads traffic from the bucket origin.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'Why do minimum storage duration charges matter for some S3 storage classes?',
    back: 'Classes such as Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, and Deep Archive have minimum storage duration charges. If you delete or move objects too soon, you still pay as if they were stored for the minimum period, which can erase expected savings.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What extra costs should you expect with S3 Cross-Region Replication?',
    back: 'Cross-Region Replication adds charges for storage of the replicated objects, inter-Region data transfer, and replication requests. It improves durability and disaster recovery, but it is not a free copy mechanism.',
  },

  // Topic: cost-visibility-and-governance
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'What is AWS Cost Explorer and what can it do?',
    back: 'Cost Explorer is a visual cost analysis tool that shows historical spend and usage over time. Features: filter by service/tag/account/region, view Reserved Instance utilisation and coverage, generate savings recommendations, and forecast future spend. Not a budgeting tool — use AWS Budgets for alerts.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'What are AWS Budgets and what types of budgets can you create?',
    back: 'AWS Budgets sends alerts when costs or usage exceed (or are forecast to exceed) a threshold. Types: Cost budget, Usage budget, Reservation utilisation/coverage budget, Savings Plans budget. Alerts can be sent via SNS/email or can trigger actions (e.g., apply an SCP to restrict spending).',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'Why is resource tagging important for cost management?',
    back: 'Tags (key-value pairs on resources) enable cost allocation — you can group costs in Cost Explorer and on invoices by team, environment, project, or cost centre. Cost Allocation Tags must be activated in Billing settings. Without tags it is difficult to attribute costs in shared or multi-team environments.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'What is AWS Organizations and how does it help with cost management?',
    back: 'AWS Organizations groups multiple AWS accounts under a single management account. For cost management: consolidated billing (one invoice for all accounts), volume pricing discounts apply across accounts, reserved instance and Savings Plans sharing across accounts. SCPs enforce guardrails that prevent costly resource creation.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'What does AWS Trusted Advisor provide for cost optimisation?',
    back: 'Trusted Advisor analyses your AWS environment and highlights cost-saving opportunities such as idle load balancers, underutilised EC2 instances, unattached EBS volumes, and low-utilisation reserved resources. It is useful for quickly finding waste across an account without manually reviewing every service.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'What is the AWS Cost and Usage Report (CUR) and when is it used?',
    back: 'The Cost and Usage Report is the most detailed AWS billing dataset. It delivers granular usage and cost records to S3 for analysis in tools such as Athena, Redshift, or QuickSight. Use it when Cost Explorer is too high-level and you need chargeback or deep financial analysis.',
  },
  {
    topicSlug: 'cost-visibility-and-governance',
    front: 'What is the difference between AWS Budgets and Cost Explorer?',
    back: 'AWS Budgets is for alerting when actual or forecasted spend crosses a threshold. Cost Explorer is for visual analysis of historical and forecasted spend trends. Budgets tells you when to react; Cost Explorer helps you understand why costs changed.',
  },
  // ─── Domain 1: Design Resilient Architectures ─────────────────────────────

  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'What is an ASG Warm Pool and how does it reduce RTO?',
    back: 'A pool of pre-initialized EC2 instances (Stopped or Running) that sits alongside an Auto Scaling Group. It reduces RTO for applications with long boot/initialization times (e.g., 15+ mins) by bypassing the boot cycle during scale-out.',
  },
  {
    topicSlug: 'multi-tier-fault-tolerant-architecture',
    front: 'What is the difference between an ALB and an NLB for high-throughput UDP traffic?',
    back: 'ALB: Layer 7 (HTTP/HTTPS/gRPC), supports path/host routing, but NO UDP support. \nNLB: Layer 4 (TCP/UDP/TLS), millions of requests per second, ultra-low latency, provides static IPs or Elastic IPs per AZ.',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'When should you use AWS Elastic Disaster Recovery (DRS) over Backup?',
    back: 'Use Elastic Disaster Recovery (DRS) for continuous block-level replication of physical, virtual, or cloud servers to AWS. It offers sub-second RPO and very low RTO by keeping a staging area ready for cutover. Use Backup for point-in-time recovery.',
  },

  // ─── Domain 2: Design High-Performing Architectures ───────────────────────

  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What is the Elastic Fabric Adapter (EFA) and when is it required?',
    back: 'A specialized network interface for EC2 instances that enhances inter-node communication for High Performance Computing (HPC) and Machine Learning. It uses the "OS Bypass" strategy to achieve lower/more consistent latency than standard TCP/IP.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What is Lambda Provisioned Concurrency and what problem does it solve?',
    back: 'It keeps a specified number of Lambda functions initialized and ready to respond in double-digit milliseconds. It eliminates "Cold Starts" for latency-sensitive applications during sudden bursts of traffic.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What is Amazon FSx for Lustre and what is its relationship with S3?',
    back: 'A high-performance file system for HPC and ML. It can link directly to an S3 bucket, "lazy-loading" data from S3 as files are accessed, and writing results back to S3. It provides sub-millisecond latencies and hundreds of GB/s throughput.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What is S3 Object Lambda and what are its use cases?',
    back: 'Allows you to add custom code (Lambda) to S3 GET requests to transform data on-the-fly. Use cases: redacting PII, resizing images, or converting data formats (JSON to CSV) as the application retrieves the object.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is Aurora Serverless v2 and how does it scale differently from v1?',
    back: 'v2 scales in fractions of a second by adding/removing "Aurora Capacity Units" (ACUs) instantly without disrupting connections. v1 scaled by doubling capacity (e.g., 2 to 4 to 8 units), which was slower and more disruptive.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is the difference between a DynamoDB LSI and GSI?',
    back: 'LSI (Local Secondary Index): Same Partition Key as table, different Sort Key. Created only at table creation. \nGSI (Global Secondary Index): Different Partition Key AND Sort Key. Can be created/deleted any time. GSIs are more flexible for cross-partition queries.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is a Transit Gateway (TGW) Connect attachment?',
    back: 'Used to establish a GRE (Generic Routing Encapsulation) tunnel over a TGW attachment. It allows for higher bandwidth (up to 20 Gbps) and supports BGP for dynamic routing with SD-WAN appliances.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is AWS VPC Lattice and what layer of the OSI model does it operate on?',
    back: 'VPC Lattice is a managed service-to-service networking service. It operates at Layer 7 (Application). It simplifies discovery, connectivity, and security across multiple VPCs/Accounts without complex network-layer routing.',
  },

  // ─── Domain 3: Design Secure Applications and Architectures ───────────────

  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is an IAM Permission Boundary and when is it used?',
    back: 'An advanced feature that sets the "maximum permissions" an IAM entity can have. Used for "delegated administration" — e.g., allowing a developer to create IAM roles for their app, but ensuring those roles cannot exceed the permissions defined in the boundary.',
  },
  {
    topicSlug: 'identity-access-and-governance',
    front: 'What is AWS Resource Access Manager (RAM) and why use it?',
    back: 'Allows you to share specific AWS resources (Subnets, Transit Gateways, License Manager configs) with other accounts or within an Organization. It helps maintain a "Hub and Spoke" network while allowing spoke accounts to build in shared subnets.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What is the "External ID" in a cross-account IAM Role and why is it used?',
    back: 'A security best practice to prevent the "Confused Deputy" problem. When a third party (SaaS provider) assumes a role in your account, the External ID ensures they are accessing your account on your behalf and not someone else\'s.',
  },
  {
    topicSlug: 'data-protection-and-key-management',
    front: 'What is KMS Key Policy vs. IAM Policy for CMKs?',
    back: 'Every CMK MUST have a Key Policy. IAM policies alone cannot grant access to a KMS key; the Key Policy must explicitly allow the account (or specific user) to use IAM policies for that key. Deny in either results in Deny.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What is AWS Firewall Manager and when should you use it over WAF?',
    back: 'Firewall Manager is a security management service that allows you to centrally configure and manage WAF rules, Shield Advanced, and Security Groups across all accounts in an Organization. Use it for consistent compliance across a multi-account environment.',
  },
  {
    topicSlug: 'network-security-controls',
    front: 'What is a Gateway Load Balancer (GWLB) and what is its primary use case?',
    back: 'Used to deploy, scale, and manage third-party virtual appliances (Firewalls, Intrusion Detection/Prevention). It listens at Layer 3 and uses the GENEVE protocol to transparently route traffic to healthy security appliances.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is Amazon Macie and what specific threat does it detect?',
    back: 'A data security service that uses ML to automatically discover, sensitive data (PII/PHI) in S3 buckets. It alerts you if data is unencrypted, publicly accessible, or contains things like credit card numbers/SSNs.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is Amazon Detective and how does it help security teams?',
    back: 'A service that simplifies the investigation of security findings (from GuardDuty or Security Hub). It uses graph-based visualizations to show the "who, what, where" of an incident, helping analysts find the root cause of a threat.',
  },

  // ─── Domain 4: Design Cost-Optimized Architectures ────────────────────────

  {
    topicSlug: 'cost-aware-architecture-decisions',
    front: 'What is AWS Cost Anomaly Detection and why is it better than a Budget?',
    back: 'Cost Anomaly Detection uses Machine Learning to identify unusual spend patterns (spikes) that don\'t fit your history. Budgets are static thresholds; Anomaly Detection can find a $50/day spike in a $10,000 account that a budget would miss.',
  },
  {
    topicSlug: 'compute-cost-optimization',
    front: 'What is the "Capacity Rebalance" feature in EC2 Auto Scaling?',
    back: 'A feature that proactively attempts to replace Spot Instances that are at high risk of interruption. It monitors "Spot Instance interruption notices" and launches a new instance before the 2-minute warning is even sent.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'What is S3 Storage Class Analysis and what is its output?',
    back: 'A tool that monitors access patterns for a subset of your S3 data. It provides recommendations on when to transition data from Standard to Standard-IA. It outputs a report to an S3 bucket daily.',
  },
  {
    topicSlug: 'storage-and-data-transfer-optimization',
    front: 'How can you reduce costs for an application that requires 100 TB of S3 storage and 50 TB of Data Transfer Out monthly?',
    back: '1. Use S3 Intelligent-Tiering to optimize storage class. 2. Use Amazon CloudFront for data delivery (CloudFront egress is often cheaper than S3 egress). 3. Compress data (gzip) before transfer.',
  },

  // ─── Specialized Topics (Serverless, AI, Migration) ────────────────────────

  {
    topicSlug: 'event-driven-and-messaging',
    front: 'What is the difference between AWS Step Functions Standard vs. Express Workflows?',
    back: 'Standard: Up to 1 year duration, exactly-once execution, visual audit history. \nExpress: Max 5 mins, high-throughput (100k+ events/sec), cheaper, at-least-once execution. Use Express for high-volume IoT/messaging; Standard for human-in-the-loop/critical order flows.',
  },
  {
    topicSlug: 'compute-selection-and-scaling',
    front: 'What is Amazon Bedrock and what is its serverless benefit?',
    back: 'A serverless service that provides foundation models (LLMs) via API. The benefit is you don\'t manage any GPU infrastructure or instances; you pay per token/request, making GenAI accessible without architectural overhead.',
  },
  {
    topicSlug: 'database-performance-and-caching',
    front: 'What is Amazon OpenSearch Service (successor to Elasticsearch) used for?',
    back: 'Log analytics, real-time application monitoring, and full-text search. Use it when the requirement is "fuzzy search" or "indexing logs for visualization in Dashboards (Kibana)." ',
  },
  {
    topicSlug: 'disaster-recovery-and-backup',
    front: 'What is the AWS Schema Conversion Tool (SCT) and when is it used?',
    back: 'Used during heterogeneous migrations (e.g., Oracle to Aurora, SQL Server to PostgreSQL). It converts the database schema, views, and stored procedures to a format compatible with the target AWS database engine.',
  },
  {
    topicSlug: 'network-performance-and-hybrid',
    front: 'What is an AWS Direct Connect Gateway and when do you need it?',
    back: 'A global resource that allows you to connect a single Direct Connect link to multiple VPCs across different regions. It eliminates the need to have a separate DX link for every region.',
  },
  {
    topicSlug: 'storage-performance-patterns',
    front: 'What is Amazon EFS Replication and what is its RPO?',
    back: 'Automatically replicates your EFS file system to another AZ or Region. It provides an RPO of minutes and an RTO of minutes. It is much simpler than manual rsync or AWS DataSync for DR.',
  },
  {
    topicSlug: 'monitoring-detection-and-response',
    front: 'What is CloudWatch Synthetics (Canaries)?',
    back: 'Configurable scripts that run on a schedule to monitor your endpoints and APIs from the outside-in. They simulate user behavior to verify availability and latency even when there is no real user traffic.',
  },

  // ─── Domain 2: Machine Learning & AI Services ─────────────────────────────

  // Topic: machine-learning-and-ai-services
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Bedrock and what makes it operationally different from SageMaker?',
    back: 'Amazon Bedrock is a fully managed, serverless generative AI service that provides access to foundation models (LLMs, image models) from providers like Anthropic, Meta, and Amazon via a single API. Unlike SageMaker, there is no infrastructure to manage, no model training required, and pricing is per-token/per-request. Use Bedrock when you need to invoke or fine-tune existing foundation models without building custom ML pipelines.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon SageMaker and what is its primary value proposition?',
    back: 'SageMaker is a fully managed platform for the entire ML lifecycle: data labeling (Ground Truth), model training (managed clusters, spot training), hyperparameter tuning (automatic model tuning), model hosting (real-time and batch inference endpoints), and MLOps (Pipelines, Model Registry). Use it when you need to build, train, and deploy custom ML models at scale.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Rekognition and what types of analysis does it provide?',
    back: 'Rekognition is a fully managed computer vision service. It can: detect objects, scenes, and activities; recognize celebrities; identify inappropriate content (content moderation); analyze facial attributes (emotions, age range, face comparison); extract text from images (OCR); and analyze video for real-time activity detection. No ML expertise required — just call the API with an image or video.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Comprehend and what NLP tasks does it perform?',
    back: 'Comprehend is a managed NLP service. It can: detect the language of text; extract entities (people, places, dates); determine sentiment (positive, negative, neutral, mixed); classify documents into custom categories (Comprehend Custom); detect PII in text; and perform topic modeling. Use it to analyze customer feedback, support tickets, or social media at scale without training NLP models.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is the difference between Amazon Polly and Amazon Transcribe?',
    back: 'Polly: Text-to-Speech — converts written text into lifelike audio. Supports multiple languages, neural voices (NTTS), and SSML for fine-grained speech control. Useful for accessibility features, voice applications, and dynamic audio content.\nTranscribe: Speech-to-Text — converts spoken audio files or real-time audio streams into text. Supports speaker identification (diarization), custom vocabularies, and automatic punctuation. Useful for call center analytics, meeting transcription, and subtitle generation.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Forecast and what type of problem does it solve?',
    back: 'Forecast is a fully managed time-series forecasting service based on machine learning. It takes historical time-series data (e.g., sales, web traffic, inventory levels) plus related metadata and produces probabilistic forecasts without requiring ML expertise. Use it for demand planning, capacity forecasting, and financial projections. It uses the same technology as Amazon\'s internal demand forecasting.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Kendra and how does it differ from a standard search engine?',
    back: 'Kendra is an intelligent enterprise search service powered by ML. Unlike keyword-based search (which matches exact words), Kendra understands natural language queries and returns precise answers from a connected knowledge base (S3, SharePoint, Confluence, etc.). It can respond to questions like "What is the vacation policy?" by finding the relevant passage from HR documents, not just a list of documents containing those words.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'When should you use Amazon Bedrock vs. Amazon SageMaker for a new AI-powered application?',
    back: 'Use Bedrock when: you want to use (or lightly fine-tune) an existing foundation model (Claude, Llama, Titan), need a serverless pay-per-request model, do not have a custom dataset for training, and want to avoid ML infrastructure.\nUse SageMaker when: you need to train a custom model from scratch or perform extensive fine-tuning on your own data, require specialized training jobs (e.g., distributed training), need full control over the training cluster, or are deploying non-generative ML models (XGBoost, custom neural networks).',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Textract and how does it go beyond basic OCR?',
    back: 'Amazon Textract is a document analysis service that extracts text AND structured data from scanned documents. Unlike simple OCR, it understands document structure — it can identify forms (key-value pairs) and tables, preserving context. Use cases: automating invoice processing, extracting data from medical records, digitizing contracts. It handles multi-page PDFs and handwritten text.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is a SageMaker Endpoint and what are the two main types?',
    back: 'A SageMaker Endpoint hosts a deployed ML model and provides an HTTPS API for inference.\nReal-time Endpoint: persistent, low-latency endpoint for synchronous predictions. Scales with auto scaling. Best for interactive applications.\nBatch Transform: processes large datasets offline (no persistent endpoint). Runs predictions on S3 input and writes results to S3. Best for bulk scoring jobs where real-time response is not required.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Lex and what problem does it solve?',
    back: 'Amazon Lex is a managed conversational AI service for building chatbots and voice bots using the same underlying technology as Alexa. It is used when an application needs natural language chat or voice interactions without building custom NLP pipelines.',
  },
  {
    topicSlug: 'machine-learning-and-ai-services',
    front: 'What is Amazon Translate and when should you use it?',
    back: 'Amazon Translate is a managed neural machine translation service that converts text between languages. Use it when applications need multilingual content delivery, localization, or real-time text translation without training custom language models.',
  },
];
