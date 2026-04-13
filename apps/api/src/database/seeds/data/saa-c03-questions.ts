export interface SeedSaaC03Question {
  questionNumber: number;
  topicSlug: string;
  question: string;
  answer: string;
  answerVariants: string[];
  correctAnswerVariant: 'A' | 'B' | 'C' | 'D';
}

type RawSeedSaaC03Question = Omit<SeedSaaC03Question, 'answerVariants' | 'correctAnswerVariant'> & {
  answerVariants?: string[];
  correctAnswerVariant?: 'A' | 'B' | 'C' | 'D';
};

const DEFAULT_DISTRACTORS = [
  'Use a single EC2 instance with local storage only.',
  'Open all resources to the public internet for easier access.',
  'Manually manage scaling and failover without AWS managed services.',
  'Store all workloads in one Availability Zone without redundancy.',
  'Use static credentials in application code for all integrations.',
  'Process requests synchronously without buffering or queueing.',
] as const;

function buildAnswerVariants(answer: string): {
  normalizedAnswer: string;
  answerVariants: string[];
  correctAnswerVariant: 'A' | 'B' | 'C' | 'D';
} {
  const match = answer.match(/^\s*([A-D])[.)]\s*(.+)$/i);
  const labels: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

  const fallbackCorrect =
    answer.trim().length > 0 && !answer.includes('Answer not provided')
      ? answer.trim()
      : 'Insufficient source answer details to determine the exact option.';

  const correctAnswerVariant = ((match?.[1]?.toUpperCase() as 'A' | 'B' | 'C' | 'D') ?? 'A');
  const correctText = (match?.[2]?.trim() || fallbackCorrect).replace(/\s+/g, ' ');

  const distractors = DEFAULT_DISTRACTORS.filter((item) => item !== correctText).slice(0, 3);
  const optionsByLabel = new Map<'A' | 'B' | 'C' | 'D', string>();

  let distractorIndex = 0;
  for (const label of labels) {
    if (label === correctAnswerVariant) {
      optionsByLabel.set(label, correctText);
      continue;
    }

    optionsByLabel.set(
      label,
      distractors[distractorIndex] ??
        DEFAULT_DISTRACTORS[distractorIndex] ??
        'No alternate option available.',
    );
    distractorIndex += 1;
  }

  const answerVariants = labels.map((label) => `${label}. ${optionsByLabel.get(label) ?? ''}`);

  return {
    normalizedAnswer: `${correctAnswerVariant}. ${correctText}`,
    answerVariants,
    correctAnswerVariant,
  };
}

const RAW_SAA_C03_QUESTIONS: RawSeedSaaC03Question[] = [
  {
    questionNumber: 1,
    topicSlug: 'event-driven-and-messaging',
    question: 'Real-time Data Stream: To share millions of financial transactions with other apps, you need to be able to ingest data in real-time, which is made possible by Amazon Kinesis Data Streams.',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Ingest transactions with Amazon Kinesis Data Streams and let multiple consumers read the stream.',
      'B. Send transactions directly to Amazon S3 Glacier Deep Archive for downstream apps to poll hourly.',
      'C. Write each transaction to Amazon EFS and mount it from consumer applications.',
      'D. Use AWS Batch jobs every 6 hours to move transactions into Amazon Redshift.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 2,
    topicSlug: 'event-driven-and-messaging',
    question: 'Data Transformation: You can cleanse and eliminate sensitive data from transactions before storing them in Amazon DynamoDB by utilizing AWS Lambda with Kinesis Data Streams. This takes care of the requirement to handle sensitive data with care.',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Persist raw transactions in DynamoDB first, then run a weekly cleanup Lambda job to remove sensitive fields.',
      'B. Store transactions in Amazon RDS and run SQL views to hide sensitive fields from applications.',
      'C. Trigger AWS Lambda from Kinesis Data Streams to redact sensitive fields, then write sanitized items to DynamoDB.',
      'D. Use AWS Config rules to mask sensitive values before writing to DynamoDB.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 3,
    topicSlug: 'event-driven-and-messaging',
    question: 'Scalability: DynamoDB and Amazon Kinesis are both extremely scalable technologies that can manage enormous data volumes and adjust to the workload. To host a static website on Amazon S3, you would first need to create an S3 bucket. Then, you would need to upload the website files to the bucket. Once the files are uploaded, you can configure the bucket to serve as a website.',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Build a scalable pipeline using Kinesis Data Streams for ingestion and DynamoDB for low-latency storage; host static assets on S3.',
      'B. Use only Amazon EC2 with local storage for ingestion and website hosting to avoid managed services.',
      'C. Replace all streaming with Amazon SES notifications and store transactions in Amazon SQS only.',
      'D. Use a single NAT gateway as the primary data processing and website delivery component.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 4,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'An application runs on an Amazon EC2 instance in a VPC. The application processes logs that are stored in an Amazon S3 bucket. The EC2 instance needs to access the S3 bucket without connectivity to the internet. Which solution will provide private network connectivity to Amazon S3?',
    answer: 'A. Create a gateway VPC endpoint to the S3 bucket.',
    answerVariants: [
      'A. Create a gateway VPC endpoint for Amazon S3 and route S3 traffic privately through the endpoint.',
      'B. Attach an internet gateway to the private subnet and restrict outbound traffic with NACLs.',
      'C. Use AWS Site-to-Site VPN from the VPC to the nearest AWS Region for S3 access.',
      'D. Place the EC2 instance in a public subnet and disable public IP assignment.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 5,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is hosting a web application on AWS using a single Amazon EC2 instance that stores user-uploaded documents in an Amazon EBS volume. For better scalability and availability, the company duplicated the architecture and created a second EC2 instance and EBS volume in another Availability Zone, placing both behind an Application Load Balancer. After completing this change, users reported that, each time they refreshed the website, they could see one subset of their documents or the other, but never all of the documents at the same time. What should a solutions architect propose to ensure users see all of their documents at once?',
    answer: 'C. Copy the data from both EBS volumes to Amazon EFS. Modify the application to save new documents to Amazon EFS',
    answerVariants: [
      'A. Enable stickiness on the Application Load Balancer so each user always reaches one EC2 instance.',
      'B. Use Amazon S3 Transfer Acceleration between the two EBS volumes to synchronize files every hour.',
      'C. Migrate documents to Amazon EFS and mount the same file system on both EC2 instances.',
      'D. Increase both EBS volumes to Provisioned IOPS so reads stay consistent across instances.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 6,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses NFS to store large video files in on-premises network attached storage. Each video file ranges in size from 1 MB to 500 GB. The total storage is 70 TB and is no longer growing. The company decides to migrate the video files to Amazon S3. The company must migrate the video files as soon as possible while using the least possible network bandwidth. Which solution will meet these requirements?',
    answer: 'B. Create an AWS Snowball Edge job. Receive a Snowball Edge device on premises. Use the Snowball Edge client to transfer data to the device. Return the device so that AWS can import the data into Amazon S3',
    answerVariants: [
      'A. Use AWS DataSync over the internet continuously until all 70 TB is transferred.',
      'B. Use AWS Snowball Edge to transfer the data offline and import it into Amazon S3.',
      'C. Configure S3 Transfer Acceleration and upload all files directly from the NAS over the WAN.',
      'D. Mount Amazon EFS on premises and copy the data through the VPN tunnel.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 7,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an application that ingests incoming messages. Dozens of other applications and microservices then quickly consume these messages. The number of messages varies drastically and sometimes increases suddenly to 100,000 each second. The company wants to decouple the solution and increase scalability. Which solution meets these requirements?',
    answer: 'D. Publish the messages to an Amazon Simple Notification Service (Amazon SNS) topic with multiple Amazon Simple Queue Service (Amazon SOS) subscriptions. Configure the consumer applications to process the messages from the queues.',
    answerVariants: [
      'A. Write all messages to a single Amazon RDS table and let each consumer poll the table.',
      'B. Use one Amazon EC2 broker instance to fan out messages to each consumer service.',
      'C. Use AWS Step Functions to synchronously invoke all consumer applications for every message.',
      'D. Publish to Amazon SNS with SQS subscriptions so consumers process messages independently and scale out.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 8,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is migrating a distributed application to AWS. The application serves variable workloads. The legacy platform consists of a primary server that coordinates jobs across multiple compute nodes. The company wants to modernize the application with a solution that maximizes resiliency and scalability. How should a solutions architect design the architecture to meet these requirements?',
    answer: 'B. Configure an Amazon Simple Queue Service (Amazon SQS) queue as a destination for the jobs. Implement the compute nodes with Amazon EC2 instances that are managed in an Auto Scaling group. Configure EC2 Auto Scaling based on the size of the queue.',
    answerVariants: [
      'A. Keep a single coordinator EC2 instance and scale only worker instance size vertically.',
      'B. Queue jobs in Amazon SQS and process them with Auto Scaling EC2 workers based on queue depth.',
      'C. Store jobs in Amazon EBS and share the volume with all compute nodes across Availability Zones.',
      'D. Use Amazon CloudFront to distribute jobs to compute nodes globally.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 9,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is running an SMB file server in its data center. The file server stores large files that are accessed frequently for the first few days after the files are created. After 7 days the files are rarely accessed. The total data size is increasing and is close to the company\'s total storage capacity. A solutions architect must increase the company\'s available storage space without losing low-latency access to the most recently accessed files. The solutions architect must also provide file lifecycle management to avoid future storage issues. Which solution will meet these requirements?',
    answer: 'B. Create an Amazon S3 File Gateway to extend the company\'s storage space. Create an S3 Lifecycle policy to transition the data to S3 Glacier Deep Archive after 7 days.',
    answerVariants: [
      'A. Replace the SMB server with an Amazon EBS volume and attach it to one EC2 instance in a single AZ.',
      'B. Use Amazon S3 File Gateway for local low-latency cache and lifecycle older files to S3 Glacier Deep Archive.',
      'C. Use Amazon RDS to store files as BLOBs and archive records weekly to Amazon S3.',
      'D. Use AWS Backup for daily snapshots of the SMB server without changing the primary storage architecture.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 10,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is building an ecommerce web application on AWS. The application sends information about new orders to an Amazon API Gateway REST API to process. The company wants to ensure that orders are processed in the order that they are received. Which solution will meet these requirements?',
    answer: 'B. Use an API Gateway integration to send a message to an Amazon Simple Queue Service (Amazon SQS) FIFO queue when the application receives an order. Configure the SQS FIFO queue to invoke an AWS Lambda function for processing',
    answerVariants: [
      'A. Send each order directly from API Gateway to an SNS topic and process messages in parallel subscribers.',
      'B. Push orders to an SQS FIFO queue and process them with Lambda to preserve order.',
      'C. Store incoming orders in S3 and run a daily batch process to sort them by timestamp.',
      'D. Use an SQS standard queue and increase visibility timeout to guarantee strict ordering.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 11,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has an application that runs on Amazon EC2 instances and uses an Amazon Aurora database. The EC2 instances connect to the database by using user names and passwords that are stored locally in a file. The company wants to minimize the operational overhead of credential management. What should a solutions architect do to accomplish this goal?',
    answer: 'A. Use AWS Secrets Manager and attach an IAM role that grants access to that secret to the EC2 instances that need it. Turn on automatic rotation.',
    answerVariants: [
      'A. Store database credentials in AWS Secrets Manager, grant access through an EC2 IAM role, and enable automatic rotation.',
      'B. Keep credentials in an encrypted local file and rotate the file manually every month.',
      'C. Put credentials into AWS Systems Manager Parameter Store without rotation and hardcode parameter names in code.',
      'D. Use an Amazon S3 bucket with restrictive ACLs to share one static credential file across all EC2 instances.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 12,
    topicSlug: 'edge-and-global-routing',
    question: 'A global company hosts its web application on Amazon EC2 instances behind an Application Load Balancer (ALB). The web application has static data and dynamic data. The company stores its static data in an Amazon S3 bucket. The company wants to improve performance and reduce latency for the static data and dynamic data. The company is using its own domain name registered with Amazon Route 53. What should a solutions architect do to meet these requirements?',
    answer: 'A. Create an Amazon CloudFront distribution that has the S3 bucket and the ALB as origins. Configure Route 53 to route traffic to the CloudFront distribution.',
    answerVariants: [
      'A. Put CloudFront in front of both S3 and ALB origins, then route the domain to CloudFront with Route 53.',
      'B. Point Route 53 latency records directly to S3 for both static and dynamic requests.',
      'C. Use one Global Accelerator endpoint for S3 and one for ALB without any CDN layer.',
      'D. Replicate static assets to EC2 instance stores in all Regions and disable S3.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 13,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company performs monthly maintenance on its AWS infrastructure. During these maintenance activities, the company needs to rotate the credentials for its Amazon RDS for MySQL databases across multiple AWS Regions. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Store the credentials as secrets in AWS Secrets Manager. Use multi-Region secret replication for the required Regions. Configure Secrets Manager to rotate the secrets on a schedule.',
    answerVariants: [
      'A. Use Secrets Manager with multi-Region secret replication and scheduled rotation.',
      'B. Use one IAM user key pair per Region and update database passwords manually.',
      'C. Store passwords in CloudFormation parameters and redeploy stacks during maintenance windows.',
      'D. Create one SNS topic per Region to notify DB admins when passwords should be rotated manually.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 14,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs an ecommerce application on Amazon EC2 instances behind an Application Load Balancer. The instances run in an Amazon EC2 Auto Scaling group across multiple Availability Zones. The Auto Scaling group scales based on CPU utilization metrics. The ecommerce application stores the transaction data in a MySQL 8.0 database that is hosted on a large EC2 instance. The database\'s performance degrades quickly as application load increases. The application handles more read requests than write transactions. The company wants a solution that will automatically scale the database to meet the demand of unpredictable read workloads while maintaining high availability. Which solution will meet these requirements?',
    answer: 'C. Use Amazon Aurora with a Multi-AZ deployment. Configure Aurora Auto Scaling with Aurora Replicas.',
    answerVariants: [
      'A. Continue using MySQL on EC2 and increase instance size on a quarterly schedule.',
      'B. Move the database to Amazon RDS for MySQL Single-AZ with larger gp3 storage.',
      'C. Migrate to Aurora Multi-AZ and enable Aurora Replicas with Aurora Auto Scaling for reads.',
      'D. Add Amazon ElastiCache only and keep all database reads and writes on the same EC2-hosted MySQL node.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 15,
    topicSlug: 'network-security-controls',
    question: 'A company recently migrated to AWS and wants to implement a solution to protect the traffic that flows in and out of the production VPC. The company had an inspection server in its on-premises data center. The inspection server performed specific operations such as traffic flow inspection and traffic filtering. The company wants to have the same functionalities in the AWS Cloud. Which solution will meet these requirements?',
    answer: 'C. Use AWS Network Firewall to create the required rules for traffic inspection and traffic filtering for the production VPC.',
    answerVariants: [
      'A. Add AWS Shield Standard and rely on default protections for traffic filtering requirements.',
      'B. Use only VPC Flow Logs and CloudWatch dashboards to block unwanted traffic patterns.',
      'C. Deploy AWS Network Firewall in the production VPC and enforce inspection/filtering rules.',
      'D. Attach an internet gateway to each subnet and use NACLs as the only inspection control.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 16,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company hosts a data lake on AWS. The data lake consists of data in Amazon S3 and Amazon RDS for PostgreSQL. The company needs a reporting solution that provides data visualization and includes all the data sources within the data lake. Only the company\'s management team should have full access to all the visualizations. The rest of the company should have only limited access. Which solution will meet these requirements?',
    answer: 'B. Create an analysis in Amazon QuickSight. Connect all the data sources and create new datasets. Publish dashboards to visualize the data. Share the dashboards with the appropriate users and groups',
    answerVariants: [
      'A. Build a custom React dashboard on EC2 and write direct SQL queries from each user browser.',
      'B. Use Amazon QuickSight datasets and dashboards with group-based sharing for full vs limited access.',
      'C. Export S3 and PostgreSQL data to CSV files and email reports manually to each department.',
      'D. Use AWS Glue only, because Glue provides end-user dashboards and role-based visualization controls.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 17,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is implementing a new business application. The application runs on two Amazon EC2 instances and uses an Amazon S3 bucket for document storage. A solutions architect needs to ensure that the EC2 instances can access the S3 bucket. What should the solutions architect do to meet this requirement?',
    answer: 'A. Create an IAM role that grants access to the S3 bucket. Attach the role to the EC2 instances',
    answerVariants: [
      'A. Create an IAM role with S3 permissions and attach the role to both EC2 instances.',
      'B. Store AWS access keys in user data on each EC2 instance and rotate keys manually.',
      'C. Add the EC2 public IPs to the S3 bucket policy and leave instance IAM roles empty.',
      'D. Configure an IAM user per instance and save credentials in plain text on disk.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 18,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'An application development team is designing a microservice that will convert large images to smaller, compressed images. When a user uploads an image through the web interface, the microservice should store the image in an Amazon S3 bucket, process and compress the image with an AWS Lambda function, and store the image in its compressed form in a different S3 bucket.',
    answer: 'A. solutions architect needs to design a solution that uses durable, stateless components to process the images automatically.',
    answerVariants: [
      'A. Use S3 event notifications to trigger Lambda for image compression and write output to a destination S3 bucket.',
      'B. Mount an EBS volume on a single EC2 instance to process uploads and push results nightly.',
      'C. Trigger a manual AWS Batch job every hour to poll S3 for new files.',
      'D. Store original and compressed images in the same DynamoDB table as binary attributes.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 19,
    topicSlug: 'network-security-controls',
    question: 'A company has a three-tier web application that is deployed on AWS. The web servers are deployed in a public subnet in a VPC. The application servers and database servers are deployed in private subnets in the same VPC. The company has deployed a third-party virtual firewall appliance from AWS Marketplace in an inspection VPC. The appliance is configured with an IP interface that can accept IP packets.',
    answer: 'A. solutions architect needs to integrate the web application with the appliance to inspect all traffic to the application before the traffic reaches the web server.',
    answerVariants: [
      'A. Route ingress traffic through a Gateway Load Balancer endpoint to the third-party firewall before forwarding to web tier.',
      'B. Enable S3 server access logging so all incoming web traffic is inspected before reaching EC2.',
      'C. Add an SQS queue between the internet and the web tier to inspect packets asynchronously.',
      'D. Use AWS Secrets Manager rotation to enforce packet filtering and traffic inspection.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 20,
    topicSlug: 'storage-performance-patterns',
    question: 'A company wants to improve its ability to clone large amounts of production data into a test environment in the same AWS Region. The data is stored in Amazon EC2 instances on Amazon Elastic Block Store (Amazon EBS) volumes. Modifications to the cloned data must not affect the production environment. The software that accesses this data requires consistently high I/O performance.',
    answer: 'A. solutions architect needs to minimize the time that is required to clone the production data into the test environment.',
    answerVariants: [
      'A. Take EBS snapshots and quickly create new test volumes from snapshots, using Fast Snapshot Restore where needed.',
      'B. Attach production EBS volumes directly to test instances to avoid copy time and preserve IOPS.',
      'C. Export volume contents to Glacier Deep Archive and restore them before each test cycle.',
      'D. Use S3 Standard-IA as the block storage layer for EC2 test workloads requiring high I/O.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 21,
    topicSlug: 'edge-and-global-routing',
    question: 'An ecommerce company wants to launch a one-deal-a-day website on AWS. Each day will feature exactly one product on sale for a period of 24 hours. The company wants to be able to handle millions of requests each hour with millisecond latency during peak hours. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'D. Use an Amazon S3 bucket to host the website\'s static content. Deploy an Amazon CloudFront distribution. Set the S3 bucket as the origin. Use Amazon API Gateway and AWS Lambda functions for the backend APIs. Store the data in Amazon DynamoDB.',
    answerVariants: [
      'A. Deploy EC2 Auto Scaling in one Region and store content on EBS volumes.',
      'B. Host static and dynamic content on a single ALB with EC2 only.',
      'C. Use S3 static website with Route 53 weighted records and no CDN.',
      'D. Use S3 + CloudFront for static content, API Gateway + Lambda + DynamoDB for backend.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 22,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A solutions architect is using Amazon S3 to design the storage architecture of a new digital media application. The media files must be resilient to the loss of an Availability Zone. Some files are accessed frequently while other files are rarely accessed in an unpredictable pattern. The solutions architect must minimize the costs of storing and retrieving the media files. Which storage option meets these requirements?',
    answer: 'B. S3 Intelligent-Tiering',
    answerVariants: [
      'A. S3 Standard for all objects with no lifecycle because access is unpredictable.',
      'B. S3 Intelligent-Tiering to optimize cost for unpredictable frequent/infrequent access.',
      'C. S3 One Zone-IA because data can be recreated from source systems.',
      'D. S3 Glacier Instant Retrieval as the default class for all new objects.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 23,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is storing backup files by using Amazon S3 Standard storage. The files are accessed frequently for 1 month. However, the files are not accessed after 1 month. The company must keep the files indefinitely. Which storage solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Create an S3 Lifecycle configuration to transition objects from S3 Standard to S3 Glacier Deep Archive after 1 month.',
    answerVariants: [
      'A. Move objects to S3 Standard-IA after 30 days and then delete after 1 year.',
      'B. Lifecycle from S3 Standard to S3 Glacier Deep Archive after 1 month.',
      'C. Keep data in S3 Standard forever because retrieval speed is required.',
      'D. Transition to Glacier Flexible Retrieval after 1 day to minimize cost.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 24,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company observes an increase in Amazon EC2 costs in its most recent bill. The billing team notices unwanted vertical scaling of instance types for a couple of EC2 instances. A solutions architect needs to create a graph comparing the last 2 months of EC2 costs and perform an in-depth analysis to identify the root cause of the vertical scaling. How should the solutions architect generate the information with the LEAST operational overhead?',
    answer: 'B. Use Cost Explorer\'s granular filtering feature to perform an in-depth analysis of EC2 costs based on instance types.',
    answerVariants: [
      'A. Build a custom billing ETL into Redshift and analyze with SQL queries.',
      'B. Use Cost Explorer filters to compare EC2 costs by instance type over 2 months.',
      'C. Enable detailed billing exports and inspect CSV files manually each day.',
      'D. Use Trusted Advisor performance checks to identify instance right-sizing changes.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 25,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is designing an application. The application uses an AWS Lambda function to receive information through Amazon API Gateway and to store the information in an Amazon Aurora PostgreSQL database. During the proof-of-concept stage, the company has to increase the Lambda quotas significantly to handle the high volumes of data that the company needs to load into the database. A solutions architect must recommend a new design to improve scalability and minimize the configuration effort. Which solution will meet these requirements?',
    answer: 'D. Set up two Lambda functions. Configure one function to receive the information. Configure the other function to load the information into the database. Integrate the Lambda functions by using an Amazon Simple Queue Service (Amazon SQS) queue.',
    answerVariants: [
      'A. Increase Lambda reserved concurrency permanently and keep direct Aurora writes.',
      'B. Replace Aurora with DynamoDB and keep a single Lambda function.',
      'C. Buffer requests in API Gateway cache and flush to database every minute.',
      'D. Split ingestion and persistence Lambdas with SQS between them to absorb spikes.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 26,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company needs to review its AWS Cloud deployment to ensure that its Amazon S3 buckets do not have unauthorized configuration changes. What should a solutions architect do to accomplish this goal?',
    answer: 'A. Turn on AWS Config with the appropriate rules.',
    answerVariants: [
      'A. Enable AWS Config and use rules that detect unauthorized S3 configuration changes.',
      'B. Enable CloudTrail data events only and review logs manually every week.',
      'C. Turn on S3 server access logs and send alerts via SNS for all requests.',
      'D. Use GuardDuty malware protection to scan objects for configuration drift.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 27,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is launching a new application and will display application metrics on an Amazon CloudWatch dashboard. The company\'s product manager needs to access this dashboard periodically. The product manager does not have an AWS account. A solutions architect must provide access to the product manager by following the principle of least privilege. Which solution will meet these requirements?',
    answer: 'A. Share the dashboard from the CloudWatch console. Enter the product manager\'s email address, and complete the sharing steps. Provide a shareable link for the dashboard to the product manage.',
    answerVariants: [
      'A. Share the CloudWatch dashboard link directly with the product manager email.',
      'B. Create a full IAM user for the manager with CloudWatchReadOnlyAccess.',
      'C. Export dashboard widgets to PDF daily and email scheduled reports.',
      'D. Mirror metrics to QuickSight and grant anonymous public dashboard access.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 28,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is migrating applications to AWS. The applications are deployed in different accounts. The company manages the accounts centrally by using AWS Organizations. The company\'s security team needs a single sign-on (SSO) solution across all the company\'s accounts. The company must continue managing the users and groups in its on-premises self-managed Microsoft Active Directory. Which solution will meet these requirements?',
    answer: 'A. Enable AWS Single Sign-On (AWS SSO) from the AWS SSO console. Create a one-way forest trust or a one-way domain trust to connect the company\'s self-managed Microsoft Active Directory with AWS SSO by using AWS Directory Service for Microsoft Active Directory.',
    answerVariants: [
      'A. Enable AWS SSO and integrate on-prem AD with one-way trust via Directory Service.',
      'B. Create IAM users in every account and sync passwords from AD nightly.',
      'C. Use Cognito user pools as the central workforce identity provider.',
      'D. Use STS AssumeRole with static IAM users managed in each account.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 29,
    topicSlug: 'edge-and-global-routing',
    question: 'A company provides a Voice over Internet Protocol (VoIP) service that uses UDP connections. The service consists of Amazon EC2 instances that run in an Auto Scaling group. The company has deployments across multiple AWS Regions. The company needs to route users to the Region with the lowest latency. The company also needs automated failover between Regions. Which solution will meet these requirements?',
    answer: 'A. Deploy a Network Load Balancer (NLB) and an associated target group. Associate the target group with the Auto Scaling group. Use the NLB as an AWS Global Accelerator endpoint in each Region.',
    answerVariants: [
      'A. Use NLB per Region and AWS Global Accelerator for lowest-latency UDP routing/failover.',
      'B. Use ALB per Region and Route 53 weighted records for VoIP traffic.',
      'C. Use CloudFront with custom origin to route UDP packets globally.',
      'D. Use Transit Gateway inter-Region peering and private hosted zones.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 30,
    topicSlug: 'database-performance-and-caching',
    question: 'A development team runs monthly resource-intensive tests on its general purpose Amazon RDS for MySQL DB instance with Performance Insights enabled. The testing lasts for 48 hours once a month and is the only process that uses the database. The team wants to reduce the cost of running the tests without reducing the compute and memory attributes of the DB instance. Which solution meets these requirements MOST cost-effectively?',
    answer: 'C. Create a snapshot when tests are completed. Terminate the DB instance and restore the snapshot when required.',
    answerVariants: [
      'A. Convert DB instance to db.t3.small during idle periods each month.',
      'B. Move database to Aurora Serverless v2 and leave it always running.',
      'C. Snapshot after tests, delete DB instance, and restore only when needed.',
      'D. Disable Performance Insights and keep instance running to reduce cost.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 31,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company that hosts its web application on AWS wants to ensure all Amazon EC2 instances. Amazon RDS DB instances. and Amazon Redshift clusters are configured with tags. The company wants to minimize the effort of configuring and operating this check. What should a solutions architect do to accomplish this?',
    answer: 'A. Use AWS Config rules to define and detect resources that are not properly tagged.',
    answerVariants: [
      'A. Use AWS Config managed rules to detect EC2/RDS/Redshift resources missing tags.',
      'B. Use Cost Explorer tag reports to enforce tag compliance automatically.',
      'C. Use CloudFormation drift detection across all existing resources.',
      'D. Enable Trusted Advisor cost checks for untagged assets.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 32,
    topicSlug: 'storage-performance-patterns',
    question: 'A development team needs to host a website that will be accessed by other teams. The website contents consist of HTML, CSS, client-side JavaScript, and images. Which method is the MOST cost-effective for hosting the website?',
    answer: 'B. Create an Amazon S3 bucket and host the website there.',
    answerVariants: [
      'A. Host content on a single t3.micro EC2 web server with EBS.',
      'B. Host static website assets directly in an Amazon S3 bucket.',
      'C. Use Elastic Beanstalk with ALB for HTML/CSS/JS/image hosting.',
      'D. Use FSx for Windows File Server to host website files.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 33,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company runs an online marketplace web application on AWS. The application serves hundreds of thousands of users during peak hours. The company needs a scalable, near-real-time solution to share the details of millions of financial transactions with several other internal applications. Transactions also need to be processed to remove sensitive data before being stored in a document database for low-latency retrieval. What should a solutions architect recommend to meet these requirements?',
    answer: 'C. Stream the transactions data into Amazon Kinesis Data Streams. Use AWS Lambda integration to remove sensitive data from every transaction and then store the transactions data in Amazon DynamoDB. Other applications can consume the transactions data off the Kinesis data stream.',
    answerVariants: [
      'A. Send transactions to SQS and run nightly ETL into DynamoDB.',
      'B. Use API Gateway direct integration to Aurora with Lambda triggers.',
      'C. Stream to Kinesis, redact with Lambda, store in DynamoDB, consume from stream.',
      'D. Send all transactions to SNS and process with email subscriptions.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 34,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company hosts its multi-tier applications on AWS. For compliance, governance, auditing, and security, the company must track configuration changes on its AWS resources and record a history of API calls made to these resources. What should a solutions architect do to meet these requirements?',
    answer: 'B. Use AWS Config to track configuration changes and AWS CloudTrail to record API calls.',
    answerVariants: [
      'A. Use CloudWatch metrics plus X-Ray traces for API history and config changes.',
      'B. Use AWS Config for configuration history and CloudTrail for API call history.',
      'C. Use GuardDuty findings and Security Hub for compliance evidence.',
      'D. Use Inspector scans with EventBridge alerts for governance tracking.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 35,
    topicSlug: 'network-security-controls',
    question: 'A company is preparing to launch a public-facing web application in the AWS Cloud. The architecture consists of Amazon EC2 instances within a VPC behind an Elastic Load Balancer (ELB). A third-party service is used for the DNS. The company\'s solutions architect must recommend a solution to detect and protect against large-scale DDoS attacks. Which solution meets these requirements?',
    answer: 'D. Enable AWS Shield Advanced and assign the ELB to it.',
    answerVariants: [
      'A. Enable AWS WAF managed rules only on the ELB.',
      'B. Use Network ACL deny lists for all suspicious source ranges.',
      'C. Place NAT gateways in front of ELB to absorb volumetric attacks.',
      'D. Enable AWS Shield Advanced and protect the internet-facing ELB.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 36,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Insufficient source question content to produce reliable alternatives.',
      'B. Use Multi-AZ architecture and SQS for decoupling under load.',
      'C. Use CloudFront with WAF and Route 53 health checks.',
      'D. Use Secrets Manager rotation and least-privilege IAM roles.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 37,
    topicSlug: 'identity-access-and-governance',
    question: 'A company recently launched a variety of new workloads on Amazon EC2 instances in its AWS account. The company needs to create a strategy to access and administer the instances remotely and securely. The company needs to implement a repeatable process that works with native AWS services and follows the AWS Well-Architected Framework. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Attach the appropriate IAM role to each existing instance and new instance. Use AWS Systems Manager Session Manager to establish a remote SSH session.',
    answerVariants: [
      'A. Expose SSH via bastion host and rotate key pairs monthly.',
      'B. Attach IAM role and use Systems Manager Session Manager for secure access.',
      'C. Open port 22 from corporate CIDRs and enforce MFA on Linux login.',
      'D. Use AWS Client VPN and direct root SSH to private instances.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 38,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is hosting a static website on Amazon S3 and is using Amazon Route 53 for DNS. The website is experiencing increased demand from around the world. The company must decrease latency for users who access the website. Which solution meets these requirements MOST cost-effectively?',
    answer: 'C. Add an Amazon CloudFront distribution in front of the S3 bucket. Edit the Route 53 entries to point to the CloudFront distribution',
    answerVariants: [
      'A. Use Route 53 geolocation routing directly to S3 website endpoints.',
      'B. Use Global Accelerator with S3 as endpoint group target.',
      'C. Put CloudFront in front of S3 and point Route 53 to distribution.',
      'D. Replicate S3 bucket per continent and use manual DNS failover.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 39,
    topicSlug: 'database-performance-and-caching',
    question: 'A company maintains a searchable repository of items on its website. The data is stored in an Amazon RDS for MySQL database table that contains more than 10 million rows. The database has 2 TB of General Purpose SSD storage. There are millions of updates against this data every day through the company\'s website. The company has noticed that some insert operations are taking 10 seconds or longer. The company has determined that the database storage performance is the problem. Which solution addresses this performance issue?',
    answer: 'A. Change the storage type to Provisioned IOPS SSD.',
    answerVariants: [
      'A. Change storage to Provisioned IOPS SSD to increase database I/O performance.',
      'B. Add read replicas because inserts are slow due to CPU limits.',
      'C. Reduce index count and move table to S3 for archival queries.',
      'D. Enable Multi-AZ because replication improves write latency.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 40,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has thousands of edge devices that collectively generate 1 TB of status alerts each day. Each alert is approximately 2 KB in size. A solutions architect needs to implement a solution to ingest and store the alerts for future analysis. The company wants a highly available solution. However, the company needs to minimize costs and does not want to manage additional infrastructure. Additionally, the company wants to keep 14 days of data available for immediate analysis and archive any data older than 14 days. What is the MOST operationally efficient solution that meets these requirements?',
    answer: 'A. Create an Amazon Kinesis Data Firehose delivery stream to ingest the alerts. Configure the Kinesis Data Firehose stream to deliver the alerts to an Amazon S3 bucket. Set up an S3 Lifecycle configuration to transition data to Amazon S3 Glacier after 14 days.',
    answerVariants: [
      'A. Ingest with Kinesis Firehose to S3; lifecycle to Glacier after 14 days.',
      'B. Use Kinesis Data Streams with 14-day retention and no S3 lifecycle.',
      'C. Send alerts to SNS, persist in DynamoDB, export monthly to S3.',
      'D. Use API Gateway to Lambda and store directly in RDS Multi-AZ.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 41,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company\'s application integrates with multiple software-as-a-service (SaaS) sources for data collection. The company runs Amazon EC2 instances to receive the data and to upload the data to an Amazon S3 bucket for analysis. The same EC2 instance that receives and uploads the data also sends a notification to the user when an upload is complete. The company has noticed slow application performance and wants to improve the performance as much as possible. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Create an Amazon AppFlow flow to transfer data between each SaaS source and the S3 bucket. Configure an S3 event notification to send events to an Amazon Simple Notification Service (Amazon SNS) topic when the upload to the S3 bucket is complete.',
    answerVariants: [
      'A. Keep EC2 ingestion and add larger instance sizes for peak hours.',
      'B. Use AppFlow to ingest SaaS data to S3 and S3 event notifications to SNS.',
      'C. Use DataSync from SaaS endpoints directly into EFS and notify by SES.',
      'D. Build a custom Kafka cluster on EC2 and trigger Lambda emails.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 42,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company runs a highly available image-processing application on Amazon EC2 instances in a single VPC. The EC2 instances run inside several subnets across multiple Availability Zones. The EC2 instances do not communicate with each other. However, the EC2 instances download images from Amazon S3 and upload images to Amazon S3 through a single NAT gateway. The company is concerned about data transfer charges. What is the MOST cost-effective way for the company to avoid Regional data transfer charges?',
    answer: 'C. Deploy a gateway VPC endpoint for Amazon S3.',
    answerVariants: [
      'A. Add one NAT gateway per AZ and keep S3 traffic through NAT.',
      'B. Use interface VPC endpoints for S3 in each subnet.',
      'C. Create a gateway VPC endpoint for S3 to avoid NAT data transfer charges.',
      'D. Move EC2 instances to public subnets with no NAT gateway.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 43,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company has an on-premises application that generates a large amount of time-sensitive data that is backed up to Amazon S3. The application has grown and there are user complaints about internet bandwidth limitations. A solutions architect needs to design a long-term solution that allows for both timely backups to Amazon S3 and with minimal impact on internet connectivity for internal users. Which solution meets these requirements?',
    answer: 'B. Establish a new AWS Direct Connect connection and direct backup traffic through this new connection.',
    answerVariants: [
      'A. Continue backups over internet and enable S3 Transfer Acceleration.',
      'B. Add a dedicated Direct Connect link and route backup traffic through it.',
      'C. Use Snowball Edge daily for ongoing backup transport.',
      'D. Deploy additional NAT gateways for internal bandwidth isolation.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 44,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company has an Amazon S3 bucket that contains critical data. The company must protect the data from accidental deletion. Which combination of steps should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'A. Enable versioning on the S3 bucket',
    answerVariants: [
      'A. Enable S3 versioning to protect against accidental deletes/overwrites.',
      'B. Disable object lock to allow faster recovery operations.',
      'C. Store objects in One Zone-IA for higher durability.',
      'D. Use lifecycle expiration after 30 days for compliance retention.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 45,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has a data ingestion workflow that consists of the following:  An Amazon Simple Notification Service (Amazon SNS) topic for notifications about new data deliveries  An AWS Lambda function to process the data and record metadata The company observes that the ingestion workflow fails occasionally because of network connectivity issues. When such a failure occurs, the Lambda function does not ingest the corresponding data unless the company manually reruns the job. Which combination of actions should a solutions architect take to ensure that the Lambda function ingests all data in the future? (Choose two.)',
    answer: 'B. Create an Amazon Simple Queue Service (Amazon SQS) queue, and subscribe it to the SNS topic.',
    answerVariants: [
      'A. Increase Lambda timeout and rely on SNS retries only.',
      'B. Subscribe an SQS queue to SNS so messages persist until processed.',
      'C. Replace SNS with direct Lambda invocation from producers.',
      'D. Send failed events to CloudWatch Logs and replay manually.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 46,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an application that provides marketing services to stores. The services are based on previous purchases by store customers. The stores upload transaction data to the company through SFTP, and the data is processed and analyzed to generate new marketing offers. Some of the files can exceed 200 GB in size. Recently, the company discovered that some of the stores have uploaded files that contain personally identifiable information (PII) that should not have been included. The company wants administrators to be alerted if PII is shared again. The company also wants to automate remediation. What should a solutions architect do to meet these requirements with the LEAST development effort?',
    answer: 'B. Use an Amazon S3 bucket as a secure transfer point. Use Amazon Macie to scan the objects in the bucket. If objects contain PII, use Amazon Simple Notification Service (Amazon SNS) to trigger a notification to the administrators to remove the objects that contain PII.',
    answerVariants: [
      'A. Use AWS Glue classifiers to detect PII in uploaded objects.',
      'B. Ingest via S3, scan with Macie, alert admins via SNS for remediation.',
      'C. Run Athena queries daily to find PII and create tickets manually.',
      'D. Use Comprehend only on sampled files and notify through EventBridge.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 47,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company needs guaranteed Amazon EC2 capacity in three specific Availability Zones in a specific AWS Region for an upcoming event that will last 1 week. What should the company do to guarantee the EC2 capacity?',
    answer: 'D. Create an On-Demand Capacity Reservation that specifies the Region and three Availability Zones needed.',
    answerVariants: [
      'A. Purchase Spot blocks in three AZs for guaranteed weekly capacity.',
      'B. Use Reserved Instances because weekly events need strict capacity guarantees.',
      'C. Use a mixed instances policy in Auto Scaling with baseline On-Demand.',
      'D. Create On-Demand Capacity Reservations in the required AZs.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 48,
    topicSlug: 'storage-performance-patterns',
    question: 'A company\'s website uses an Amazon EC2 instance store for its catalog of items. The company wants to make sure that the catalog is highly available and that the catalog is stored in a durable location. What should a solutions architect do to meet these requirements?',
    answer: 'D. Move the catalog to an Amazon Elastic File System (Amazon EFS) file system.',
    answerVariants: [
      'A. Keep catalog in instance store and replicate hourly between instances.',
      'B. Store catalog on an EBS volume and snapshot every 5 minutes.',
      'C. Move catalog to S3 and mount it as a POSIX filesystem.',
      'D. Move catalog to Amazon EFS for shared durable multi-AZ storage.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 49,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company stores call transcript files on a monthly basis. Users access the files randomly within 1 year of the call, but users access the files infrequently after 1 year. The company wants to optimize its solution by giving users the ability to query and retrieve files that are less than 1-year-old as quickly as possible. A delay in retrieving older files is acceptable. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Store individual files in Amazon S3 Intelligent-Tiering. Use S3 Lifecycle policies to move the files to S3 Glacier Flexible Retrieval after 1 year. Query and retrieve the files that are in Amazon S3 by using Amazon Athena. Query and retrieve the files that are in S3 Glacier by using S3 Glacier Select.',
    answerVariants: [
      'A. Store all files in S3 Standard forever and query with Redshift Spectrum.',
      'B. Use S3 Intelligent-Tiering, then Glacier Flexible Retrieval after 1 year.',
      'C. Archive immediately to Glacier Deep Archive and restore on demand.',
      'D. Use EFS IA with lifecycle and query using Athena federation.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 50,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company has a production workload that runs on 1,000 Amazon EC2 Linux instances. The workload is powered by third-party software. The company needs to patch the third-party software on all EC2 instances as quickly as possible to remediate a critical security vulnerability. What should a solutions architect do to meet these requirements?',
    answer: 'D. Use AWS Systems Manager Run Command to run a custom command that applies the patch to all EC2 instances.',
    answerVariants: [
      'A. SSH to each instance and run patch script in parallel batches.',
      'B. Rebuild all instances from a patched AMI over several days.',
      'C. Use AWS Backup restore jobs with patched snapshots.',
      'D. Use Systems Manager Run Command to execute patching fleet-wide quickly.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 51,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is developing an application that provides order shipping statistics for retrieval by a REST API. The company wants to extract the shipping statistics, organize the data into an easy-to-read HTML format, and send the report to several email addresses at the same time every morning. Which combination of steps should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'D. Create an Amazon EventBridge (Amazon CloudWatch Events) scheduled event that invokes an AWS Lambda function to query the application\'s API for the data.',
    answerVariants: [
      'A. Use Step Functions scheduled workflow and send email with SES directly.',
      'B. Poll API every minute from EC2 cron and email through SMTP relay.',
      'C. Trigger Kinesis stream every morning and fan out to Lambda workers.',
      'D. Use EventBridge schedule to invoke Lambda that gathers and formats report.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 52,
    topicSlug: 'storage-performance-patterns',
    question: 'A company wants to migrate its on-premises application to AWS. The application produces output files that vary in size from tens of gigabytes to hundreds of terabytes. The application data must be stored in a standard file system structure. The company wants a solution that scales automatically. is highly available, and requires minimum operational overhead. Which solution will meet these requirements?',
    answer: 'C. Migrate the application to Amazon EC2 instances in a Multi-AZ Auto Scaling group. Use Amazon Elastic File System (Amazon EFS) for storage.',
    answerVariants: [
      'A. Use single EC2 instance with large EBS io2 and NFS sharing.',
      'B. Store output in S3 and mount via s3fs across compute nodes.',
      'C. Run app on Multi-AZ Auto Scaling EC2 and use EFS as shared storage.',
      'D. Use FSx for Windows for Linux workload with SMB protocol.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 53,
    topicSlug: 'identity-access-and-governance',
    question: 'A company needs to store its accounting records in Amazon S3. The records must be immediately accessible for 1 year and then must be archived for an additional 9 years. No one at the company, including administrative users and root users, can be able to delete the records during the entire 10-year period. The records must be stored with maximum resiliency. Which solution will meet these requirements?',
    answer: 'C. Use an S3 Lifecycle policy to transition the records from S3 Standard to S3 Glacier Deep Archive after 1 year. Use S3 Object Lock in compliance mode for a period of 10 years.',
    answerVariants: [
      'A. Keep in S3 Standard for 10 years and deny delete in bucket policy.',
      'B. Transition to Glacier Flexible Retrieval after 1 year with MFA delete.',
      'C. Transition to Deep Archive after 1 year and enforce Object Lock compliance 10 years.',
      'D. Store in EFS IA with backup vault lock for 10 years.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 54,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs multiple Windows workloads on AWS. The company\'s employees use Windows file shares that are hosted on two Amazon EC2 instances. The file shares synchronize data between themselves and maintain duplicate copies. The company wants a highly available and durable storage solution that preserves how users currently access the files. What should a solutions architect do to meet these requirements?',
    answer: 'C. Extend the file share environment to Amazon FSx for Windows File Server with a Multi-AZ configuration. Migrate all the data to FSx for Windows File Server.',
    answerVariants: [
      'A. Continue on EC2 and sync shares with DFS replication across AZs.',
      'B. Use S3 File Gateway and mount mapped drives directly from S3.',
      'C. Migrate to FSx for Windows File Server Multi-AZ to keep SMB access.',
      'D. Use EFS with NFS mounts from Windows workloads.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 55,
    topicSlug: 'network-security-controls',
    question: 'A solutions architect is developing a VPC architecture that includes multiple subnets. The architecture will host applications that use Amazon EC2 instances and Amazon RDS DB instances. The architecture consists of six subnets in two Availability Zones. Each Availability Zone includes a public subnet, a private subnet, and a dedicated subnet for databases. Only EC2 instances that run in the private subnets can have access to the RDS databases. Which solution will meet these requirements?',
    answer: 'C. Create a security group that allows inbound traffic from the security group that is assigned to instances in the private subnets. Attach the security group to the DB instances.',
    answerVariants: [
      'A. Open DB SG to private subnet CIDR range on all ports.',
      'B. Use NACLs to allow port 3306 from private subnets to DB subnet.',
      'C. Allow DB inbound from the private-tier security group only.',
      'D. Place DB in public subnet and restrict with IAM authentication.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 56,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has registered its domain name with Amazon Route 53. The company uses Amazon API Gateway in the ca-central-1 Region as a public interface for its backend microservice APIs. Third-party services consume the APIs securely. The company wants to design its API Gateway URL with the company\'s domain name and corresponding certificate so that the third-party services can use HTTPS. Which solution will meet these requirements?',
    answer: 'C. Create a Regional API Gateway endpoint. Associate the API Gateway endpoint with the company\'s domain name. Import the public',
    answerVariants: [
      'A. Use edge-optimized API endpoint and default execute-api domain only.',
      'B. Create private API Gateway endpoint and expose through VPN clients.',
      'C. Use Regional API custom domain and attach valid certificate for HTTPS.',
      'D. Use CloudFront custom SSL in front of private API endpoint.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 57,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is running a popular social media website. The website gives users the ability to upload images to share with other users. The company wants to make sure that the images do not contain inappropriate content. The company needs a solution that minimizes development effort. What should a solutions architect do to meet these requirements?',
    answer: 'B. Use Amazon Rekognition to detect inappropriate content. Use human review for low-confidence predictions.',
    answerVariants: [
      'A. Use Amazon Translate to classify and block inappropriate images.',
      'B. Use Rekognition moderation labels and human review for low confidence.',
      'C. Use Comprehend sentiment analysis on image metadata only.',
      'D. Use Athena SQL rules over S3 object names before publishing.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 58,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company wants to run its critical applications in containers to meet requirements for scalability and availability. The company prefers to focus on maintenance of the critical applications. The company does not want to be responsible for provisioning and managing the underlying infrastructure that runs the containerized workload. What should a solutions architect do to meet these requirements?',
    answer: 'C. Use Amazon Elastic Container Service (Amazon ECS) on AWS Fargate.',
    answerVariants: [
      'A. Run containers on self-managed EC2 with ASG and patch manually.',
      'B. Use EKS on EC2 managed node groups with custom AMI lifecycle.',
      'C. Use ECS on Fargate so AWS manages container infrastructure.',
      'D. Use Batch on Spot instances for always-on critical services.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 59,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company hosts more than 300 global websites and applications. The company requires a platform to analyze more than 30 TB of clickstream data each day. What should a solutions architect do to transmit and process the clickstream data?',
    answer: 'D. Collect the data from Amazon Kinesis Data Streams. Use Amazon Kinesis Data Firehose to transmit the data to an Amazon S3 data lake. Load the data in Amazon Redshift for analysis.',
    answerVariants: [
      'A. Send clickstream directly to SQS and load nightly into Redshift.',
      'B. Stream to DynamoDB and export monthly to S3 for analysis.',
      'C. Use AppSync subscriptions and store events in Aurora.',
      'D. Use Kinesis Streams + Firehose to S3 and load into Redshift.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 60,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has a website hosted on AWS. The website is behind an Application Load Balancer (ALB) that is configured to handle HTTP and HTTPS separately. The company wants to forward all requests to the website so that the requests will use HTTPS. What should a solutions architect do to meet this requirement?',
    answer: 'C. Create a listener rule on the ALB to redirect HTTP traffic to HTTPS.',
    answerVariants: [
      'A. Terminate HTTP listener and serve both protocols on one port 80.',
      'B. Add WAF rule to block all HTTP requests at the ALB.',
      'C. Configure ALB rule to redirect HTTP requests to HTTPS.',
      'D. Enable Shield Advanced to enforce encrypted connections.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 61,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is developing a two-tier web application on AWS. The company\'s developers have deployed the application on an Amazon EC2 instance that connects directly to a backend Amazon RDS database. The company must not hardcode database credentials in the application. The company must also implement a solution to automatically rotate the database credentials on a regular basis. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Store the database credentials as a secret in AWS Secrets Manager. Turn on automatic rotation for the secret. Attach the required permission to the EC2 role to grant access to the secret.',
    answerVariants: [
      'A. Store DB credentials in Parameter Store SecureString without rotation.',
      'B. Use IAM database authentication only and remove passwords entirely.',
      'C. Store credentials in Secrets Manager and enable automatic rotation.',
      'D. Store encrypted credentials in S3 and refresh weekly with Lambda.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 62,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is deploying a new public web application to AWS. The application will run behind an Application Load Balancer (ALB). The application needs to be encrypted at the edge with an SSL/TLS certificate that is issued by an external certificate authority (CA). The certificate must be rotated each year before the certificate expires. What should a solutions architect do to meet these requirements?',
    answer: 'D. Use AWS Certificate Manager (ACM) to import an SSL/TLS certificate. Apply the certificate to the ALB. Use Amazon EventBridge (Amazon CloudWatch Events) to send a notification when the certificate is nearing expiration. Rotate the certificate manually.',
    answerVariants: [
      'A. Create ACM public certificate in your account and auto-renew external CA cert.',
      'B. Terminate TLS on EC2 instances with self-managed cert files.',
      'C. Use CloudFront in front of ALB and rotate cert with cron jobs.',
      'D. Import external cert into ACM, attach to ALB, alert on expiry via EventBridge.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 63,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs its infrastructure on AWS and has a registered base of 700,000 users for its document management application. The company intends to create a product that converts large .pdf files to .jpg image files. The .pdf files average 5 MB in size. The company needs to store the original files and the converted files. A solutions architect must design a scalable solution to accommodate demand that will grow rapidly over time. Which solution meets these requirements MOST cost-effectively?',
    answer: 'A. Save the .pdf files to Amazon S3. Configure an S3 PUT event to invoke an AWS Lambda function to convert the files to .jpg format and store them back in Amazon S3.',
    answerVariants: [
      'A. S3 upload triggers Lambda conversion to JPG and writes back to S3.',
      'B. Use ECS services polling S3 every hour for conversion batches.',
      'C. Use DataSync to stage PDFs and convert in on-prem workers.',
      'D. Store files in Aurora and convert with stored procedures.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 64,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has more than 5 TB of file data on Windows file servers that run on premises. Users and applications interact with the data each day. The company is moving its Windows workloads to AWS. As the company continues this process, the company requires access to AWS and on-premises file storage with minimum latency. The company needs a solution that minimizes operational overhead and requires no significant changes to the existing file access patterns. The company uses an AWS Site-to-Site VPN connection for connectivity to AWS. What should a solutions architect do to meet these requirements?',
    answer: 'D. Deploy and configure Amazon FSx for Windows File Server on AWS. Deploy and configure an Amazon FSx File Gateway on premises. Move the on-premises file data to the FSx File Gateway. Configure the cloud workloads to use FSx for Windows File Server on AWS. Configure the on-premises workloads to use the FSx File Gateway.',
    answerVariants: [
      'A. Mount on-prem SMB share over VPN directly from AWS workloads.',
      'B. Use S3 File Gateway only and point both cloud and on-prem workloads to it.',
      'C. Use FSx for Lustre with SMB front-end through Windows gateway.',
      'D. Use FSx for Windows in AWS and FSx File Gateway on premises.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 65,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A hospital recently deployed a RESTful API with Amazon API Gateway and AWS Lambda. The hospital uses API Gateway and Lambda to upload reports that are in PDF format and JPEG format. The hospital needs to modify the Lambda code to identify protected health information (PHI) in the reports. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Use Amazon Textract to extract the text from the reports. Use Amazon Comprehend Medical to identify the PHI from the extracted text.',
    answerVariants: [
      'A. Use Rekognition text detection and custom regex for PHI.',
      'B. Use Comprehend sentiment model directly on binary PDF/JPEG files.',
      'C. Extract text with Textract, then detect PHI with Comprehend Medical.',
      'D. Route uploads to OpenSearch and use query-time masking.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 66,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has an application that generates a large number of files, each approximately 5 MB in size. The files are stored in Amazon S3. Company policy requires the files to be stored for 4 years before they can be deleted. Immediate accessibility is always required as the files contain critical business data that is not easy to reproduce. The files are frequently accessed in the first 30 days of the object creation but are rarely accessed after the first 30 days. Which storage solution is MOST cost-effective?',
    answer: 'C. Create an S3 bucket lifecycle policy to move files from S3 Standard to S3 Standard-Infrequent Access (S3 Standard-IA) 30 days from object creation. Delete the files 4 years after object creation.',
    answerVariants: [
      'A. Keep files in S3 Standard for all 4 years to ensure access.',
      'B. Move data to Glacier Flexible Retrieval after 30 days.',
      'C. Lifecycle to Standard-IA after 30 days and delete after 4 years.',
      'D. Use One Zone-IA after 30 days to minimize cost.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 67,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company hosts an application on multiple Amazon EC2 instances. The application processes messages from an Amazon SQS queue, writes to an Amazon RDS table, and deletes the message from the queue. Occasional duplicate records are found in the RDS table. The SQS queue does not contain any duplicate messages. What should a solutions architect do to ensure messages are being processed once only?',
    answer: 'D. Use the ChangeMessageVisibility API call to increase the visibility timeout.',
    answerVariants: [
      'A. Replace SQS with SNS FIFO to prevent duplicate RDS writes.',
      'B. Use SQS FIFO queue because duplicates were observed in RDS.',
      'C. Reduce visibility timeout so retries happen faster.',
      'D. Increase visibility timeout with ChangeMessageVisibility to avoid double processing.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 68,
    topicSlug: 'edge-and-global-routing',
    question: 'A solutions architect is designing a new hybrid architecture to extend a company\'s on-premises infrastructure to AWS. The company requires a highly available connection with consistent low latency to an AWS Region. The company needs to minimize costs and is willing to accept slower traffic if the primary connection fails. What should the solutions architect do to meet these requirements?',
    answer: 'A. Provision an AWS Direct Connect connection to a Region. Provision a VPN connection as a backup if the primary Direct Connect connection fails.',
    answerVariants: [
      'A. Use Direct Connect as primary and VPN as backup for HA + cost.',
      'B. Use two Direct Connect links in active-active for both primary and backup.',
      'C. Use only VPN tunnels because they are always lower latency.',
      'D. Use Transit Gateway peering without hybrid edge links.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 69,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is running a business-critical web application on Amazon EC2 instances behind an Application Load Balancer. The EC2 instances are in an Auto Scaling group. The application uses an Amazon Aurora PostgreSQL database that is deployed in a single Availability Zone. The company wants the application to be highly available with minimum downtime and minimum loss of data. Which solution will meet these requirements with the LEAST operational effort?',
    answer: 'B. Configure the Auto Scaling group to use multiple Availability Zones. Configure the database as Multi-AZ. Configure an Amazon RDS Proxy instance for the database.',
    answerVariants: [
      'A. Keep single-AZ Aurora and add larger EC2 instances.',
      'B. Use multi-AZ Auto Scaling web tier, Multi-AZ DB, and RDS Proxy.',
      'C. Migrate database to DynamoDB global tables for durability.',
      'D. Add CloudFront only to reduce downtime from backend failures.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 70,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company\'s HTTP application is behind a Network Load Balancer (NLB). The NLB\'s target group is configured to use an Amazon EC2 Auto Scaling group with multiple EC2 instances that run the web service. The company notices that the NLB is not detecting HTTP errors for the application. These errors require a manual restart of the EC2 instances that run the web service. The company needs to improve the application\'s availability without writing custom scripts or code. What should a solutions architect do to meet these requirements?',
    answer: 'C. Replace the NLB with an Application Load Balancer. Enable HTTP health checks by supplying the URL of the company\'s application. Configure an Auto Scaling action to replace unhealthy instances.',
    answerVariants: [
      'A. Keep NLB and use TCP health checks on port 80 only.',
      'B. Add Lambda watchdog to reboot unhealthy targets every 5 minutes.',
      'C. Use ALB HTTP health checks and ASG replacement of unhealthy instances.',
      'D. Enable Route 53 health checks against each EC2 instance.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 71,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs a shopping application that uses Amazon DynamoDB to store customer information. In case of data corruption, a solutions architect needs to design a solution that meets a recovery point objective (RPO) of 15 minutes and a recovery time objective (RTO) of 1 hour. What should the solutions architect recommend to meet these requirements?',
    answer: 'B. Configure DynamoDB point-in-time recovery. For RPO recovery, restore to the desired point in time.',
    answerVariants: [
      'A. Create on-demand backup weekly and export to S3.',
      'B. Enable DynamoDB point-in-time recovery and restore to target timestamp.',
      'C. Use DynamoDB Streams and replay records into a new table manually.',
      'D. Use DAX cluster snapshots for data corruption recovery.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 72,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs a photo processing application that needs to frequently upload and download pictures from Amazon S3 buckets that are located in the same AWS Region. A solutions architect has noticed an increased cost in data transfer fees and needs to implement a solution to reduce these costs. How can the solutions architect meet this requirement?',
    answer: 'D. Deploy an S3 VPC gateway endpoint into the VPC and attach an endpoint policy that allows access to the S3 buckets.',
    answerVariants: [
      'A. Use NAT gateway with optimized route tables for S3 access.',
      'B. Use interface endpoint for S3 and disable bucket policies.',
      'C. Enable S3 Transfer Acceleration for same-region access.',
      'D. Use S3 gateway endpoint with endpoint policy for bucket access.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 73,
    topicSlug: 'network-security-controls',
    question: 'A company recently launched Linux-based application instances on Amazon EC2 in a private subnet and launched a Linux-based bastion host on an Amazon EC2 instance in a public subnet of a VPC. A solutions architect needs to connect from the on-premises network, through the company\'s internet connection, to the bastion host, and to the application servers. The solutions architect must make sure that the security groups of all the EC2 instances will allow that access. Which combination of steps should the solutions architect take to meet these requirements? (Choose two.)',
    answer: 'C. Replace the current security group of the bastion host with one that only allows inbound access from the external IP range for the company.',
    answerVariants: [
      'A. Allow SSH/RDP from 0.0.0.0/0 to bastion and app servers.',
      'B. Permit app server SG ingress from any source on TCP 22.',
      'C. Restrict bastion SG ingress to company external IP range only.',
      'D. Remove bastion host and expose private instances directly.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 74,
    topicSlug: 'network-security-controls',
    question: 'A solutions architect is designing a two-tier web application. The application consists of a public-facing web tier hosted on Amazon EC2 in public subnets. The database tier consists of Microsoft SQL Server running on Amazon EC2 in a private subnet. Security is a high priority for the company. How should security groups be configured in this situation? (Choose two.)',
    answer: 'A. Configure the security group for the web tier to allow inbound traffic on port 443 from 0.0.0.0/0.',
    answerVariants: [
      'A. Allow web SG inbound 443 from 0.0.0.0/0 and restrict DB from web SG.',
      'B. Allow DB SG inbound 1433 from internet for maintenance.',
      'C. Use one shared SG across all tiers for easier management.',
      'D. Open web tier only to corporate office CIDR for public website.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 75,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company wants to move a multi-tiered application from on premises to the AWS Cloud to improve the application\'s performance. The application consists of application tiers that communicate with each other by way of RESTful services. Transactions are dropped when one tier becomes overloaded. A solutions architect must design a solution that resolves these issues and modernizes the application. Which solution meets these requirements and is the MOST operationally efficient?',
    answer: 'A. Use Amazon API Gateway and direct transactions to the AWS Lambda functions as the application layer. Use Amazon Simple Queue Service (Amazon SQS) as the communication layer between application services.',
    answerVariants: [
      'A. Use API Gateway + Lambda tier with SQS between services.',
      'B. Keep REST sync calls and scale each tier vertically.',
      'C. Replace REST with direct RDS writes from each tier.',
      'D. Use CloudFront and EFS as service communication layer.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 76,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company receives 10 TB of instrumentation data each day from several machines located at a single factory. The data consists of JSON files stored on a storage area network (SAN) in an on-premises data center located within the factory. The company wants to send this data to Amazon S3 where it can be accessed by several additional systems that provide critical near-real-time analytics. A secure transfer is important because the data is considered sensitive. Which solution offers the MOST reliable data transfer?',
    answer: 'B. AWS DataSync over AWS Direct Connect',
    answerVariants: [
      'A. Use VPN over public internet with multipart S3 uploads.',
      'B. Use DataSync over Direct Connect for secure, reliable continuous transfer.',
      'C. Use Snowball Edge weekly because data arrives daily.',
      'D. Use S3 Transfer Acceleration without private connectivity.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 77,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company needs to configure a real-time data ingestion architecture for its application. The company needs an API, a process that transforms data as the data is streamed, and a storage solution for the data. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Configure an Amazon API Gateway API to send data to an Amazon Kinesis data stream. Create an Amazon Kinesis Data Firehose delivery stream that uses the Kinesis data stream as a data source. Use AWS Lambda functions to transform the data. Use the Kinesis Data Firehose delivery stream to send the data to Amazon S3.',
    answerVariants: [
      'A. API Gateway -> Lambda -> DynamoDB with no streaming transform.',
      'B. API Gateway -> SNS -> SQS -> EC2 workers writing to EFS.',
      'C. API Gateway -> Kinesis Stream -> Firehose + Lambda transform -> S3.',
      'D. AppSync subscriptions -> Aurora -> Glue ETL to S3.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 78,
    topicSlug: 'database-performance-and-caching',
    question: 'A company needs to keep user transaction data in an Amazon DynamoDB table. The company must retain the data for 7 years. What is the MOST operationally efficient solution that meets these requirements?',
    answer: 'B. Use AWS Backup to create backup schedules and retention policies for the table.',
    answerVariants: [
      'A. Export table monthly using Data Pipeline and retain snapshots.',
      'B. Use AWS Backup schedules/retention policies for DynamoDB table.',
      'C. Use DAX for faster backups and long-term retention.',
      'D. Enable Streams and archive records to S3 for 7 years only.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 79,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is planning to use an Amazon DynamoDB table for data storage. The company is concerned about cost optimization. The table will not be used on most mornings. In the evenings, the read and write traffic will often be unpredictable. When traffic spikes occur, they will happen very quickly. What should a solutions architect recommend?',
    answer: 'A. Create a DynamoDB table in on-demand capacity mode.',
    answerVariants: [
      'A. Use DynamoDB on-demand mode for unpredictable evening spikes.',
      'B. Use provisioned mode with fixed RCU/WCU and no autoscaling.',
      'C. Use DAX write-through cache to avoid scaling concerns.',
      'D. Use global tables to reduce costs in low-traffic mornings.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 80,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company recently signed a contract with an AWS Managed Service Provider (MSP) Partner for help with an application migration initiative. A solutions architect needs ta share an Amazon Machine Image (AMI) from an existing AWS account with the MSP Partner\'s AWS account. The AMI is backed by Amazon Elastic Block Store (Amazon EBS) and uses an AWS Key Management Service (AWS KMS) customer managed key to encrypt EBS volume snapshots. What is the MOST secure way for the solutions architect to share the AMI with the MSP Partner\'s AWS account?',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Share encrypted AMI by granting target account KMS key + snapshot access.',
      'B. Copy AMI to unencrypted snapshots, then share publicly with auditor.',
      'C. Export AMI to S3 and share bucket with ACLs.',
      'D. Disable KMS encryption temporarily, share, then re-enable encryption.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 81,
    topicSlug: 'event-driven-and-messaging',
    question: 'A solutions architect is designing the cloud architecture for a new application being deployed on AWS. The process should run in parallel while adding and removing application nodes as needed based on the number of jobs to be processed. The processor application is stateless. The solutions architect must ensure that the application is loosely coupled and the job items are durably stored. Which design should the solutions architect use?',
    answer: 'C. Create an Amazon SQS queue to hold the jobs that need to be processed. Create an Amazon Machine Image (AMI) that consists of the processor application. Create a launch template that uses the AMI. Create an Auto Scaling group using the launch template. Set the scaling policy for the Auto Scaling group to add and remove nodes based on the number of items in the SQS queue.',
    answerVariants: [
      'A. Use SNS topics between workers and persist jobs in local disk queues.',
      'B. Use EventBridge scheduled tasks with fixed-size EC2 worker fleet.',
      'C. Use SQS queue with Auto Scaling EC2 workers from launch template.',
      'D. Use Step Functions with synchronous task tokens for each item.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 82,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company hosts its web applications in the AWS Cloud. The company configures Elastic Load Balancers to use certificates that are imported into AWS Certificate Manager (ACM). The company\'s security team must be notified 30 days before the expiration of each certificate. What should a solutions architect recommend to meet this requirement?',
    answer: 'D. Create an Amazon EventBridge (Amazon CloudWatch Events) rule to detect any certificates that will expire within 30 days. Configure the rule to invoke an AWS Lambda function. Configure the Lambda function to send a custom alert by way of Amazon Simple Notification Service (Amazon SNS).',
    answerVariants: [
      'A. Use ACM managed renewal events and trust automatic email alerts.',
      'B. Poll ACM API hourly from EC2 and send email through SMTP.',
      'C. Use CloudWatch dashboard widget for certificate expiration only.',
      'D. EventBridge rule for expiring certs -> Lambda -> SNS custom alert.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 83,
    topicSlug: 'edge-and-global-routing',
    question: 'A company\'s dynamic website is hosted using on-premises servers in the United States. The company is launching its product in Europe, and it wants to optimize site loading times for new European users. The site\'s backend must remain in the United States. The product is being launched in a few days, and an immediate solution is needed. What should the solutions architect recommend?',
    answer: 'C. Use Amazon CloudFront with a custom origin pointing to the on-premises servers.',
    answerVariants: [
      'A. Move backend servers to Europe and keep US as failover.',
      'B. Use Route 53 geolocation records directly to on-prem origin.',
      'C. Use CloudFront with custom origin to US on-prem servers.',
      'D. Use Global Accelerator with ALB endpoints in Europe only.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 84,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to reduce the cost of its existing three-tier web architecture. The web, application, and database servers are running on Amazon EC2 instances for the development, test, and production environments. The EC2 instances average 30% CPU utilization during peak hours and 10% CPU utilization during non-peak hours. The production EC2 instances run 24 hours a day. The development and test EC2 instances run for at least 8 hours each day. The company plans to implement automation to stop the development and test EC2 instances when they are not in use. Which EC2 instance purchasing solution will meet the company\'s requirements MOST cost-effectively?',
    answer: 'B. Use Reserved Instances for the production EC2 instances. Use On-Demand Instances for the development and test EC2 instances.',
    answerVariants: [
      'A. Buy 3-year all-upfront RIs for all dev, test, and production.',
      'B. Use RIs for always-on production, On-Demand for dev/test with stop automation.',
      'C. Use Spot for production baseline and On-Demand for burst.',
      'D. Migrate all tiers to Lambda to eliminate EC2 costs.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 85,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company has a production web application in which users upload documents through a web interface or a mobile app. According to a new regulatory requirement. new documents cannot be modified or deleted after they are stored. What should a solutions architect do to meet this requirement?',
    answer: 'A. Store the uploaded documents in an Amazon S3 bucket with S3 Versioning and S3 Object Lock enabled.',
    answerVariants: [
      'A. Enable S3 Object Lock with versioning to prevent modification/deletion.',
      'B. Encrypt all objects with SSE-KMS and disable versioning.',
      'C. Use Glacier Vault Lock after object upload without S3 controls.',
      'D. Restrict deletes in IAM but allow object overwrite.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 86,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has several web servers that need to frequently access a common Amazon RDS MySQL Multi-AZ DB instance. The company wants a secure method for the web servers to connect to the database while meeting a security requirement to rotate user credentials frequently. Which solution meets these requirements?',
    answer: 'A. Store the database user credentials in AWS Secrets Manager. Grant the necessary IAM permissions to allow the web servers to access AWS Secrets Manager.',
    answerVariants: [
      'A. Store DB credentials in Secrets Manager and grant web servers IAM access.',
      'B. Use Systems Manager Parameter Store plaintext values with rotation script.',
      'C. Attach static DB password in launch template user data.',
      'D. Use IAM users per web server with long-lived access keys.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 87,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts an application on AWS Lambda functions that are invoked by an Amazon API Gateway API. The Lambda functions save customer data to an Amazon Aurora MySQL database. Whenever the company upgrades the database, the Lambda functions fail to establish database connections until the upgrade is complete. The result is that customer data is not recorded for some of the event.',
    answer: 'A. solutions architect needs to design a solution that stores customer data that is created during database upgrades.',
    answerVariants: [
      'A. Add durable queue/buffer so writes survive Aurora upgrade connection outages.',
      'B. Increase Lambda timeout and retries until upgrade finishes.',
      'C. Use CloudFront in front of API Gateway to smooth traffic.',
      'D. Move writes to S3 only and run nightly ETL to Aurora.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 88,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A survey company has gathered data for several years from areas in the United States. The company hosts the data in an Amazon S3 bucket that is 3 TB in size and growing. The company has started to share the data with a European marketing firm that has S3 buckets. The company wants to ensure that its data transfer costs remain as low as possible. Which solution will meet these requirements?',
    answer: 'A. Configure the Requester Pays feature on the company\'s S3 bucket.',
    answerVariants: [
      'A. Enable Requester Pays on the S3 bucket to shift transfer costs.',
      'B. Enable S3 Transfer Acceleration to reduce requester egress charges.',
      'C. Replicate data to eu-west-1 to avoid all transfer costs.',
      'D. Use Glacier Instant Retrieval for all shared objects.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 89,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses Amazon S3 to store its confidential audit documents. The S3 bucket uses bucket policies to restrict access to audit team IAM user credentials according to the principle of least privilege. Company managers are worried about accidental deletion of documents in the S3 bucket and want a more secure solution. What should a solutions architect do to secure the audit documents?',
    answer: 'A. Enable the versioning and MFA Delete features on the S3 bucket.',
    answerVariants: [
      'A. Enable S3 versioning and MFA Delete to prevent accidental deletion.',
      'B. Use bucket encryption with KMS CMK and annual key rotation.',
      'C. Add CloudTrail trails to track delete API calls only.',
      'D. Move documents to EFS with backup vault lock.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 90,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is using a SQL database to store movie data that is publicly accessible. The database runs on an Amazon RDS Single-AZ DB instance. A script runs queries at random intervals each day to record the number of new movies that have been added to the database. The script must report a final total during business hours. The company\'s development team notices that the database performance is inadequate for development tasks when the script is running. A solutions architect must recommend a solution to resolve this issue. Which solution will meet this requirement with the LEAST operational overhead?',
    answer: 'B. Create a read replica of the database. Configure the script to query only the read replica.',
    answerVariants: [
      'A. Scale up primary RDS instance class during report window.',
      'B. Create read replica and direct reporting script to replica.',
      'C. Enable Multi-AZ and run reports on standby node.',
      'D. Move all data to DynamoDB and use DAX for reads.',
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 91,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has applications that run on Amazon EC2 instances in a VPC. One of the applications needs to call the Amazon S3 API to store and read objects. According to the company\'s security regulations, no traffic from the applications is allowed to travel across the internet. Which solution will meet these requirements?',
    answer: 'A. Configure an S3 gateway endpoint.',
    answerVariants: [
      'A. Configure an S3 gateway VPC endpoint for private API access.',
      'B. Use NAT gateway with restrictive NACLs to keep traffic private.',
      'C. Use Direct Connect public VIF to reach S3 endpoints privately.',
      'D. Use interface endpoint for EC2 and proxy S3 calls through it.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 92,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is storing sensitive user information in an Amazon S3 bucket. The company wants to provide secure access to this bucket from the application tier running on Amazon EC2 instances inside a VPC. Which combination of steps should a solutions architect take to accomplish this? (Choose two.)',
    answer: 'A. Configure a VPC gateway endpoint for Amazon S3 within the VPC.',
    answerVariants: [
      'A. Use S3 gateway endpoint and policy controls for private secure access.',
      'B. Place EC2 in public subnets and enforce TLS to S3.',
      'C. Use CloudFront signed URLs to read private S3 objects.',
      'D. Use Route 53 private zones to resolve S3 endpoint names.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 93,
    topicSlug: 'edge-and-global-routing',
    question: 'A company runs an on-premises application that is powered by a MySQL database. The company is migrating the application to AWS to increase the application\'s elasticity and availability. The current architecture shows heavy read activity on the database during times of normal operation. Every 4 hours, the company\'s development team pulls a full export of the production database to populate a database in the staging environment. During this period, users experience unacceptable application latency. The development team is unable to use the staging environment until the procedure completes.',
    answer: 'A. solutions architect must recommend replacement architecture that alleviates the application latency issue. The replacement architecture also must give the development team the ability to continue using the staging environment without delay.',
    answerVariants: [
      'A. Redesign with managed read scaling and isolated staging refresh path to remove latency spikes.',
      'B. Keep MySQL on-prem and add larger storage array for export jobs.',
      'C. Use weekly full exports to S3 and restore staging manually.',
      'D. Add CloudFront cache in front of on-prem application APIs.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 94,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is designing an application where users upload small files into Amazon S3. After a user uploads a file, the file requires one-time simple processing to transform the data and save the data in JSON format for later analysis. Each file must be processed as quickly as possible after it is uploaded. Demand will vary. On some days, users will upload a high number of files. On other days, users will upload a few files or no files. Which solution meets these requirements with the LEAST operational overhead?',
    answer: 'C. Configure Amazon S3 to send an event notification to an Amazon Simple Queue Service (Amazon SQS) queue. Use an AWS Lambda function to read from the queue and process the data. Store the resulting JSON file in Amazon DynamoDB.',
    answerVariants: [
      'A. Trigger EC2 autoscaling cron jobs to poll S3 every 10 minutes.',
      'B. Use EventBridge scheduled rules to process new uploads hourly.',
      'C. S3 event -> SQS -> Lambda for immediate scalable asynchronous processing.',
      'D. Write uploads first to RDS then transform with stored procedures.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 95,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An application allows users at a company\'s headquarters to access product data. The product data is stored in an Amazon RDS MySQL DB instance. The operations team has isolated an application performance slowdown and wants to separate read traffic from write traffic. A solutions architect needs to optimize the application\'s performance quickly. What should the solutions architect recommend?',
    answer: 'D. Create read replicas for the database. Configure the read replicas with the same compute and storage resources as the source database.',
    answerVariants: [
      'A. Increase DB instance size and keep all reads/writes on primary.',
      'B. Add ElastiCache layer and disable direct DB reads completely.',
      'C. Move write workload to replica and reads to primary.',
      'D. Create read replicas and route read traffic to replicas.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 96,
    topicSlug: 'compute-selection-and-scaling',
    question: 'C. Users can terminate an EC2 instance in the us-east-1 Region when the user\'s source IP is 10.100.100.254.',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Insufficient source question content to define accurate options.',
      'B. Deny EC2 termination unless request uses MFA-authenticated API.',
      'C. Allow EC2 termination from specific source CIDR ranges only.',
      'D. Require tag-based condition keys for termination operations.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 97,
    topicSlug: 'storage-performance-patterns',
    question: 'A company has a large Microsoft SharePoint deployment running on-premises that requires Microsoft Windows shared file storage. The company wants to migrate this workload to the AWS Cloud and is considering various storage options. The storage solution must be highly available and integrated with Active Directory for access control. Which solution will satisfy these requirements?',
    answer: 'D. Create an Amazon FSx for Windows File Server file system on AWS and set the Active Directory domain for authentication.',
    answerVariants: [
      'A. Use Amazon EFS with AD Connector for SMB compatibility.',
      'B. Use S3 File Gateway with NTFS ACL synchronization.',
      'C. Use FSx for Lustre and integrate with AD groups.',
      'D. Use FSx for Windows File Server integrated with Active Directory.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 98,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
    answerVariants: [
      'A. Insufficient source question content to define reliable choices.',
      'B. Use highly available Multi-AZ architecture and least-privilege IAM.',
      'C. Use S3 + CloudFront + Lambda for serverless scaling.',
      'D. Use RDS Multi-AZ with read replicas and proxy.',
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 99,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is implementing a shared storage solution for a gaming application that is hosted in an on-premises data center. The company needs the ability to use Lustre clients to access data. The solution must be fully managed. Which solution meets these requirements?',
    answer: 'D. Create an Amazon FSx for Lustre file system. Attach the file system to the origin server. Connect the application server to the file system.',
    answerVariants: [
      'A. Use EFS because Lustre clients can mount it via NFS.',
      'B. Use S3 with Transfer Acceleration for shared filesystem access.',
      'C. Use FSx for Windows with SMB clients and AD integration.',
      'D. Use FSx for Lustre as fully managed Lustre-compatible shared storage.',
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 100,
    topicSlug: 'identity-access-and-governance',
    question: 'A company\'s containerized application runs on an Amazon EC2 instance. The application needs to download security certificates before it can communicate with other business applications. The company wants a highly secure solution to encrypt and decrypt the certificates in near real time. The solution also needs to store data in highly available storage after the data is encrypted. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Create an AWS Key Management Service (AWS KMS) customer managed key. Allow the EC2 role to use the KMS key for encryption',
    answerVariants: [
      'A. Store certificates in S3 encrypted with SSE-S3 and read directly.',
      'B. Use CloudHSM only and keep plaintext certs on EC2 instance store.',
      'C. Use KMS CMK with IAM role permissions and store encrypted data durably.',
      'D. Use Parameter Store plaintext and periodic manual re-encryption.',
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 101,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect is designing a VPC with public and private subnets. The VPC and subnets use IPv4 CIDR blocks. There is one public subnet and one private subnet in each of three Availability Zones (AZs) for high availability. An internet gateway is used to provide internet access for the public subnets. The private subnets require access to the internet to allow Amazon EC2 instances to download software updates. What should the solutions architect do to enable Internet access for the private subnets?',
    answer: 'A. Create three NAT gateways, one for each public subnet in each AZ. Create a private route table for each AZ that forwards non-VPC traffic to the NAT gateway in its AZ.',
    answerVariants: [
      'A. Create three NAT gateways, one for each public subnet in each AZ. Create a private route table for each AZ that forwards non-VPC traffic to the NAT gateway in its AZ.',
      'B. Create a single NAT gateway in one AZ public subnet. Update all private subnet route tables to route internet traffic through this single NAT gateway.',
      'C. Create an internet gateway attachment for each private subnet. Configure security groups to restrict outbound traffic to software update IP ranges only.',
      'D. Use VPC peering to connect each private subnet to a separate public VPC that already has internet access configured.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 102,
    topicSlug: 'storage-performance-patterns',
    question: 'A company wants to migrate an on-premises data center to AWS. The data center hosts an SFTP server that stores its data on an NFS-based file system. The server holds 200 GB of data that needs to be transferred. The server must be hosted on an Amazon EC2 instance that uses an Amazon Elastic File System (Amazon EFS) file system. Which combination of steps should a solutions architect take to automate this task? (Choose two.)',
    answer: 'A. Launch the EC2 instance into the same Availability Zone as the EFS file system.',
    answerVariants: [
      'A. Launch the EC2 instance into the same Availability Zone as the EFS file system.',
      'B. Install AWS Storage Gateway tape gateway on premises and connect it to the EFS file system directly.',
      'C. Use Amazon S3 Transfer Acceleration to copy the data to S3, then use S3 sync tools to transfer data to EFS.',
      'D. Create a new AWS Direct Connect connection and use rsync over Direct Connect to transfer the 200 GB to EFS.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 103,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company has an AWS Glue extract, transform, and load (ETL) job that runs every day at the same time. The job processes XML data that is in an Amazon S3 bucket. New data is added to the S3 bucket every day. A solutions architect notices that AWS Glue is processing all the data during each run. What should the solutions architect do to prevent AWS Glue from reprocessing old data?',
    answer: 'A. Edit the job to use job bookmarks.',
    answerVariants: [
      'A. Edit the job to use job bookmarks.',
      'B. Configure the Glue job to enable DPU scaling and trigger-based execution on S3 event notifications.',
      'C. Use an AWS Lambda function to delete processed objects from S3 immediately after each Glue run completes.',
      'D. Add an S3 Lifecycle policy to archive processed XML files to S3 Glacier Instant Retrieval after one day.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 104,
    topicSlug: 'network-security-controls',
    question: 'A solutions architect must design a highly available infrastructure for a website. The website is powered by Windows web servers that run on Amazon EC2 instances. The solutions architect must implement a solution that can mitigate a large-scale DDoS attack that originates from thousands of IP addresses. Downtime is not acceptable for the website. Which actions should the solutions architect take to protect the website from such an attack? (Choose two.)',
    answer: 'A. Use AWS Shield Advanced to stop the DDoS attack.',
    answerVariants: [
      'A. Use AWS Shield Advanced to stop the DDoS attack.',
      'B. Configure AWS Config rules to automatically revoke IAM permissions from instances that exhibit abnormal outbound traffic.',
      'C. Create a custom CloudWatch alarm to detect unusual traffic patterns and trigger an EC2 Auto Scaling scale-in action.',
      'D. Use Amazon GuardDuty to automatically block suspicious traffic at the network layer in real time.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 105,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is preparing to deploy a new serverless workload. A solutions architect must use the principle of least privilege to configure permissions that will be used to run an AWS Lambda function. An Amazon EventBridge (Amazon CloudWatch Events) rule will invoke the function. Which solution meets these requirements?',
    answer: 'D. Add a resource-based policy to the function with lambda:InvokeFunction as the action and Service: events.amazonaws.com as the principal.',
    answerVariants: [
      'A. Create an IAM execution role for the Lambda function with the AmazonEventBridgeFullAccess managed policy attached.',
      'B. Create an IAM role for Amazon EventBridge with lambda:InvokeFunction permission and attach the role to the EventBridge rule.',
      'C. Add an inline policy to the Lambda execution role granting events.amazonaws.com permission to invoke the function.',
      'D. Add a resource-based policy to the function with lambda:InvokeFunction as the action and Service: events.amazonaws.com as the principal.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 106,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is preparing to store confidential data in Amazon S3. For compliance reasons, the data must be encrypted at rest. Encryption key usage must be logged for auditing purposes. Keys must be rotated every year. Which solution meets these requirements and is the MOST operationally efficient?',
    answer: 'D. Server-side encryption with AWS KMS keys (SSE-KMS) with automatic rotation',
    answerVariants: [
      'A. Use client-side encryption with customer-managed keys stored in AWS Secrets Manager. Rotate keys manually every year.',
      'B. Use SSE-S3 (AES-256) with Amazon S3-managed keys. Enable AWS CloudTrail to log all S3 API calls for auditing purposes.',
      'C. Use SSE-KMS with a customer-managed key. Enable CloudTrail for key usage auditing. Configure manual key rotation every year.',
      'D. Server-side encryption with AWS KMS keys (SSE-KMS) with automatic rotation.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 107,
    topicSlug: 'event-driven-and-messaging',
    question: 'A bicycle sharing company is developing a multi-tier architecture to track the location of its bicycles during peak operating hours. The company wants to use these data points in its existing analytics platform. A solutions architect must determine the most viable multi-tier option to support this architecture. The data points must be accessible from the REST API. Which action meets these requirements for storing and retrieving location data?',
    answer: 'D. Use Amazon API Gateway with Amazon Kinesis Data Analytics.',
    answerVariants: [
      'A. Store location data in Amazon RDS with read replicas. Expose bicycle locations via Amazon API Gateway with Lambda integration.',
      'B. Use Amazon DynamoDB Streams to capture location updates in real time. Extract data with AWS Lambda and expose via an ALB.',
      'C. Use Amazon SQS to queue location messages from bicycles. Process with an EC2 fleet and cache results in ElastiCache.',
      'D. Use Amazon API Gateway with Amazon Kinesis Data Analytics.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 108,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has an automobile sales website that stores its listings in a database on Amazon RDS. When an automobile is sold, the listing needs to be removed from the website and the data must be sent to multiple target systems. Which design should a solutions architect recommend?',
    answer: 'A. Create an AWS Lambda function triggered when the database on Amazon RDS is updated to send the information to an Amazon Simple',
    answerVariants: [
      'A. Create an AWS Lambda function triggered when the database on Amazon RDS is updated to send the information to an Amazon SNS topic. Subscribe the target systems to the SNS topic.',
      'B. Use Amazon EventBridge to detect changes in the RDS database. Route events to a dedicated SQS queue for each target system.',
      'C. Deploy an EC2-based polling application that checks RDS every minute and pushes sold-listing data to target systems via HTTP.',
      'D. Configure AWS DMS to replicate changed records to each target system\'s separate RDS database instance.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 109,
    topicSlug: 'identity-access-and-governance',
    question: 'A company needs to store data in Amazon S3 and must prevent the data from being changed. The company wants new objects that are uploaded to Amazon S3 to remain unchangeable for a nonspecific amount of time until the company decides to modify the objects. Only specific users in the company\'s AWS account can have the ability 10 delete the objects. What should a solutions architect do to meet these requirements?',
    answer: 'D. Create an S3 bucket with S3 Object Lock enabled. Enable versioning. Add a legal hold to the objects. Add the s3:PutObjectLegalHold permission to the IAM policies of users who need to delete the objects.',
    answerVariants: [
      'A. Enable MFA Delete on the S3 bucket. Create a bucket policy that denies all DeleteObject actions for all IAM users except a specific group.',
      'B. Enable S3 Versioning on the bucket. Create a bucket policy that allows only a specific IAM role to permanently delete object versions.',
      'C. Use S3 Object Lock in governance mode with a fixed retention period. Grant s3:BypassGovernanceRetention to specific IAM users.',
      'D. Create an S3 bucket with S3 Object Lock enabled. Enable versioning. Add a legal hold to the objects. Add the s3:PutObjectLegalHold permission to the IAM policies of users who need to delete the objects.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 110,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A social media company allows users to upload images to its website. The website runs on Amazon EC2 instances. During upload requests, the website resizes the images to a standard size and stores the resized images in Amazon S3. Users are experiencing slow upload requests to the website. The company needs to reduce coupling within the application and improve website performance. A solutions architect must design the most operationally efficient process for image uploads. Which combination of actions should the solutions architect take to meet these requirements? (Choose two.)',
    answer: 'B. Configure the web server to upload the original images to Amazon S3.',
    answerVariants: [
      'A. Move the EC2 instances behind a Network Load Balancer and upgrade instance types to handle SSL termination and image processing together.',
      'B. Configure the web server to upload the original images to Amazon S3.',
      'C. Create an AWS Lambda function to resize the images. Configure the Lambda function to trigger on Amazon S3 object creation events.',
      'D. Use Amazon ElastiCache for Redis to cache image metadata and reduce database IO load during upload processing.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 111,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company recently migrated a message processing system to AWS. The system receives messages into an ActiveMQ queue running on an Amazon EC2 instance. Messages are processed by a consumer application running on Amazon EC2. The consumer application processes the messages and writes results to a MySQL database running on Amazon EC2. The company wants this application to be highly available with low operational complexity. Which architecture offers the HIGHEST availability?',
    answer: 'D. Use Amazon MQ with active/standby brokers configured across two Availability Zones. Add an Auto Scaling group for the consumer EC2 instances across two Availability Zones. Use Amazon RDS for MySQL with Multi-AZ enabled.',
    answerVariants: [
      'A. Migrate ActiveMQ to Amazon SQS. Deploy consumer EC2 instances in an Auto Scaling group across two AZs. Migrate MySQL to RDS Multi-AZ.',
      'B. Create AMIs of existing EC2 instances and launch copies in a second AZ. Use Route 53 failover routing between Availability Zones.',
      'C. Replace ActiveMQ with Amazon Kinesis Data Streams. Deploy consumer instances in an Auto Scaling group. Migrate MySQL to DynamoDB.',
      'D. Use Amazon MQ with active/standby brokers configured across two Availability Zones. Add an Auto Scaling group for the consumer EC2 instances across two Availability Zones. Use Amazon RDS for MySQL with Multi-AZ enabled.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 112,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company hosts a containerized web application on a fleet of on-premises servers that process incoming requests. The number of requests is growing quickly. The on-premises servers cannot handle the increased number of requests. The company wants to move the application to AWS with minimum code changes and minimum development effort. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use AWS Fargate on Amazon Elastic Container Service (Amazon ECS) to run the containerized web application with Service Auto Scaling. Use an Application Load Balancer to distribute the incoming requests.',
    answerVariants: [
      'A. Use AWS Fargate on Amazon Elastic Container Service (Amazon ECS) to run the containerized web application with Service Auto Scaling. Use an Application Load Balancer to distribute the incoming requests.',
      'B. Deploy containers to Amazon EC2 instances behind an ALB. Use a launch template and EC2 Auto Scaling group to scale the instances.',
      'C. Use Amazon EKS with EC2 worker nodes to orchestrate the containers. Attach an ALB Ingress controller for traffic distribution.',
      'D. Migrate the containerized application to AWS Elastic Beanstalk multi-container Docker environment with enhanced health reporting.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 113,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses 50 TB of data for reporting. The company wants to move this data from on premises to AWS. A custom application in the company\'s data center runs a weekly data transformation job. The company plans to pause the application until the data transfer is complete and needs to begin the transfer process as soon as possible. The data center does not have any available network bandwidth for additional workloads. A solutions architect must transfer the data and must configure the transformation job to continue to run in the AWS Cloud. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Order an AWS Snowball Edge Storage Optimized device. Copy the data to the device. Create a custom transformation job by using AWS Glue.',
    answerVariants: [
      'A. Set up a new AWS Direct Connect connection to the data center. Use AWS DataSync over Direct Connect to transfer 50 TB to Amazon S3.',
      'B. Provision a temporary Direct Connect link and use rsync over the link to move 50 TB overnight. Use Lambda for transformation.',
      'C. Order an AWS Snowball Edge Storage Optimized device. Copy the data to the device. Create a custom transformation job by using AWS Glue.',
      'D. Enable AWS Storage Gateway volume gateway on premises to cache 50 TB locally. Use S3 Cross-Region Replication for the data transfer.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 114,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has created an image analysis application in which users can upload photos and add photo frames to their images. The users upload images and metadata to indicate which photo frames they want to add to their images. The application uses a single Amazon EC2 instance and Amazon DynamoDB to store the metadata. The application is becoming more popular, and the number of users is increasing. The company expects the number of concurrent users to vary significantly depending on the time of day and day of week. The company must ensure that the application can scale to meet the needs of the growing user base. Which solution meats these requirements?',
    answer: 'C. Use AWS Lambda to process the photos. Store the photos in Amazon S3. Retain DynamoDB to store the metadata.',
    answerVariants: [
      'A. Add more EC2 instances behind an ALB with Auto Scaling for image processing. Use EBS volumes attached to each instance for photo storage.',
      'B. Migrate the application to a GPU-optimized EC2 instance type. Use Amazon EFS for shared photo storage across all instances.',
      'C. Use AWS Lambda to process the photos. Store the photos in Amazon S3. Retain DynamoDB to store the metadata.',
      'D. Use EC2 Auto Scaling with an SQS queue to distribute image processing jobs. Store photos in Amazon RDS with BLOB column storage.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 115,
    topicSlug: 'database-performance-and-caching',
    question: 'A medical records company is hosting an application on Amazon EC2 instances. The application processes customer data files that are stored on Amazon S3. The EC2 instances are hosted in public subnets. The EC2 instances access Amazon S3 over the internet, but they do not require any other network access.',
    answer: 'A. new requirement mandates that the network traffic for file transfers take a private route and not be sent over the internet.',
    answerVariants: [
      'A. Create a gateway VPC endpoint for Amazon S3. Configure the route tables in the public subnets to route S3 traffic through the VPC endpoint.',
      'B. Move the EC2 instances to private subnets. Create a NAT gateway in the public subnet to allow EC2 instances to reach S3 over the internet.',
      'C. Enable Amazon S3 Transfer Acceleration on the S3 bucket. Use TLS-encrypted VPN tunnels between EC2 instances and S3 endpoints.',
      'D. Create an interface VPC endpoint for Amazon S3 using AWS PrivateLink. Assign the endpoint to the subnet used by the EC2 instances.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 116,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses a popular content management system (CMS) for its corporate website. However, the required patching and maintenance are burdensome. The company is redesigning its website and wants anew solution. The website will be updated four times a year and does not need to have any dynamic content available. The solution must provide high scalability and enhanced security. Which combination of changes will meet these requirements with the LEAST operational overhead? (Choose two.)',
    answer: 'A. Configure Amazon CloudFront in front of the website to use HTTPS functionality.',
    answerVariants: [
      'A. Configure Amazon CloudFront in front of the website to use HTTPS functionality.',
      'B. Use AWS WAF to set IP-based access controls and protect the website against SQL injection and cross-site scripting attacks.',
      'C. Migrate the CMS to Amazon EC2 instances behind an ALB with an RDS backend to separate patching from application updates.',
      'D. Configure AWS Systems Manager Patch Manager to automate patching of the CMS on the existing infrastructure.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 117,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company stores its application logs in an Amazon CloudWatch Logs log group. A new policy requires the company to store all application logs in Amazon OpenSearch Service (Amazon Elasticsearch Service) in near-real time. Which solution will meet this requirement with the LEAST operational overhead?',
    answer: 'C. Create an Amazon Kinesis Data Firehose delivery stream. Configure the log group as the delivery streams sources. Configure Amazon OpenSearch Service (Amazon Elasticsearch Service) as the delivery stream\'s destination.',
    answerVariants: [
      'A. Create an AWS Lambda function subscribed to the CloudWatch Logs log group. Write the Lambda function to transform and load data into OpenSearch.',
      'B. Configure CloudWatch Logs to forward data to Amazon Kinesis Data Firehose. Buffer the data in Amazon S3 before loading into OpenSearch.',
      'C. Create an Amazon Kinesis Data Firehose delivery stream. Configure the log group as the delivery stream\'s source. Configure Amazon OpenSearch Service as the delivery stream\'s destination.',
      'D. Export log data using scheduled AWS CLI scripts triggered by EventBridge. Batch-upload to OpenSearch using Logstash on an EC2 instance.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 118,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company is building a web-based application running on Amazon EC2 instances in multiple Availability Zones. The web application will provide access to a repository of text documents totaling about 900 TB in size. The company anticipates that the web application will experience periods of high demand. A solutions architect must ensure that the storage component for the text documents can scale to meet the demand of the application at all times. The company is concerned about the overall cost of the solution. Which storage solution meets these requirements MOST cost-effectively?',
    answer: 'D. Amazon S3',
    answerVariants: [
      'A. Amazon EFS with Provisioned Throughput mode to ensure consistent performance across all EC2 instances in multiple AZs.',
      'B. Amazon EBS with io2 volumes attached to each EC2 instance to provide high-throughput access to text documents.',
      'C. Amazon FSx for Windows File Server to provide shared file storage with configurable throughput and capacity auto-scaling.',
      'D. Amazon S3 for storage with an Application Load Balancer to distribute document access requests across EC2 instances.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 119,
    topicSlug: 'identity-access-and-governance',
    question: 'A global company is using Amazon API Gateway to design REST APIs for its loyalty club users in the us-east-1 Region and the ap-southeast-2 Region. A solutions architect must design a solution to protect these API Gateway managed REST APIs across multiple accounts from SQL injection and cross-site scripting attacks. Which solution will meet these requirements with the LEAST amount of administrative effort?',
    answer: 'A. Set up AWS WAF in both Regions. Associate Regional web ACLs with an API stage.',
    answerVariants: [
      'A. Set up AWS WAF in both Regions. Associate Regional web ACLs with an API stage.',
      'B. Enable AWS Shield Advanced on the API Gateway endpoints in both Regions to prevent SQL injection and scripting attacks.',
      'C. Deploy a third-party WAF appliance on EC2 instances in both Regions in front of each API Gateway endpoint.',
      'D. Create a Lambda authorizer for each API Gateway that validates all request input against an allowlist to block injection attacks.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 120,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has implemented a self-managed DNS solution on three Amazon EC2 instances behind a Network Load Balancer (NLB) in the us-west-2 Region. Most of the company\'s users are located in the United States and Europe. The company wants to improve the performance and availability of the solution. The company launches and configures three EC2 instances in the eu-west-1 Region and adds the EC2 instances as targets for a new NLB. Which solution can the company use to route traffic to all the EC2 instances?',
    answer: 'A. Create an Amazon Route 53 geolocation routing policy to route requests to one of the two NLBs. Create an Amazon CloudFront distribution. Use the Route 53 record as the distribution\'s origin.',
    answerVariants: [
      'A. Create an Amazon Route 53 geolocation routing policy to route requests to one of the two NLBs. Create an Amazon CloudFront distribution. Use the Route 53 record as the distribution\'s origin.',
      'B. Use AWS Global Accelerator. Add both NLBs as endpoints with equal endpoint weights to distribute traffic across Regions.',
      'C. Create an Amazon Route 53 latency-based routing policy with health checks to direct users to the NLB in the closest Region.',
      'D. Deploy a Transit Gateway peering attachment between the two Regions. Use BGP-based routing to balance DNS traffic between NLB fleets.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 121,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is running an online transaction processing (OLTP) workload on AWS. This workload uses an unencrypted Amazon RDS DB instance in a Multi-AZ deployment. Daily database snapshots are taken from this instance. What should a solutions architect do to ensure the database and snapshots are always encrypted moving forward?',
    answer: 'A. Encrypt a copy of the latest DB snapshot. Replace existing DB instance by restoring the encrypted snapshot.',
    answerVariants: [
      'A. Encrypt a copy of the latest DB snapshot. Replace the existing DB instance by restoring the encrypted snapshot.',
      'B. Enable encryption on the existing RDS instance by modifying the DB instance settings to use an AWS KMS key.',
      'C. Create an encrypted read replica from the existing unencrypted DB instance. Promote the read replica to primary.',
      'D. Use AWS Database Migration Service to migrate data from the unencrypted instance to a new encrypted RDS instance.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 122,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company wants to build a scalable key management infrastructure to support developers who need to encrypt data in their applications. What should a solutions architect do to reduce the operational burden?',
    answer: 'B. Use AWS Key Management Service (AWS KMS) to protect the encryption keys.',
    answerVariants: [
      'A. Deploy a dedicated hardware security module (HSM) appliance on an EC2 instance that developers access via VPN for key operations.',
      'B. Use AWS Key Management Service (AWS KMS) to protect the encryption keys.',
      'C. Store encryption keys in AWS Secrets Manager. Grant IAM permissions to developers to retrieve the keys on demand.',
      'D. Distribute key material to developers using S3 server-side encryption with customer-provided keys (SSE-C).'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 123,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company has a dynamic web application hosted on two Amazon EC2 instances. The company has its own SSL certificate, which is on each instance to perform SSL termination. There has been an increase in traffic recently, and the operations team determined that SSL encryption and decryption is causing the compute capacity of the web servers to reach their maximum limit. What should a solutions architect do to increase the application\'s performance?',
    answer: 'D. Import the SSL certificate into AWS Certificate Manager (ACM). Create an Application Load Balancer with an HTTPS listener that uses the SSL certificate from ACM.',
    answerVariants: [
      'A. Upgrade the EC2 instances to compute-optimized instance types to better handle SSL/TLS processing overhead.',
      'B. Configure AWS CloudHSM to offload SSL/TLS processing from the EC2 web servers to dedicated hardware.',
      'C. Enable SSL session resumption on the EC2 web servers to reduce the frequency of full SSL handshakes.',
      'D. Import the SSL certificate into AWS Certificate Manager (ACM). Create an Application Load Balancer with an HTTPS listener that uses the SSL certificate from ACM.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 124,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 125,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 126,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect needs to implement a solution to reduce a company\'s storage costs. All the company\'s data is in the Amazon S3 Standard storage class. The company must keep all data for at least 25 years. Data from the most recent 2 years must be highly available and immediately retrievable. Which solution will meet these requirements?',
    answer: 'B. Set up an S3 Lifecycle policy to transition objects to S3 Glacier Deep Archive after 2 years.',
    answerVariants: [
      'A. Apply an S3 Lifecycle policy to immediately move all objects to S3 Standard-Infrequent Access (S3 Standard-IA) to reduce costs.',
      'B. Set up an S3 Lifecycle policy to transition objects to S3 Glacier Deep Archive after 2 years.',
      'C. Enable Amazon S3 Intelligent-Tiering on all objects to automatically optimize storage costs based on access patterns.',
      'D. Create two S3 buckets: one in S3 Standard for the last 2 years and one in S3 Glacier Flexible Retrieval for older data.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 127,
    topicSlug: 'storage-performance-patterns',
    question: 'A media company is evaluating the possibility of moving its systems to the AWS Cloud. The company needs at least 10 TB of storage with the maximum possible I/O performance for video processing, 300 TB of very durable storage for storing media content, and 900 TB of storage to meet requirements for archival media that is not in use anymore. Which set of services should a solutions architect recommend to meet these requirements?',
    answer: 'A. Amazon EBS for maximum performance, Amazon S3 for durable data storage, and Amazon S3 Glacier for archival storage',
    answerVariants: [
      'A. Amazon EBS for maximum performance, Amazon S3 for durable data storage, and Amazon S3 Glacier for archival storage.',
      'B. Amazon EFS Provisioned Throughput for video processing, Amazon S3 for media storage, and Amazon FSx for Lustre for archival.',
      'C. Amazon EC2 instance store for video processing, Amazon EFS Max I/O for media storage, and S3 Glacier Deep Archive for archival.',
      'D. Amazon EBS with io2 for video processing, Amazon EFS Standard for media storage, and Amazon S3 One Zone-IA for archival.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 128,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company wants to run applications in containers in the AWS Cloud. These applications are stateless and can tolerate disruptions within the underlying infrastructure. The company needs a solution that minimizes cost and operational overhead. What should a solutions architect do to meet these requirements?',
    answer: 'A. Use Spot Instances in an Amazon EC2 Auto Scaling group to run the application containers.',
    answerVariants: [
      'A. Use Spot Instances in an Amazon EC2 Auto Scaling group to run the application containers.',
      'B. Deploy containers using AWS Fargate with SCHEDULED tasks that run only during off-peak hours to minimize cost.',
      'C. Purchase Reserved Instances for the container fleet to reduce hourly cost while maintaining continuous availability.',
      'D. Use AWS Lambda with container image support to run stateless containers. Configure provisioned concurrency for warm starts.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 129,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is running a multi-tier web application on premises. The web application is containerized and runs on a number of Linux hosts connected to a PostgreSQL database that contains user records. The operational overhead of maintaining the infrastructure and capacity planning is limiting the company\'s growth. A solutions architect must improve the application\'s infrastructure. Which combination of actions should the solutions architect take to accomplish this? (Choose two.)',
    answer: 'A. Migrate the PostgreSQL database to Amazon Aurora.',
    answerVariants: [
      'A. Migrate the PostgreSQL database to Amazon Aurora.',
      'B. Migrate the web servers to individual Amazon EC2 instances. Create an AMI from each server for horizontal scaling.',
      'C. Use Amazon Redshift Serverless as the database to handle the containerized application queries more efficiently.',
      'D. Replace the PostgreSQL database with Amazon DynamoDB global tables to reduce cross-AZ latency.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 130,
    topicSlug: 'identity-access-and-governance',
    question: 'An application runs on Amazon EC2 instances across multiple Availability Zonas. The instances run in an Amazon EC2 Auto Scaling group behind an Application Load Balancer. The application performs best when the CPU utilization of the EC2 instances is at or near 40%. What should a solutions architect do to maintain the desired performance across all instances in the group?',
    answer: 'B. Use a target tracking policy to dynamically scale the Auto Scaling group.',
    answerVariants: [
      'A. Configure a scheduled scaling policy to add instances during predicted peak hours and remove them during off-peak periods.',
      'B. Use a target tracking policy to dynamically scale the Auto Scaling group.',
      'C. Create a step scaling policy that adds one instance for every 10% increase in average CPU above 40%.',
      'D. Set the Auto Scaling group desired capacity to a fixed value that maintains approximately 40% CPU at average traffic.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 131,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is developing a file-sharing application that will use an Amazon S3 bucket for storage. The company wants to serve all the files through an Amazon CloudFront distribution. The company does not want the files to be accessible through direct navigation to the S3 URL. What should a solutions architect do to meet these requirements?',
    answer: 'D. Create an origin access identity (OAI). Assign the OAI to the CloudFront distribution. Configure the S3 bucket permissions so that only the OAI has read permission.',
    answerVariants: [
      'A. Enable S3 Block Public Access on the bucket. Create an S3 bucket policy that allows only the CloudFront service principal to read objects.',
      'B. Use AWS WAF to create rules on the CloudFront distribution that block requests with direct S3 hostname headers.',
      'C. Attach a VPC endpoint for S3 to the CloudFront distribution. Configure the S3 bucket policy to allow only VPC endpoint access.',
      'D. Create an origin access identity (OAI). Assign the OAI to the CloudFront distribution. Configure the S3 bucket permissions so that only the OAI has read permission.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 132,
    topicSlug: 'edge-and-global-routing',
    question: 'A company\'s website provides users with downloadable historical performance reports. The website needs a solution that will scale to meet the company\'s website demands globally. The solution should be cost-effective, limit the provisioning of infrastructure resources, and provide the fastest possible response time. Which combination should a solutions architect recommend to meet these requirements?',
    answer: 'A. Amazon CloudFront and Amazon S3',
    answerVariants: [
      'A. Amazon CloudFront and Amazon S3.',
      'B. Amazon EC2 with Auto Scaling behind an ALB and Amazon EBS-backed instances with S3 Cross-Region Replication.',
      'C. AWS Global Accelerator with an EC2-based fleet in multiple Regions to distribute downloadable report files.',
      'D. Amazon CloudFront with a fleet of Amazon EC2 instances as the origin to handle high concurrent download requests.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 133,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs an Oracle database on premises. As part of the company\'s migration to AWS, the company wants to upgrade the database to the most recent available version. The company also wants to set up disaster recovery (DR) for the database. The company needs to minimize the operational overhead for normal operations and DR setup. The company also needs to maintain access to the database\'s underlying operating system. Which solution will meet these requirements?',
    answer: 'C. Migrate the Oracle database to Amazon RDS Custom for Oracle. Create a read replica for the database in another AWS Region.',
    answerVariants: [
      'A. Migrate the Oracle database to Amazon RDS for Oracle. Enable Multi-AZ deployment and create a cross-Region read replica for DR.',
      'B. Lift and shift Oracle to Amazon EC2 with Oracle Database installed. Configure Oracle Data Guard in another Region for DR.',
      'C. Migrate the Oracle database to Amazon RDS Custom for Oracle. Create a read replica for the database in another AWS Region.',
      'D. Use AWS Database Migration Service to migrate Oracle to Amazon Aurora PostgreSQL for lower total cost of ownership.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 134,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company wants to move its application to a serverless solution. The serverless solution needs to analyze existing and new data by using SL. The company stores the data in an Amazon S3 bucket. The data requires encryption and must be replicated to a different AWS Region. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Create a new S3 bucket. Load the data into the new S3 bucket. Use S3 Cross-Region Replication (CRR) to replicate encrypted objects to an S3 bucket in another Region. Use server-side encryption with AWS KMS multi-Region kays (SSE-KMS). Use Amazon Athena to query the data.',
    answerVariants: [
      'A. Create a new S3 bucket. Load the data into the new S3 bucket. Use S3 Cross-Region Replication (CRR) to replicate encrypted objects to an S3 bucket in another Region. Use server-side encryption with AWS KMS multi-Region keys (SSE-KMS). Use Amazon Athena to query the data.',
      'B. Use Amazon Redshift as the analytical data warehouse. Enable Redshift cross-Region snapshots for replication and KMS for encryption.',
      'C. Deploy an AWS Glue ETL job to copy and encrypt data continuously to a second Region. Use Amazon Athena for SQL queries.',
      'D. Use Amazon EMR with Apache Hive to run SQL queries on the S3 data. Configure EMR cross-account replication using AWS DataSync.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 135,
    topicSlug: 'network-performance-and-hybrid',
    question: 'A company runs workloads on AWS. The company needs to connect to a service from an external provider. The service is hosted in the provider\'s VPC. According to the company\'s security team, the connectivity must be private and must be restricted to the target service. The connection must be initiated only from the company\'s VPC. Which solution will mast these requirements?',
    answer: 'D. Ask the provider to create a VPC endpoint for the target service. Use AWS PrivateLink to connect to the target service.',
    answerVariants: [
      'A. Establish a VPC peering connection between the company VPC and the provider VPC to access the target service privately.',
      'B. Configure an AWS Site-to-Site VPN between the company VPC and the provider VPC for private encrypted connectivity.',
      'C. Create a Transit Gateway and attach both the company VPC and the provider VPC to it for private service access.',
      'D. Ask the provider to create a VPC endpoint for the target service. Use AWS PrivateLink to connect to the target service.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 136,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 137,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Organizations to create dedicated AWS accounts for each business unit to manage each business unit\'s account independently upon request. The root email recipient missed a notification that was sent to the root user email address of one account. The company wants to ensure that all future notifications are not missed. Future notifications must be limited to account administrators. Which solution will meet these requirements?',
    answer: 'D. Configure all existing AWS accounts and all newly created accounts to use the same root user email address. Configure AWS account alternate contacts in the AWS Organizations console or programmatically.',
    answerVariants: [
      'A. Enable AWS CloudTrail in all accounts to log root user activity. Configure SNS alerts for each account root user sign-in event.',
      'B. Create an Organizations SCP that mandates all accounts configure an alternate contact. Use AWS Config to detect non-compliant accounts.',
      'C. Use Amazon SES to configure an email forwarding rule from the root email address to all account administrators automatically.',
      'D. Configure all existing AWS accounts and all newly created accounts to use the same root user email address. Configure AWS account alternate contacts in the AWS Organizations console or programmatically.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 138,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company runs its ecommerce application on AWS. Every new order is published as a massage in a RabbitMQ queue that runs on an Amazon EC2 instance in a single Availability Zone. These messages are processed by a different application that runs on a separate EC2 instance. This application stores the details in a PostgreSQL database on another EC2 instance. All the EC2 instances are in the same Availability Zone. The company needs to redesign its architecture to provide the highest availability with the least operational overhead. What should a solutions architect do to meet these requirements?',
    answer: 'B. Migrate the queue to a redundant pair (active/standby) of RabbitMQ instances on Amazon MQ. Create a Multi-AZ Auto Scaling group for EC2 instances that host the application. Migrate the database to run on a Multi-AZ deployment of Amazon RDS for PostgreSQL.',
    answerVariants: [
      'A. Replicate the existing architecture across three Availability Zones using EC2 Auto Scaling for all tiers. Use Route 53 health-based failover.',
      'B. Migrate the queue to a redundant pair (active/standby) of RabbitMQ instances on Amazon MQ. Create a Multi-AZ Auto Scaling group for EC2 instances that host the application. Migrate the database to run on a Multi-AZ deployment of Amazon RDS for PostgreSQL.',
      'C. Migrate the RabbitMQ queue to Amazon SQS. Set up an Auto Scaling group for consumers. Migrate PostgreSQL to Amazon DynamoDB.',
      'D. Use Amazon EventBridge as the message broker. Process events with AWS Lambda. Store ecommerce data in Amazon Aurora Serverless.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 139,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A reporting team receives files each day in an Amazon S3 bucket. The reporting team manually reviews and copies the files from this initial S3 bucket to an analysis S3 bucket each day at the same time to use with Amazon QuickSight. Additional teams are starting to send more files in larger sizes to the initial S3 bucket. The reporting team wants to move the files automatically analysis S3 bucket as the files enter the initial S3 bucket. The reporting team also wants to use AWS Lambda functions to run pattern-matching code on the copied data. In addition, the reporting team wants to send the data files to a pipeline in Amazon SageMaker Pipelines. What should a solutions architect do to meet these requirements with the LEAST operational overhead?',
    answer: 'A. Create a Lambda function to copy the files to the analysis S3 bucket. Create an S3 event notification for the analysis S3 bucket. Configure Lambda and SageMaker Pipelines as destinations of the event notification. Configure s3:ObjectCreated:Put as the event type.',
    answerVariants: [
      'A. Create a Lambda function to copy the files to the analysis S3 bucket. Create an S3 event notification for the analysis S3 bucket. Configure Lambda and SageMaker Pipelines as destinations of the event notification. Configure s3:ObjectCreated:Put as the event type.',
      'B. Use Amazon EventBridge to trigger a Step Functions workflow that copies files, invokes Lambda for pattern matching, and starts SageMaker Pipelines.',
      'C. Use AWS Glue to crawl the initial S3 bucket daily. Configure Glue ETL jobs to copy and process data, then notify SageMaker Pipelines.',
      'D. Configure S3 replication from the initial bucket to the analysis bucket. Create separate EventBridge rules for Lambda and SageMaker triggers.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 140,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 141,
    topicSlug: 'edge-and-global-routing',
    question: 'A company runs a web-based portal that provides users with global breaking news, local alerts, and weather updates. The portal delivers each user a personalized view by using mixture of static and dynamic content. Content is served over HTTPS through an API server running on an Amazon EC2 instance behind an Application Load Balancer (ALB). The company wants the portal to provide this content to its users across the world as quickly as possible. How should a solutions architect design the application to ensure the LEAST amount of latency for all users?',
    answer: 'B. Deploy the application stack in two AWS Regions. Use an Amazon Route 53 latency routing policy to serve all content from the ALB in the closest Region.',
    answerVariants: [
      'A. Deploy Amazon CloudFront in front of the ALB. Configure CloudFront to cache dynamic content with short TTLs for global users.',
      'B. Deploy the application stack in two AWS Regions. Use an Amazon Route 53 latency routing policy to serve all content from the ALB in the closest Region.',
      'C. Enable ALB cross-zone load balancing and increase to more Availability Zones within one Region to reduce latency.',
      'D. Configure Amazon CloudFront with signed cookies to protect and deliver both static and dynamic content to users globally.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 142,
    topicSlug: 'edge-and-global-routing',
    question: 'A gaming company is designing a highly available architecture. The application runs on a modified Linux kernel and supports only UDP-based traffic. The company needs the front-end tier to provide the best possible user experience. That tier must have low latency, route traffic to the nearest edge location, and provide static IP addresses for entry into the application endpoints. What should a solutions architect do to meet these requirements?',
    answer: 'C. Configure AWS Global Accelerator to forward requests to a Network Load Balancer. Use Amazon EC2 instances for the application in an EC2 Auto Scaling group.',
    answerVariants: [
      'A. Use Amazon CloudFront with a custom origin pointing to the application NLB. Enable anycast static IP addresses for the distribution.',
      'B. Deploy the application behind an NLB in each Region. Use Amazon Route 53 geolocation routing to direct users to the nearest NLB.',
      'C. Configure AWS Global Accelerator to forward requests to a Network Load Balancer. Use Amazon EC2 instances for the application in an EC2 Auto Scaling group.',
      'D. Use Amazon API Gateway regional endpoints with UDP passthrough mode and edge-optimized caching for global distribution.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 143,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company wants to migrate its existing on-premises monolithic application to AWS. The company wants to keep as much of the front-end code and the backend code as possible. However, the company wants to break the application into smaller applications. A different team will manage each application. The company needs a highly scalable solution that minimizes operational overhead. Which solution will meet these requirements?',
    answer: 'D. Host the application on Amazon Elastic Container Service (Amazon ECS). Set up an Application Load Balancer with Amazon ECS as the target.',
    answerVariants: [
      'A. Rewrite the application as individual AWS Lambda functions. Use Amazon API Gateway to route requests to each Lambda function.',
      'B. Deploy the monolithic application on Amazon EC2 with Auto Scaling. Use separate code repositories for each logical component.',
      'C. Migrate the application to AWS Elastic Beanstalk with multiple separate environments for each application component.',
      'D. Host the application on Amazon Elastic Container Service (Amazon ECS). Set up an Application Load Balancer with Amazon ECS as the target.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 144,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company recently started using Amazon Aurora as the data store for its global ecommerce application. When large reports are run, developers report that the ecommerce application is performing poorly. After reviewing metrics in Amazon CloudWatch, a solutions architect finds that the ReadIOPS and CPUUtilizalion metrics are spiking when monthly reports run. What is the MOST cost-effective solution?',
    answer: 'B. Migrate the monthly reporting to an Aurora Replica.',
    answerVariants: [
      'A. Scale up the Aurora DB instance to a larger instance type during monthly report generation and scale back down afterward.',
      'B. Migrate the monthly reporting to an Aurora Replica.',
      'C. Add an Amazon ElastiCache cluster in front of Aurora to cache frequently queried data used during monthly report runs.',
      'D. Enable Aurora Auto Scaling to automatically provision additional Aurora Replicas when ReadIOPS exceeds a defined threshold.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 145,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company hosts a website analytics application on a single Amazon EC2 On-Demand Instance. The analytics software is written in PHP and uses a MySQL database. The analytics software, the web server that provides PHP, and the database server are all hosted on the EC2 instance. The application is showing signs of performance degradation during busy times and is presenting 5xx errors. The company needs to make the application scale seamlessly. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'D. Migrate the database to an Amazon Aurora MySQL DB instance. Create an AMI of the web application. Apply the AMI to a launch template. Create an Auto Scaling group with the launch template Configure the launch template to use a Spot Fleet. Attach an Application Load Balancer to the Auto Scaling group.',
    answerVariants: [
      'A. Increase the EC2 instance to a memory-optimized instance type. Upgrade the MySQL database to an RDS multi-AZ instance.',
      'B. Deploy the PHP application on AWS Elastic Beanstalk. Migrate the MySQL database to Amazon RDS Multi-AZ for high availability.',
      'C. Launch multiple EC2 On-Demand instances behind an ALB. Create an RDS read replica for MySQL to offload read queries.',
      'D. Migrate the database to an Amazon Aurora MySQL DB instance. Create an AMI of the web application. Apply the AMI to a launch template. Create an Auto Scaling group with the launch template. Configure the launch template to use a Spot Fleet. Attach an Application Load Balancer to the Auto Scaling group.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 146,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs a stateless web application in production on a group of Amazon EC2 On-Demand Instances behind an Application Load Balancer. The application experiences heavy usage during an 8-hour period each business day. Application usage is moderate and steady overnight. Application usage is low during weekends. The company wants to minimize its EC2 costs without affecting the availability of the application. Which solution will meet these requirements?',
    answer: 'B. Use Reserved Instances for the baseline level of usage. Use Spot instances for any additional capacity that the application needs.',
    answerVariants: [
      'A. Purchase Compute Savings Plans to cover all EC2 usage. Configure Auto Scaling minimum capacity to zero during weekends.',
      'B. Use Reserved Instances for the baseline level of usage. Use Spot instances for any additional capacity that the application needs.',
      'C. Purchase On-Demand Capacity Reservations for the 8-hour peak window. Use On-Demand Instances for all remaining hours.',
      'D. Use Spot Instances exclusively with a high bid price to maintain availability throughout all business day peak hours.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 147,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company needs to retain application log files for a critical application for 10 years. The application team regularly accesses logs from the past month for troubleshooting, but logs older than 1 month are rarely accessed. The application generates more than 10 TB of logs per month. Which storage option meets these requirements MOST cost-effectively?',
    answer: 'B. Store the logs in Amazon S3. Use S3 Lifecycle policies to move logs more than 1 month old to S3 Glacier Deep Archive.',
    answerVariants: [
      'A. Store logs in Amazon CloudWatch Logs with a 10-year retention policy. Export logs older than 1 month to S3 using metric filters.',
      'B. Store the logs in Amazon S3. Use S3 Lifecycle policies to move logs more than 1 month old to S3 Glacier Deep Archive.',
      'C. Store logs in Amazon EFS with lifecycle management configured to transition to EFS-IA after 30 days.',
      'D. Use Amazon S3 Intelligent-Tiering for all logs to automatically optimize storage costs based on changing access patterns.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 148,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 149,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has a service that produces event data. The company wants to use AWS to process the event data as it is received. The data is written in a specific order that must be maintained throughout processing. The company wants to implement a solution that minimizes operational overhead. How should a solutions architect accomplish this?',
    answer: 'A. Create an Amazon Simple Queue Service (Amazon SQS) FIFO queue to hold messages. Set up an AWS Lambda function to process messages from the queue.',
    answerVariants: [
      'A. Create an Amazon Simple Queue Service (Amazon SQS) FIFO queue to hold messages. Set up an AWS Lambda function to process messages from the queue.',
      'B. Use Amazon Kinesis Data Streams with a single shard to maintain ordering. Deploy a consumer EC2 fleet to read from the stream.',
      'C. Create an Amazon SQS standard queue with message deduplication IDs enabled. Use Lambda concurrency limits to enforce processing order.',
      'D. Use an Amazon SNS FIFO topic to publish ordered events. Subscribe an SQS queue to buffer and replay messages in sequence.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 150,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is migrating an application from on-premises servers to Amazon EC2 instances. As part of the migration design requirements, a solutions architect must implement infrastructure metric alarms. The company does not need to take action if CPU utilization increases to more than 50% for a short burst of time. However, if the CPU utilization increases to more than 50% and read IOPS on the disk are high at the same time, the company needs to act as soon as possible. The solutions architect also must reduce false alarms. What should the solutions architect do to meet these requirements?',
    answer: 'A. Create Amazon CloudWatch composite alarms where possible.',
    answerVariants: [
      'A. Create Amazon CloudWatch composite alarms where possible.',
      'B. Create two separate CloudWatch alarms: one for CPU and one for disk IOPS. Use Amazon SNS to notify on each alarm independently.',
      'C. Use CloudWatch anomaly detection to baseline CPU and IOPS patterns. Alert only when metrics deviate beyond the expected band.',
      'D. Write a CloudWatch metric math expression that multiplies CPU utilization by disk IOPS. Set a threshold on the compound metric.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 151,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 152,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company uses a three-tier web application to provide training to new employees. The application is accessed for only 12 hours every day. The company is using an Amazon RDS for MySQL DB instance to store information and wants to minimize costs. What should a solutions architect do to meet these requirements?',
    answer: 'D. Create AWS Lambda functions to start and stop the DB instance. Create Amazon EventBridge (Amazon CloudWatch Events) scheduled rules to invoke the Lambda functions. Configure the Lambda functions as event targets for the rules.',
    answerVariants: [
      'A. Migrate the application to AWS Elastic Beanstalk with an RDS managed database. Enable auto-scaling to reach zero instances overnight.',
      'B. Use Amazon Aurora Serverless v2 for the database. The serverless mode automatically pauses during periods of inactivity.',
      'C. Purchase a 1-year Reserved Instance for the RDS MySQL DB instance to reduce the effective hourly cost.',
      'D. Create AWS Lambda functions to start and stop the DB instance. Create Amazon EventBridge (Amazon CloudWatch Events) scheduled rules to invoke the Lambda functions. Configure the Lambda functions as event targets for the rules.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 153,
    topicSlug: 'identity-access-and-governance',
    question: 'A company sells ringtones created from clips of popular songs. The files containing the ringtones are stored in Amazon S3 Standard and are at least 128 KB in size. The company has millions of files, but downloads are infrequent for ringtones older than 90 days. The company needs to save money on storage while keeping the most accessed files readily available for its users. Which action should the company take to meet these requirements MOST cost-effectively?',
    answer: 'D. Implement an S3 Lifecycle policy that moves the objects from S3 Standard to S3 Standard-Infrequent Access (S3 Standard-1A) after 90 days.',
    answerVariants: [
      'A. Enable Amazon S3 Intelligent-Tiering on all ringtone files to automatically move them to the optimal cost tier.',
      'B. Implement an S3 Lifecycle policy to move all files to S3 Glacier Flexible Retrieval after 30 days.',
      'C. Create a second S3 bucket using S3 One Zone-IA. Use AWS Lambda to copy ringtone files older than 90 days to the new bucket.',
      'D. Implement an S3 Lifecycle policy that moves the objects from S3 Standard to S3 Standard-Infrequent Access (S3 Standard-IA) after 90 days.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 154,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company needs to save the results from a medical trial to an Amazon S3 repository. The repository must allow a few scientists to add new files and must restrict all other users to read-only access. No users can have the ability to modify or delete any files in the repository. The company must keep every file in the repository for a minimum of 1 year after its creation date. Which solution will meet these requirements?',
    answer: 'B. Use S3 Object Lock in compliance mode with a retention period of 365 days.',
    answerVariants: [
      'A. Enable MFA Delete on the S3 bucket. Create a bucket policy that denies PutObject and DeleteObject for most IAM users.',
      'B. Use S3 Object Lock in compliance mode with a retention period of 365 days.',
      'C. Use S3 Object Lock in governance mode with a retention period of 365 days. Grant s3:BypassGovernanceRetention only to scientists.',
      'D. Enable versioning and create a bucket policy that denies s3:DeleteObjectVersion and s3:PutObject for all non-scientist users.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 155,
    topicSlug: 'edge-and-global-routing',
    question: 'A large media company hosts a web application on AWS. The company wants to start caching confidential media files so that users around the world will have reliable access to the files. The content is stored in Amazon S3 buckets. The company must deliver the content quickly, regardless of where the requests originate geographically. Which solution will meet these requirements?',
    answer: 'C. Deploy Amazon CloudFront to connect the S3 buckets to CloudFront edge servers.',
    answerVariants: [
      'A. Use Amazon S3 Transfer Acceleration to improve download speeds from the S3 buckets for global users.',
      'B. Enable Amazon S3 Cross-Region Replication to copy media files to S3 buckets in every geographic region worldwide.',
      'C. Deploy Amazon CloudFront to connect the S3 buckets to CloudFront edge servers.',
      'D. Use AWS Global Accelerator to route media file download requests to the nearest AWS Region that contains an S3 bucket.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 156,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company produces batch data that comes from different databases. The company also produces live stream data from network sensors and application APIs. The company needs to consolidate all the data into one place for business analytics. The company needs to process the incoming data and then stage the data in different Amazon S3 buckets. Teams will later run one-time queries and import the data into a business intelligence tool to show key performance indicators (KPIs). Which combination of steps will meet these requirements with the LEAST operational overhead? (Choose two.)',
    answer: 'A. Use Amazon Athena for one-time queries. Use Amazon QuickSight to create dashboards for KPIs.',
    answerVariants: [
      'A. Use Amazon Athena for one-time queries. Use Amazon QuickSight to create dashboards for KPIs.',
      'B. Use Amazon Kinesis Data Analytics to query the staged S3 data. Use Amazon Redshift for the KPI dashboard.',
      'C. Use Amazon Redshift Spectrum to query data in S3. Use Tableau connected to Redshift for KPI visualizations.',
      'D. Load all staged S3 data into Amazon DynamoDB. Use DynamoDB Streams to feed live metrics into QuickSight.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 157,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 158,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 159,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 160,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 161,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has a small Python application that processes JSON documents and outputs the results to an on-premises SQL database. The application runs thousands of times each day. The company wants to move the application to the AWS Cloud. The company needs a highly available solution that maximizes scalability and minimizes operational overhead. Which solution will meet these requirements?',
    answer: 'B. Place the JSON documents in an Amazon S3 bucket. Create an AWS Lambda function that runs the Python code to process the documents as they arrive in the S3 bucket. Store the results in an Amazon Aurora DB cluster.',
    answerVariants: [
      'A. Create an Amazon EC2 Auto Scaling group with a Python-based AMI. Use Amazon RDS MySQL for result storage.',
      'B. Place the JSON documents in an Amazon S3 bucket. Create an AWS Lambda function that runs the Python code to process the documents as they arrive in the S3 bucket. Store the results in an Amazon Aurora DB cluster.',
      'C. Use Amazon SQS to queue JSON documents for processing. Run an AWS Batch job to process each document and store results in DynamoDB.',
      'D. Host the Python script on AWS Elastic Beanstalk. Use an RDS PostgreSQL instance to store processing results.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 162,
    topicSlug: 'storage-performance-patterns',
    question: 'A company wants to use high performance computing (HPC) infrastructure on AWS for financial risk modeling. The company\'s HPC workloads run on Linux. Each HPC workflow runs on hundreds of Amazon EC2 Spot Instances, is short-lived, and generates thousands of output files that are ultimately stored in persistent storage for analytics and long-term future use. The company seeks a cloud storage solution that permits the copying of on-premises data to long-term persistent storage to make data available for processing by all EC2 instances. The solution should also be a high performance file system that is integrated with persistent storage to read and write datasets and output files. Which combination of AWS services meets these requirements?',
    answer: 'A. Amazon FSx for Lustre integrated with Amazon S3',
    answerVariants: [
      'A. Amazon FSx for Lustre integrated with Amazon S3.',
      'B. Amazon EFS with Max I/O performance mode integrated with S3 Lifecycle policies for persistent storage.',
      'C. Amazon EBS io2 volumes shared across EC2 Spot Instances using the EBS Multi-Attach feature.',
      'D. AWS Storage Gateway file gateway with local NFS caching to synchronize HPC output files to and from Amazon S3.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 163,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is building a containerized application on premises and decides to move the application to AWS. The application will have thousands of users soon after it is deployed. The company is unsure how to manage the deployment of containers at scale. The company needs to deploy the containerized application in a highly available architecture that minimizes operational overhead. Which solution will meet these requirements?',
    answer: 'A. Store container images in an Amazon Elastic Container Registry (Amazon ECR) repository. Use an Amazon Elastic Container Service (Amazon ECS) cluster with the AWS Fargate launch type to run the containers. Use target tracking to scale automatically based on demand.',
    answerVariants: [
      'A. Store container images in an Amazon Elastic Container Registry (Amazon ECR) repository. Use an Amazon Elastic Container Service (Amazon ECS) cluster with the AWS Fargate launch type to run the containers. Use target tracking to scale automatically based on demand.',
      'B. Store container images in Amazon ECR. Deploy containers on Amazon EC2 instances in an Auto Scaling group managed by a launch template.',
      'C. Use Amazon EKS with EC2 managed node groups to orchestrate the containers. Store images in Amazon ECR.',
      'D. Deploy the containerized application on AWS Elastic Beanstalk using the Docker single-container platform type.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 164,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has two applications: a sender application that sends messages with payloads to be processed and a processing application intended to receive the messages with payloads. The company wants to implement an AWS service to handle messages between the two applications. The sender application can send about 1,000 messages each hour. The messages may take up to 2 days to be processed: If the messages fail to process, they must be retained so that they do not impact the processing of any remaining messages.',
    answer: 'C. Integrate the sender and processor applications with an Amazon Simple Queue Service (Amazon SQS) queue. Configure a dead-letter queue to collect the messages that failed to process.',
    answerVariants: [
      'A. Use Amazon Kinesis Data Streams with a 7-day retention period. Add a consumer application to process records and replay failed ones.',
      'B. Use Amazon SNS to deliver messages from the sender directly to the processor application. Enable retry policies for failed deliveries.',
      'C. Integrate the sender and processor applications with an Amazon Simple Queue Service (Amazon SQS) queue. Configure a dead-letter queue to collect the messages that failed to process.',
      'D. Use Amazon EventBridge event bus to relay messages between sender and processor. Configure event archive and replay for failures.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 165,
    topicSlug: 'edge-and-global-routing',
    question: 'A solutions architect must design a solution that uses Amazon CloudFront with an Amazon S3 origin to store a static website. The company\'s security policy requires that all website traffic be inspected by AWS WAF.',
    answer: 'D. Configure Amazon CloudFront and Amazon S3 to use an origin access identity (OAI) to restrict access to the S3 bucket. Enable AWS WAF on the distribution.',
    answerVariants: [
      'A. Configure S3 Object Lambda to inspect all downloading requests through AWS WAF before content is returned to CloudFront.',
      'B. Enable AWS Shield Advanced on the CloudFront distribution. Attach a WAF web ACL to block non-compliant requests.',
      'C. Deploy an AWS WAF web ACL directly on the S3 bucket. Configure CloudFront to forward all requests through the WAF.',
      'D. Configure Amazon CloudFront and Amazon S3 to use an origin access identity (OAI) to restrict access to the S3 bucket. Enable AWS WAF on the distribution.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 166,
    topicSlug: 'edge-and-global-routing',
    question: 'Organizers for a global event want to put daily reports online as static HTML pages. The pages are expected to generate millions of views from users around the world. The files are stored in an Amazon S3 bucket. A solutions architect has been asked to design an efficient and effective solution. Which action should the solutions architect take to accomplish this?',
    answer: 'D. Use Amazon CloudFront with the S3 bucket as its origin.',
    answerVariants: [
      'A. Enable S3 Transfer Acceleration on the S3 bucket to improve upload and download performance for users worldwide.',
      'B. Enable Amazon S3 Cross-Region Replication to copy HTML pages to S3 buckets in every AWS Region with high traffic.',
      'C. Host the S3 bucket as a static website. Use Amazon Route 53 latency-based routing to direct users to the nearest Region.',
      'D. Use Amazon CloudFront with the S3 bucket as its origin.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 167,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company runs a production application on a fleet of Amazon EC2 instances. The application reads the data from an Amazon SQS queue and processes the messages in parallel. The message volume is unpredictable and often has intermittent traffic. This application should continually process messages without any downtime. Which solution meets these requirements MOST cost-effectively?',
    answer: 'C. Use Reserved Instances for the baseline capacity and use Spot Instances to handle additional capacity.',
    answerVariants: [
      'A. Use On-Demand Instances exclusively to guarantee availability when processing messages from the SQS queue.',
      'B. Migrate to AWS Lambda with SQS event source mapping to process messages without managing EC2 instances at all.',
      'C. Use Reserved Instances for the baseline capacity and use Spot Instances to handle additional capacity.',
      'D. Purchase Dedicated Hosts to ensure maximum SQS message throughput without resource contention.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 168,
    topicSlug: 'identity-access-and-governance',
    question: 'A security team wants to limit access to specific services or actions in all of the team\'s AWS accounts. All accounts belong to a large organization in AWS Organizations. The solution must be scalable and there must be a single point where permissions can be maintained.',
    answer: 'D. Create a service control policy in the root organizational unit to deny access to the services or actions.',
    answerVariants: [
      'A. Create IAM permission boundaries for every IAM role in every AWS account to restrict the allowed set of services.',
      'B. Deploy AWS Config rules to detect unauthorized service usage and trigger Lambda auto-remediation to revoke permissions.',
      'C. Create an IAM role with restricted permissions in each account. Use Organizations tag policies to enforce standards.',
      'D. Create a service control policy in the root organizational unit to deny access to the services or actions.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 169,
    topicSlug: 'network-security-controls',
    question: 'A company is concerned about the security of its public web application due to recent web attacks. The application uses an Application Load Balancer (ALB). A solutions architect must reduce the risk of DDoS attacks against the application. What should the solutions architect do to meet this requirement?',
    answer: 'C. Enable AWS Shield Advanced to prevent attacks.',
    answerVariants: [
      'A. Enable Amazon GuardDuty on the VPC to detect and automatically block malicious traffic at the subnet level.',
      'B. Place the application in a private subnet. Use a NAT gateway so only response traffic can leave the application.',
      'C. Enable AWS Shield Advanced to prevent attacks.',
      'D. Implement Amazon Macie on the ALB to scan incoming HTTP requests for malicious patterns and block suspicious traffic.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 170,
    topicSlug: 'identity-access-and-governance',
    question: 'A company\'s web application is running on Amazon EC2 instances behind an Application Load Balancer. The company recently changed its policy, which now requires the application to be accessed from one specific country only.',
    answer: 'C. Configure AWS WAF on the Application Load Balancer in a VPC.',
    answerVariants: [
      'A. Use Amazon Route 53 geolocation routing to prevent DNS resolution from outside the target country.',
      'B. Configure ALB listener rules to inspect the X-Forwarded-For header and block requests from unapproved IP ranges.',
      'C. Configure AWS WAF on the Application Load Balancer in a VPC.',
      'D. Attach Network ACLs to the public subnet that allow only IP ranges registered in the target country.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 171,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company provides an API to its users that automates inquiries for tax computations based on item prices. The company experiences a larger number of inquiries during the holiday season only that cause slower response times. A solutions architect needs to design a solution that is scalable and elastic. What should the solutions architect do to accomplish this?',
    answer: 'B. Design a REST API using Amazon API Gateway that accepts the item names. API Gateway passes item names to AWS Lambda for tax computations.',
    answerVariants: [
      'A. Deploy a fleet of EC2 instances behind an ALB. Use EC2 Auto Scaling to add instances during the holiday peak period.',
      'B. Design a REST API using Amazon API Gateway that accepts the item names. API Gateway passes item names to AWS Lambda for tax computations.',
      'C. Use Amazon ECS with the Fargate launch type to run a containerized tax computation service. Scale based on ALB request count.',
      'D. Host the tax computation logic on AWS Elastic Beanstalk with environment auto-scaling configured for seasonal demand spikes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 172,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 173,
    topicSlug: 'edge-and-global-routing',
    question: 'A gaming company hosts a browser-based application on AWS. The users of the application consume a large number of videos and images that are stored in Amazon S3. This content is the same for all users. The application has increased in popularity, and millions of users worldwide accessing these media files. The company wants to provide the files to the users while reducing the load on the origin. Which solution meets these requirements MOST cost-effectively?',
    answer: 'B. Deploy an Amazon CloudFront web distribution in front of the S3 bucket.',
    answerVariants: [
      'A. Enable S3 Transfer Acceleration on the S3 bucket to speed up downloads for users in geographically distant locations.',
      'B. Deploy an Amazon CloudFront web distribution in front of the S3 bucket.',
      'C. Use Amazon ElastiCache for Redis to cache S3 object metadata and serve popular media files from memory.',
      'D. Use AWS Global Accelerator to route user requests to the nearest S3 bucket using anycast IP addresses.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 174,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company has a multi-tier application that runs six front-end web servers in an Amazon EC2 Auto Scaling group in a single Availability Zone behind an Application Load Balancer (ALB). A solutions architect needs to modify the infrastructure to be highly available without modifying the application. Which architecture should the solutions architect choose that provides high availability?',
    answer: 'B. Modify the Auto Scaling group to use three instances across each of two Availability Zones.',
    answerVariants: [
      'A. Add a second ALB in a different AWS Region. Use Route 53 failover routing to switch traffic if the primary Region fails.',
      'B. Modify the Auto Scaling group to use three instances across each of two Availability Zones.',
      'C. Create AMIs of the existing instances and deploy them as Reserved Instances in a second AWS Region.',
      'D. Enable AWS Global Accelerator for the ALB to route traffic through multiple edge locations for improved fault tolerance.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 175,
    topicSlug: 'database-performance-and-caching',
    question: 'An ecommerce company has an order-processing application that uses Amazon API Gateway and an AWS Lambda function. The application stores data in an Amazon Aurora PostgreSQL database. During a recent sales event, a sudden surge in customer orders occurred. Some customers experienced timeouts, and the application did not process the orders of those customers.',
    answer: 'A. solutions architect determined that the CPU utilization and memory utilization were high on the database because of a large number of open connections. The solutions architect needs to prevent the timeout errors while making the least possible changes to the application.',
    answerVariants: [
      'A. Use Amazon RDS Proxy in front of the Aurora PostgreSQL database to pool and manage database connections from Lambda.',
      'B. Increase the Aurora PostgreSQL instance to a larger memory-optimized DB instance class to support more open connections.',
      'C. Enable Aurora Auto Scaling to automatically provision additional Aurora Replicas when CPU utilization exceeds 70%.',
      'D. Modify the Lambda function code to explicitly close all database connections immediately after each invocation completes.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 176,
    topicSlug: 'database-performance-and-caching',
    question: 'An application runs on Amazon EC2 instances in private subnets. The application needs to access an Amazon DynamoDB table. What is the MOST secure way to access the table while ensuring that the traffic does not leave the AWS network?',
    answer: 'A. Use a VPC endpoint for DynamoDB.',
    answerVariants: [
      'A. Use a VPC endpoint for DynamoDB.',
      'B. Create a NAT gateway in a public subnet. Configure route tables to send DynamoDB traffic through the NAT gateway.',
      'C. Use AWS PrivateLink with an interface endpoint specifically configured for the DynamoDB service in the VPC.',
      'D. Set up an AWS Site-to-Site VPN tunnel from the private subnet to the DynamoDB service endpoint to encrypt traffic.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 177,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An entertainment company is using Amazon DynamoDB to store media metadata. The application is read intensive and experiencing delays. The company does not have staff to handle additional operational overhead and needs to improve the performance efficiency of DynamoDB without reconfiguring the application. What should a solutions architect recommend to meet this requirement?',
    answer: 'B. Use Amazon DynamoDB Accelerator (DAX).',
    answerVariants: [
      'A. Enable DynamoDB auto scaling to automatically increase read capacity units when read request throughput is high.',
      'B. Use Amazon DynamoDB Accelerator (DAX).',
      'C. Create a DynamoDB global table and add a replica in a nearby AWS Region to reduce read latency.',
      'D. Enable DynamoDB Streams to offload read requests from the primary table to a stream for downstream processing.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 178,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 179,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 180,
    topicSlug: 'network-security-controls',
    question: 'A company is designing a cloud communications platform that is driven by APIs. The application is hosted on Amazon EC2 instances behind a Network Load Balancer (NLB). The company uses Amazon API Gateway to provide external users with access to the application through APIs. The company wants to protect the platform against web exploits like SQL injection and also wants to detect and mitigate large, sophisticated DDoS attacks. Which combination of solutions provides the MOST protection? (Choose two.)',
    answer: 'B. Use AWS Shield Advanced with the NLB.',
    answerVariants: [
      'A. Enable AWS WAF on the API Gateway to inspect requests for SQL injection and cross-site scripting attack patterns.',
      'B. Use AWS Shield Advanced with the NLB.',
      'C. Use Amazon GuardDuty to automatically block traffic identified as part of a large DDoS attack through VPC flow log analysis.',
      'D. Configure AWS Firewall Manager to manage distributed WAF rules and Shield Advanced policies centrally across all accounts.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 181,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has a legacy data processing application that runs on Amazon EC2 instances. Data is processed sequentially, but the order of results does not matter. The application uses a monolithic architecture. The only way that the company can scale the application to meet increased demand is to increase the size of the instances. The company\'s developers have decided to rewrite the application to use a microservices architecture on Amazon Elastic Container Service (Amazon ECS). What should a solutions architect recommend for communication between the microservices?',
    answer: 'A. Create an Amazon Simple Queue Service (Amazon SQS) queue. Add code to the data producers, and send data to the queue. Add code to the data consumers to process data from the queue.',
    answerVariants: [
      'A. Create an Amazon Simple Queue Service (Amazon SQS) queue. Add code to the data producers, and send data to the queue. Add code to the data consumers to process data from the queue.',
      'B. Use Amazon SNS FIFO topics to decouple the microservices. Fan out messages to multiple SQS queues for different processing stages.',
      'C. Use Amazon Kinesis Data Firehose to stream data between microservices. Store processed results in Amazon S3.',
      'D. Configure each ECS task to write intermediate results to shared Amazon EFS storage. Consumer microservices poll EFS for new data.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 182,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to migrate its MySQL database from on premises to AWS. The company recently experienced a database outage that significantly impacted the business. To ensure this does not happen again, the company wants a reliable database solution on AWS that minimizes data loss and stores every transaction on at least two nodes. Which solution meets these requirements?',
    answer: 'B. Create an Amazon RDS MySQL DB instance with Multi-AZ functionality enabled to synchronously replicate the data.',
    answerVariants: [
      'A. Create an Amazon RDS MySQL DB instance in a single AZ with automated backups configured to run every 5 minutes.',
      'B. Create an Amazon RDS MySQL DB instance with Multi-AZ functionality enabled to synchronously replicate the data.',
      'C. Deploy two Amazon RDS MySQL instances in different AWS Regions. Enable cross-Region asynchronous replication between them.',
      'D. Use Amazon Aurora MySQL with a single primary instance and five read replicas across multiple AZs for redundancy.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 183,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is building a new dynamic ordering website. The company wants to minimize server maintenance and patching. The website must be highly available and must scale read and write capacity as quickly as possible to meet changes in user demand. Which solution will meet these requirements?',
    answer: 'A. Host static content in Amazon S3. Host dynamic content by using Amazon API Gateway and AWS Lambda. Use Amazon DynamoDB with on-demand capacity for the database. Configure Amazon CloudFront to deliver the website content.',
    answerVariants: [
      'A. Host static content in Amazon S3. Host dynamic content by using Amazon API Gateway and AWS Lambda. Use Amazon DynamoDB with on-demand capacity for the database. Configure Amazon CloudFront to deliver the website content.',
      'B. Deploy the website on Amazon EC2 behind an ALB. Use Amazon Aurora with Auto Scaling to handle variable read and write demand.',
      'C. Use AWS Elastic Beanstalk to host the ordering application. Use Amazon RDS MySQL Multi-AZ for the database tier.',
      'D. Host the website on Amazon Lightsail with a load balancer. Use DynamoDB with provisioned capacity for steady-state database operations.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 184,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 185,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs an application using Amazon ECS. The application creates resized versions of an original image and then makes Amazon S3 API calls to store the resized images in Amazon S3. How can a solutions architect ensure that the application has permission to access Amazon S3?',
    answer: 'B. Create an IAM role with S3 permissions, and then specify that role as the taskRoleArn in the task definition.',
    answerVariants: [
      'A. Attach an EC2 instance profile with S3 permissions to the EC2 instances that run the ECS tasks.',
      'B. Create an IAM role with S3 permissions, and then specify that role as the taskRoleArn in the task definition.',
      'C. Store AWS access keys as ECS task environment variables. Reference them in the application code to sign S3 API calls.',
      'D. Create an S3 bucket policy that grants access to the ECS container registry service endpoint used by the tasks.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 186,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has a Windows-based application that must be migrated to AWS. The application requires the use of a shared Windows file system attached to multiple Amazon EC2 Windows instances that are deployed across multiple Availability Zone: What should a solutions architect do to meet this requirement?',
    answer: 'B. Configure Amazon FSx for Windows File Server. Mount the Amazon FSx file system to each Windows instance.',
    answerVariants: [
      'A. Create an Amazon EFS file system and mount it to each Windows EC2 instance using the NFS client.',
      'B. Configure Amazon FSx for Windows File Server. Mount the Amazon FSx file system to each Windows instance.',
      'C. Mount Amazon S3 as a file system on each EC2 Windows instance using a third-party FUSE-based driver.',
      'D. Attach the same Amazon EBS volume to all Windows EC2 instances using EBS Multi-Attach across Availability Zones.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 187,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is developing an ecommerce application that will consist of a load-balanced front end, a container-based application, and a relational database. A solutions architect needs to create a highly available solution that operates with as little manual intervention as possible. Which solutions meet these requirements? (Choose two.)',
    answer: 'A. Create an Amazon RDS DB instance in Multi-AZ mode.',
    answerVariants: [
      'A. Create an Amazon RDS DB instance in Multi-AZ mode.',
      'B. Use a single large EC2 instance for the database. Configure automated EBS snapshots for point-in-time recovery.',
      'C. Add Amazon CloudFront in front of the Application Load Balancer to cache dynamic responses and reduce backend load.',
      'D. Deploy the relational database on Amazon EC2 in a single AZ. Schedule nightly database backups to Amazon S3.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 188,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company uses Amazon S3 as its data lake. The company has a new partner that must use SFTP to upload data files. A solutions architect needs to implement a highly available SFTP solution that minimizes operational overhead. Which solution will meet these requirements?',
    answer: 'A. Use AWS Transfer Family to configure an SFTP-enabled server with a publicly accessible endpoint. Choose the S3 data lake as the destination.',
    answerVariants: [
      'A. Use AWS Transfer Family to configure an SFTP-enabled server with a publicly accessible endpoint. Choose the S3 data lake as the destination.',
      'B. Launch an EC2 instance and configure an open-source SFTP server. Mount an EFS file system and sync to S3 using cron jobs.',
      'C. Use Amazon S3 Transfer Acceleration with SFTP protocol support to let the partner upload files directly to S3.',
      'D. Install an AWS DataSync agent at the partner site to push files directly to the S3 data lake via the DataSync API.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 189,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company needs to store contract documents. A contract lasts for 5 years. During the 5-year period, the company must ensure that the documents cannot be overwritten or deleted. The company needs to encrypt the documents at rest and rotate the encryption keys automatically every year. Which combination of steps should a solutions architect take to meet these requirements with the LEAST operational overhead? (Choose two.)',
    answer: 'B. Store the documents in Amazon S3. Use S3 Object Lock in compliance mode.',
    answerVariants: [
      'A. Use AWS Backup to create daily backup plans for the contract documents stored in Amazon S3. Enable KMS encryption.',
      'B. Store the documents in Amazon S3. Use S3 Object Lock in compliance mode.',
      'C. Use server-side encryption with AWS KMS keys (SSE-KMS). Enable automatic key rotation on the KMS customer-managed key.',
      'D. Store documents in Amazon S3 Glacier Vault with vault lock policies. Use SSE-S3 with S3-managed encryption keys.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 190,
    topicSlug: 'exam-preparation',
    question: 'A company has a web application that is based on Java and PHP. The company plans to move the application from on premises to AWS. The company needs the ability to test new site features frequently. The company also needs a highly available and managed solution that requires minimum operational overhead. Which solution will meet these requirements?',
    answer: 'B. Deploy the web application to an AWS Elastic Beanstalk environment. Use URL swapping to switch between multiple Elastic Beanstalk environments for feature testing.',
    answerVariants: [
      'A. Deploy the web application on Amazon EC2 with an ALB. Use separate EC2 fleets per feature branch for blue/green testing.',
      'B. Deploy the web application to an AWS Elastic Beanstalk environment. Use URL swapping to switch between multiple Elastic Beanstalk environments for feature testing.',
      'C. Containerize the application and deploy on Amazon ECS with Fargate. Use CodeDeploy blue/green deployments per feature.',
      'D. Host the web application on Amazon Lightsail with multiple deployment stacks managed by Lightsail distribution endpoints.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 191,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 192,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 193,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 194,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 195,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 196,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 197,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 198,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 199,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 200,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 201,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is developing a marketing communications service that targets mobile app users. The company needs to send its users confirmation messages with Short Message Service (SMS). The users must be able to reply to the SMS messages. The company must store the responses for a year for analysis. What should a solutions architect do to meet these requirements?',
    answer: 'B. Build an Amazon Pinpoint journey. Configure Amazon Pinpoint to send events to an Amazon Kinesis data stream for analysis and archiving.',
    answerVariants: [
      'A. Use Amazon SNS to send one-way SMS messages. Store delivery receipts in Amazon S3 by using CloudWatch Logs export tasks.',
      'B. Build an Amazon Pinpoint journey. Configure Amazon Pinpoint to send events to an Amazon Kinesis data stream for analysis and archiving.',
      'C. Use Amazon Connect SMS messaging with AWS Lambda integrations. Store all replies in Amazon DynamoDB with a 1-year TTL.',
      'D. Use AWS End User Messaging SMS to send messages and Amazon EventBridge to archive responses in Amazon SQS for later analysis.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 202,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is planning to move its data to an Amazon S3 bucket. The data must be encrypted when it is stored in the S3 bucket. Additionally, the encryption key must be automatically rotated every year. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Create an AWS Key Management Service (AWS KMS) customer managed key. Enable automatic key rotation. Set the S3 bucket\'s default encryption behavior to use the customer managed KMS key. Move the data to the S3 bucket.',
    answerVariants: [
      'A. Configure default bucket encryption with SSE-S3. Create a yearly EventBridge schedule to rotate the S3 managed encryption keys.',
      'B. Create an AWS Key Management Service (AWS KMS) customer managed key. Enable automatic key rotation. Set the S3 bucket\'s default encryption behavior to use the customer managed KMS key. Move the data to the S3 bucket.',
      'C. Use client-side encryption before uploading to S3. Store the encryption key in AWS Secrets Manager with automatic rotation enabled.',
      'D. Configure an AWS CloudHSM cluster for the S3 bucket. Use the CloudHSM keys as the bucket default encryption key.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 203,
    topicSlug: 'event-driven-and-messaging',
    question: 'The customers of a finance company request appointments with financial advisors by sending text messages. A web application that runs on Amazon EC2 instances accepts the appointment requests. The text messages are published to an Amazon Simple Queue Service (Amazon SQS) queue through the web application. Another application that runs on EC2 instances then sends meeting invitations and meeting confirmation email messages to the customers. After successful scheduling, this application stores the meeting information in an Amazon DynamoDB database. As the company expands, customers report that their meeting invitations are taking longer to arrive. What should a solutions architect recommend to resolve this issue?',
    answer: 'D. Add an Auto Scaling group for the application that sends meeting invitations. Configure the Auto Scaling group to scale based on the depth of the SQS queue.',
    answerVariants: [
      'A. Increase the size of the EC2 instances that run the web application that receives appointment requests and writes to the SQS queue.',
      'B. Replace Amazon SQS with Amazon Kinesis Data Streams so the invitation service can process records with lower latency.',
      'C. Migrate the invitation processing application to a larger DynamoDB table with on-demand capacity to reduce scheduling delays.',
      'D. Add an Auto Scaling group for the application that sends meeting invitations. Configure the Auto Scaling group to scale based on the depth of the SQS queue.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 204,
    topicSlug: 'database-performance-and-caching',
    question: 'An online retail company has more than 50 million active customers and receives more than 25,000 orders each day. The company collects purchase data for customers and stores this data in Amazon S3. Additional customer data is stored in Amazon RDS. The company wants to make all the data available to various teams so that the teams can perform analytics. The solution must provide the ability to manage fine-grained permissions for the data and must minimize operational overhead. Which solution will meet these requirements?',
    answer: 'C. Create a data lake by using AWS Lake Formation. Create an AWS Glue JDBC connection to Amazon RDS. Register the S3 bucket in Lake Formation. Use Lake Formation access controls to limit access.',
    answerVariants: [
      'A. Load all Amazon S3 and Amazon RDS data into Amazon Redshift. Use Redshift row-level security and schemas to manage access.',
      'B. Create an Amazon EMR cluster to consolidate data from Amazon S3 and Amazon RDS. Use Apache Ranger to provide fine-grained permissions.',
      'C. Create a data lake by using AWS Lake Formation. Create an AWS Glue JDBC connection to Amazon RDS. Register the S3 bucket in Lake Formation. Use Lake Formation access controls to limit access.',
      'D. Use Amazon Athena federated queries for Amazon RDS and S3. Manage access by assigning separate IAM policies to each analytics team.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 205,
    topicSlug: 'edge-and-global-routing',
    question: 'A company hosts a marketing website in an on-premises data center. The website consists of static documents and runs on a single server. An administrator updates the website content infrequently and uses an SFTP client to upload new documents. The company decides to host its website on AWS and to use Amazon CloudFront. The company\'s solutions architect creates a CloudFront distribution. The solutions architect must design the most cost-effective and resilient architecture for website hosting to serve as the CloudFront origin. Which solution will meet these requirements?',
    answer: 'C. Create a private Amazon S3 bucket. Use an S3 bucket policy to allow access from a CloudFront origin access identity (OAI). Upload website content by using the AWS CLI.',
    answerVariants: [
      'A. Run the website on a single Amazon EC2 instance. Put Amazon CloudFront in front of the instance. Upload updates over SFTP to the EC2 host.',
      'B. Create a public S3 bucket configured for static website hosting. Point CloudFront to the website endpoint and upload files through SFTP over AWS Transfer Family.',
      'C. Create a private Amazon S3 bucket. Use an S3 bucket policy to allow access from a CloudFront origin access identity (OAI). Upload website content by using the AWS CLI.',
      'D. Use Amazon EFS as the origin behind a fleet of EC2 instances. Put CloudFront in front and upload content by using an SFTP client to one instance.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 206,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company wants to manage Amazon Machine Images (AMIs). The company currently copies AMIs to the same AWS Region where the AMIs were created. The company needs to design an application that captures AWS API calls and sends alerts whenever the Amazon EC2 CreateImage API operation is called within the company\'s account. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Create an Amazon EventBridge (Amazon CloudWatch Events) rule for the CreateImage API call. Configure the target as an Amazon Simple Notification Service (Amazon SNS) topic to send an alert when a CreateImage API call is detected.',
    answerVariants: [
      'A. Enable AWS Config to record EC2 AMI configuration changes. Configure Config notifications to publish to Amazon SNS whenever an AMI is created.',
      'B. Create an Amazon CloudWatch alarm on the EC2 CreateImage API metric. Configure the alarm to invoke an AWS Lambda function that sends email.',
      'C. Create an Amazon EventBridge (Amazon CloudWatch Events) rule for the CreateImage API call. Configure the target as an Amazon Simple Notification Service (Amazon SNS) topic to send an alert when a CreateImage API call is detected.',
      'D. Use Amazon Inspector to monitor AMI creation activity and publish findings to Amazon SNS when a CreateImage operation occurs.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 207,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 208,
    topicSlug: 'identity-access-and-governance',
    question: 'A company needs to move data from an Amazon EC2 instance to an Amazon S3 bucket. The company must ensure that no API calls and no data are routed through public internet routes. Only the EC2 instance can have access to upload data to the S3 bucket. Which solution will meet these requirements?',
    answer: 'B. Create a gateway VPC endpoint for Amazon S3 in the VPC. Attach a resource policy to the S3 bucket to allow only the EC2 instance\'s IAM role and the VPC endpoint for access.',
    answerVariants: [
      'A. Create an interface VPC endpoint for Amazon S3 in the subnet where the EC2 instance is located. Attach a resource policy to the S3 bucket to only allow the EC2 instance\'s IAM role for access.',
      'B. Create a gateway VPC endpoint for Amazon S3 in the VPC. Attach a resource policy to the S3 bucket to allow only the EC2 instance\'s IAM role and the VPC endpoint for access.',
      'C. Place the EC2 instance in a private subnet behind a NAT gateway. Attach a bucket policy that denies uploads unless the request uses TLS 1.2.',
      'D. Establish an AWS Site-to-Site VPN connection between the VPC and Amazon S3. Restrict uploads with an IAM user access key stored on the EC2 instance.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 209,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A solutions architect is designing the architecture of a new application being deployed to the AWS Cloud. The application will run on Amazon EC2 On-Demand Instances and will automatically scale across multiple Availability Zones. The EC2 instances will scale up and down frequently throughout the day. An Application Load Balancer (ALB) will handle the load distribution. The architecture needs to support distributed session data management. The company is willing to make changes to code if needed. What should the solutions architect do to ensure that the architecture supports distributed session data management?',
    answer: 'A. Use Amazon ElastiCache to manage and store session data.',
    answerVariants: [
      'A. Use Amazon ElastiCache to manage and store session data.',
      'B. Enable sticky sessions on the Application Load Balancer so all requests from a user remain on the same EC2 instance.',
      'C. Store session data in local instance store volumes attached to the EC2 instances so the data remains in memory during processing.',
      'D. Persist session data in Amazon S3 and have each EC2 instance retrieve the user session object on every request.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 210,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 211,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company hosts multiple production applications. One of the applications consists of resources from Amazon EC2, AWS Lambda, Amazon RDS, Amazon Simple Notification Service (Amazon SNS), and Amazon Simple Queue Service (Amazon SQS) across multiple AWS Regions. All company resources are tagged with a tag name of "application" and a value that corresponds to each application. A solutions architect must provide the quickest solution for identifying all of the tagged components. Which solution meets these requirements?',
    answer: 'D. Run a query with the AWS Resource Groups Tag Editor to report on the resources globally with the application tag.',
    answerVariants: [
      'A. Use AWS Config advanced queries in each Region to list tagged resources, then merge the output into a consolidated report.',
      'B. Export the resource inventory from AWS Systems Manager Explorer and filter the export locally for the application tag value.',
      'C. Run the AWS CLI resourcegroupstaggingapi get-resources command separately in each Region and account to build a combined list.',
      'D. Run a query with the AWS Resource Groups Tag Editor to report on the resources globally with the application tag.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 212,
    topicSlug: 'database-performance-and-caching',
    question: 'A company needs to export its database once a day to Amazon S3 for other teams to access. The exported object size varies between 2 GB and 5 GB. The S3 access pattern for the data is variable and changes rapidly. The data must be immediately available and must remain accessible for up to 3 months. The company needs the most cost-effective solution that will not increase retrieval time. Which S3 storage class should the company use to meet these requirements?',
    answer: 'A. S3 Intelligent-Tiering',
    answerVariants: [
      'A. S3 Intelligent-Tiering.',
      'B. S3 Standard-Infrequent Access (S3 Standard-IA).',
      'C. S3 Glacier Instant Retrieval.',
      'D. S3 One Zone-Infrequent Access (S3 One Zone-IA).'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 213,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is developing a new mobile app. The company must implement proper traffic filtering to protect its Application Load Balancer (ALB) against common application-level attacks, such as cross-site scripting or SQL injection. The company has minimal infrastructure and operational staff. The company needs to reduce its share of the responsibility in managing, updating, and securing servers for its AWS environment. What should a solutions architect recommend to meet these requirements?',
    answer: 'A. Configure AWS WAF rules and associate them with the ALB.',
    answerVariants: [
      'A. Configure AWS WAF rules and associate them with the ALB.',
      'B. Deploy AWS Network Firewall appliances in front of the ALB to inspect HTTP payloads for SQL injection and XSS.',
      'C. Move the application to Amazon EC2 instances in private subnets and use security groups to block malicious application-layer traffic.',
      'D. Use AWS Shield Advanced on the ALB to filter cross-site scripting and SQL injection requests before they reach the targets.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 214,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company\'s reporting system delivers hundreds of .csv files to an Amazon S3 bucket each day. The company must convert these files to Apache Parquet format and must store the files in a transformed data bucket. Which solution will meet these requirements with the LEAST development effort?',
    answer: 'B. Create an AWS Glue crawler to discover the data. Create an AWS Glue extract, transform, and load (ETL) job to transform the data. Specify the transformed data bucket in the output step.',
    answerVariants: [
      'A. Configure S3 event notifications to invoke an AWS Lambda function that converts each CSV file to Parquet and writes it to the transformed bucket.',
      'B. Create an AWS Glue crawler to discover the data. Create an AWS Glue extract, transform, and load (ETL) job to transform the data. Specify the transformed data bucket in the output step.',
      'C. Build an Amazon EMR cluster with Apache Spark to poll the S3 bucket for new CSV files and convert them to Parquet on a schedule.',
      'D. Use Amazon Athena CTAS queries to convert each CSV file to Parquet after manually registering the data files in the Glue Data Catalog.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 215,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company experienced a breach that affected several applications in its on-premises data center. The attacker took advantage of vulnerabilities in the custom applications that were running on the servers. The company is now migrating its applications to run on Amazon EC2 instances. The company wants to implement a solution that actively scans for vulnerabilities on the EC2 instances and sends a report that details the findings. Which solution will meet these requirements?',
    answer: 'A. Enable Amazon Inspector for the EC2 instances and review the generated findings report for vulnerabilities.',
    answerVariants: [
      'A. Enable Amazon Inspector for the EC2 instances and review the generated findings report for vulnerabilities.',
      'B. Enable AWS Shield Advanced on the EC2 instances and subscribe to its daily security assessment reports.',
      'C. Install the AWS Systems Manager agent and run Patch Manager reports to detect all application vulnerabilities automatically.',
      'D. Create Amazon GuardDuty malware protection for the EC2 instances and use GuardDuty findings as a vulnerability report.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 216,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a serverless website with millions of objects in an Amazon S3 bucket. The company uses the S3 bucket as the origin for an Amazon CloudFront distribution. The company did not set encryption on the S3 bucket before the objects were loaded. A solutions architect needs to enable encryption for all existing objects and for all objects that are added to the S3 bucket in the future. Which solution will meet these requirements with the LEAST amount of effort?',
    answer: 'B. Turn on the default encryption settings for the S3 bucket. Use the S3 Inventory feature to create a .csv file that lists the unencrypted objects. Run an S3 Batch Operations job that uses the copy command to encrypt those objects.',
    answerVariants: [
      'A. Turn on S3 default encryption. Use S3 Replication to copy all existing objects back into the same bucket so the objects become encrypted.',
      'B. Turn on the default encryption settings for the S3 bucket. Use the S3 Inventory feature to create a .csv file that lists the unencrypted objects. Run an S3 Batch Operations job that uses the copy command to encrypt those objects.',
      'C. Download all unencrypted objects from the S3 bucket, encrypt them locally, and upload them back to the bucket using multipart upload.',
      'D. Configure an AWS Lambda function to re-encrypt every object in the bucket when the function receives a daily EventBridge schedule.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 217,
    topicSlug: 'edge-and-global-routing',
    question: 'A company runs a global web application on Amazon EC2 instances behind an Application Load Balancer. The application stores data in Amazon Aurora. The company needs to create a disaster recovery solution and can tolerate up to 30 minutes of downtime and potential data loss. The solution does not need to handle the load when the primary infrastructure is healthy. What should a solutions architect do to meet these requirements?',
    answer: 'A. Deploy the application with the required infrastructure elements in place. Use Amazon Route 53 to configure active-passive failover. Create an Aurora Replica in a second AWS Region.',
    answerVariants: [
      'A. Deploy the application with the required infrastructure elements in place. Use Amazon Route 53 to configure active-passive failover. Create an Aurora Replica in a second AWS Region.',
      'B. Deploy a second active stack in another Region behind Route 53 latency routing. Use Aurora Global Database to serve production traffic from both Regions.',
      'C. Back up the application AMIs and Aurora snapshots daily to a second Region. Restore the backups manually if the primary Region fails.',
      'D. Use AWS Global Accelerator to distribute traffic across Regions and place an Aurora read replica in the second Availability Zone of the same Region.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 218,
    topicSlug: 'network-security-controls',
    question: 'A company has a web server running on an Amazon EC2 instance in a public subnet with an Elastic IP address. The default security group is assigned to the EC2 instance. The default network ACL has been modified to block all traffic. A solutions architect needs to make the web server accessible from everywhere on port 443. Which combination of steps will accomplish this task? (Choose two.)',
    answer: 'A. Create a security group with a rule to allow TCP port 443 from source 0.0.0.0/0.',
    answerVariants: [
      'A. Create a security group with a rule to allow TCP port 443 from source 0.0.0.0/0.',
      'B. Create a security group with a rule to allow all traffic from the default security group in the VPC.',
      'C. Modify the network ACL to allow outbound TCP port 443 to destination 0.0.0.0/0 and deny all ephemeral response traffic.',
      'D. Modify the network ACL to allow inbound TCP port 443 from 0.0.0.0/0 and outbound ephemeral ports to 0.0.0.0/0.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 219,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company\'s application is having performance issues. The application is stateful and needs to complete in-memory tasks on Amazon EC2 instances. The company used AWS CloudFormation to deploy infrastructure and used the M5 EC2 instance family. As traffic increased, the application performance degraded. Users are reporting delays when the users attempt to access the application. Which solution will resolve these issues in the MOST operationally efficient way?',
    answer: 'B. Update the AWS CloudFormation template to use a memory-optimized R5 instance family and redeploy the stack.',
    answerVariants: [
      'A. Increase the desired capacity of the existing Auto Scaling group of M5 instances and distribute the stateful workload across more nodes.',
      'B. Update the AWS CloudFormation template to use a memory-optimized R5 instance family and redeploy the stack.',
      'C. Replace the M5 instances with C5 compute-optimized instances by editing the CloudFormation stack in place.',
      'D. Migrate the stateful application to AWS Lambda functions backed by Amazon ElastiCache to complete its in-memory tasks.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 220,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A solutions architect is designing a new API using Amazon API Gateway that will receive requests from users. The volume of requests is highly variable; several hours can pass without receiving a single request. The data processing will take place asynchronously, but should be completed within a few seconds after a request is made. Which compute service should the solutions architect have the API invoke to deliver the requirements at the lowest cost?',
    answer: 'B. An AWS Lambda function',
    answerVariants: [
      'A. An Amazon EC2 Auto Scaling group with a minimum size of one instance.',
      'B. An AWS Lambda function.',
      'C. An Amazon EMR cluster with an automatic scaling policy.',
      'D. An AWS Fargate service running continuously behind an internal load balancer.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 221,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company runs an application on a group of Amazon Linux EC2 instances. For compliance reasons, the company must retain all application log files for 7 years. The log files will be analyzed by a reporting tool that must be able to access all the files concurrently. Which storage solution meets these requirements MOST cost-effectively?',
    answer: 'D. Amazon S3',
    answerVariants: [
      'A. Amazon Elastic Block Store (Amazon EBS) volumes attached to a reporting EC2 instance.',
      'B. Amazon Elastic File System (Amazon EFS) in Standard storage class.',
      'C. Amazon FSx for Lustre integrated with the reporting tool over NFS.',
      'D. Amazon S3.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 222,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has hired an external vendor to perform work in the company\'s AWS account. The vendor uses an automated tool that is hosted in an AWS account that the vendor owns. The vendor does not have IAM access to the company\'s AWS account. How should a solutions architect grant this access to the vendor?',
    answer: 'A. Create an IAM role in the company\'s account to delegate access to the vendor\'s IAM role. Attach the appropriate IAM policies to the role for the permissions that the vendor requires.',
    answerVariants: [
      'A. Create an IAM role in the company\'s account to delegate access to the vendor\'s IAM role. Attach the appropriate IAM policies to the role for the permissions that the vendor requires.',
      'B. Create IAM users in the company account for the vendor. Share the access keys with the vendor so the vendor\'s tool can authenticate.',
      'C. Create a resource-based policy on every AWS service the vendor will access. Allow the vendor\'s account root principal to call the services directly.',
      'D. Create an SCP in AWS Organizations that grants the vendor account temporary access to the company account resources.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 223,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has deployed a Java Spring Boot application as a pod that runs on Amazon Elastic Kubernetes Service (Amazon EKS) in private subnets. The application needs to write data to an Amazon DynamoDB table. A solutions architect must ensure that the application can interact with the DynamoDB table without exposing traffic to the internet. Which combination of steps should the solutions architect take to accomplish this goal? (Choose two.)',
    answer: 'A. Attach an IAM role that has sufficient privileges to the EKS pod.',
    answerVariants: [
      'A. Attach an IAM role that has sufficient privileges to the EKS pod.',
      'B. Store AWS access keys in a Kubernetes secret and mount the keys into the pod so the application can call DynamoDB.',
      'C. Attach an IAM role with DynamoDB permissions to the worker node instance profile and let every pod on the node share that access.',
      'D. Create a NAT gateway in a public subnet so the EKS pod can reach the public DynamoDB endpoint securely.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 224,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 225,
    topicSlug: 'event-driven-and-messaging',
    question: 'A media company collects and analyzes user activity data on premises. The company wants to migrate this capability to AWS. The user activity data store will continue to grow and will be petabytes in size. The company needs to build a highly available data ingestion solution that facilitates on-demand analytics of existing data and new data with SQL. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Send activity data to an Amazon Kinesis Data Firehose delivery stream. Configure the stream to deliver the data to Amazon S3. Use Amazon Athena for SQL analytics.',
    answerVariants: [
      'A. Send activity data to an Amazon Kinesis Data Firehose delivery stream. Configure the stream to deliver the data to Amazon S3. Use Amazon Athena for SQL analytics.',
      'B. Send activity data to an Amazon Kinesis Data Firehose delivery stream. Configure the stream to deliver the data to an Amazon Redshift cluster.',
      'C. Stream all activity data into Amazon RDS for PostgreSQL. Use read replicas so analysts can run ad hoc SQL queries.',
      'D. Use Amazon MSK to ingest the activity data. Store the data on Amazon EBS volumes attached to Kafka brokers for on-demand analytics.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 226,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company collects data from thousands of remote devices by using a RESTful web services application that runs on an Amazon EC2 instance. The EC2 instance receives the raw data, transforms the raw data, and stores all the data in an Amazon S3 bucket. The number of remote devices will increase into the millions soon. The company needs a highly scalable solution that minimizes operational overhead. Which combination of steps should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'A. Use AWS Glue to process the raw data in Amazon S3.',
    answerVariants: [
      'A. Use AWS Glue to process the raw data in Amazon S3.',
      'B. Continue to run the ingestion and transformation logic on a single larger EC2 instance and store the transformed data in Amazon S3.',
      'C. Use Amazon EMR as a long-running cluster to ingest the device traffic directly and write transformed data to local HDFS.',
      'D. Use Amazon RDS to store the raw device data first, then export transformed data to Amazon S3 every hour.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 227,
    topicSlug: 'identity-access-and-governance',
    question: 'A company needs to retain its AWS CloudTrail logs for 3 years. The company is enforcing CloudTrail across a set of AWS accounts by using AWS Organizations from the parent account. The CloudTrail target S3 bucket is configured with S3 Versioning enabled. An S3 Lifecycle policy is in place to delete current objects after 3 years. After the fourth year of use of the S3 bucket, the S3 bucket metrics show that the number of objects has continued to rise. However, the number of new CloudTrail logs that are delivered to the S3 bucket has remained consistent. Which solution will delete objects that are older than 3 years in the MOST cost-effective manner?',
    answer: 'B. Configure the S3 Lifecycle policy to delete previous versions as well as current versions.',
    answerVariants: [
      'A. Suspend versioning on the S3 bucket so S3 stops creating additional object versions for new CloudTrail log files.',
      'B. Configure the S3 Lifecycle policy to delete previous versions as well as current versions.',
      'C. Configure CloudTrail to deliver logs to a new S3 bucket every year so each bucket can be deleted after 3 years.',
      'D. Enable S3 Intelligent-Tiering on the bucket so older object versions transition automatically and reduce the total object count.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 228,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an API that receives real-time data from a fleet of monitoring devices. The API stores this data in an Amazon RDS DB instance for later analysis. The amount of data that the monitoring devices send to the API fluctuates. During periods of heavy traffic, the API often returns timeout errors. After an inspection of the logs, the company determines that the database is not capable of processing the volume of write traffic that comes from the API. A solutions architect must minimize the number of connections to the database and must ensure that data is not lost during periods of heavy traffic. Which solution will meet these requirements?',
    answer: 'C. Modify the API to write incoming data to an Amazon Simple Queue Service (Amazon SQS) queue. Use an AWS Lambda function that Amazon SQS invokes to write data from the queue to the database.',
    answerVariants: [
      'A. Increase the size of the Amazon RDS DB instance and connect the API to the larger instance by using a new database endpoint.',
      'B. Use Amazon API Gateway caching to reduce the number of requests that reach the API during periods of heavy monitoring traffic.',
      'C. Modify the API to write incoming data to an Amazon Simple Queue Service (Amazon SQS) queue. Use an AWS Lambda function that Amazon SQS invokes to write data from the queue to the database.',
      'D. Configure Amazon ElastiCache between the API and the database so the API can cache write requests until the database catches up.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 229,
    topicSlug: 'database-performance-and-caching',
    question: 'A company manages its own Amazon EC2 instances that run MySQL databases. The company is manually managing replication and scaling as demand increases or decreases. The company needs a new solution that simplifies the process of adding or removing compute capacity to or from its database tier as needed. The solution also must offer improved performance, scaling, and durability with minimal effort from operations. Which solution meets these requirements?',
    answer: 'A. Migrate the databases to Amazon Aurora Serverless for Aurora MySQL.',
    answerVariants: [
      'A. Migrate the databases to Amazon Aurora Serverless for Aurora MySQL.',
      'B. Move the databases to self-managed MySQL on larger EC2 instances and automate replication with custom Lambda functions.',
      'C. Continue to run MySQL on EC2 instances and use Auto Scaling to add and remove database servers based on CPU utilization.',
      'D. Migrate to Amazon DynamoDB on-demand tables and rewrite the application to remove all relational queries.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 230,
    topicSlug: 'network-performance-and-hybrid',
    question: 'A company is concerned that two NAT instances in use will no longer be able to support the traffic needed for the company\'s application. A solutions architect wants to implement a solution that is highly available, fault tolerant, and automatically scalable. What should the solutions architect recommend?',
    answer: 'C. Remove the two NAT instances and replace them with two NAT gateways in different Availability Zones.',
    answerVariants: [
      'A. Add additional Elastic IP addresses to the existing NAT instances to increase the available throughput for outbound traffic.',
      'B. Replace the NAT instances with one larger NAT instance in a dedicated public subnet and enable source/destination check.',
      'C. Remove the two NAT instances and replace them with two NAT gateways in different Availability Zones.',
      'D. Place the application instances in public subnets so they can access the internet directly without using NAT.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 231,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An application runs on an Amazon EC2 instance that has an Elastic IP address in VPC A. The application requires access to a database in VPC B. Both VPCs are in the same AWS account. Which solution will provide the required access MOST securely?',
    answer: 'B. Configure a VPC peering connection between VPC A and VPC B.',
    answerVariants: [
      'A. Configure an internet gateway in each VPC and allow the application instance to reach the database over its public endpoint.',
      'B. Configure a VPC peering connection between VPC A and VPC B.',
      'C. Create a Transit Gateway and attach both VPCs to the Transit Gateway so the application can reach the database.',
      'D. Create a Site-to-Site VPN connection between VPC A and VPC B over the internet to encrypt the database traffic.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 232,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs demonstration environments for its customers on Amazon EC2 instances. Each environment is isolated in its own VPC. The company\'s operations team needs to be notified when RDP or SSH access to an environment has been established.',
    answer: 'A. Use AWS Systems Manager Session Manager for administrative access. Create an EventBridge rule for session start events and notify the operations team.',
    answerVariants: [
      'A. Use AWS Systems Manager Session Manager for administrative access. Create an EventBridge rule for session start events and notify the operations team.',
      'B. Configure the EC2 instances with an IAM instance profile that has an IAM role with the AmazonSSMManagedInstanceCore policy attached.',
      'C. Enable VPC Flow Logs for each environment and have the operations team inspect the flow logs manually for new RDP and SSH sessions.',
      'D. Enable AWS CloudTrail data events for the EC2 instances and filter the logs for inbound TCP port 22 and 3389 connections.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 233,
    topicSlug: 'exam-preparation',
    question: 'A solutions architect has created a new AWS account and must secure AWS account root user access. Which combination of actions will accomplish this? (Choose two.)',
    answer: 'A. Ensure the root user uses a strong password.',
    answerVariants: [
      'A. Ensure the root user uses a strong password.',
      'B. Create access keys for the root user and store the keys in AWS Secrets Manager for emergency use only.',
      'C. Attach the AdministratorAccess IAM policy to the root user so root sign-in events can be monitored centrally.',
      'D. Configure an IAM user with the same email address as the root user so console access can be delegated safely.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 234,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is building a new web-based customer relationship management application. The application will use several Amazon EC2 instances that are backed by Amazon Elastic Block Store (Amazon EBS) volumes behind an Application Load Balancer (ALB). The application will also use an Amazon Aurora database. All data for the application must be encrypted at rest and in transit. Which solution will meet these requirements?',
    answer: 'C. Use AWS Key Management Service (AWS KMS) to encrypt the EBS volumes and Aurora database storage at rest. Attach an AWS Certificate Manager (ACM) certificate to the ALB to encrypt data in transit.',
    answerVariants: [
      'A. Use server-side encryption with Amazon S3-managed keys for the EBS volumes and Aurora. Attach a self-signed certificate to each EC2 instance for HTTPS.',
      'B. Use AWS Secrets Manager to encrypt the EBS volumes and Aurora database storage. Configure TLS only between the ALB and the target instances.',
      'C. Use AWS Key Management Service (AWS KMS) to encrypt the EBS volumes and Aurora database storage at rest. Attach an AWS Certificate Manager (ACM) certificate to the ALB to encrypt data in transit.',
      'D. Use Amazon Macie to encrypt all application data at rest. Configure Amazon CloudFront in front of the ALB to provide in-transit encryption.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 235,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 236,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has a three-tier application for image sharing. The application uses an Amazon EC2 instance for the front-end layer, another EC2 instance for the application layer, and a third EC2 instance for a MySQL database. A solutions architect must design a scalable and highly available solution that requires the least amount of change to the application. Which solution meets these requirements?',
    answer: 'D. Use load-balanced Multi-AZ AWS Elastic Beanstalk environments for the front-end layer and the application layer. Move the database to an Amazon RDS Multi-AZ DB instance. Use Amazon S3 to store and serve users\' images.',
    answerVariants: [
      'A. Keep the three-tier design on EC2. Place all three instances in an Auto Scaling group across multiple Availability Zones and store images on the local file systems.',
      'B. Containerize the front-end and application tiers on Amazon ECS. Keep the MySQL database on a single large EC2 instance and store images on Amazon EFS.',
      'C. Move the front-end and application tiers to AWS Lambda. Keep the database on EC2 and copy images into Amazon RDS BLOB columns.',
      'D. Use load-balanced Multi-AZ AWS Elastic Beanstalk environments for the front-end layer and the application layer. Move the database to an Amazon RDS Multi-AZ DB instance. Use Amazon S3 to store and serve users\' images.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 237,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An application running on an Amazon EC2 instance in VPC-A needs to access files in another EC2 instance in VPC-B. Both VPCs are in separate AWS accounts. The network administrator needs to design a solution to configure secure access to EC2 instance in VPC-B from VPC-A. The connectivity should not have a single point of failure or bandwidth concerns. Which solution will meet these requirements?',
    answer: 'A. Set up a VPC peering connection between VPC-A and VPC-B.',
    answerVariants: [
      'A. Set up a VPC peering connection between VPC-A and VPC-B.',
      'B. Set up an AWS Site-to-Site VPN connection between the two VPCs over the public internet.',
      'C. Use an internet gateway and public IP addresses on both EC2 instances. Restrict access with security groups only.',
      'D. Create a NAT gateway in each account and route file transfer traffic through the NAT gateways.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 238,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company wants to experiment with individual AWS accounts for its engineer team. The company wants to be notified as soon as the Amazon EC2 instance usage for a given month exceeds a specific threshold for each account. What should a solutions architect do to meet this requirement MOST cost-effectively?',
    answer: 'C. Use AWS Budgets to create a cost budget for each account. Set the period to monthly. Set the scope to EC2 instances. Set an alert threshold for the budget. Configure an Amazon Simple Notification Service (Amazon SNS) topic to receive a notification when a threshold is exceeded.',
    answerVariants: [
      'A. Use AWS Cost and Usage Reports for each account. Query the reports once a month with Athena and send an email if EC2 charges exceed the threshold.',
      'B. Create a CloudWatch billing alarm in the management account. Filter the alarm by service name and send notifications for all linked accounts together.',
      'C. Use AWS Budgets to create a cost budget for each account. Set the period to monthly. Set the scope to EC2 instances. Set an alert threshold for the budget. Configure an Amazon Simple Notification Service (Amazon SNS) topic to receive a notification when a threshold is exceeded.',
      'D. Use AWS Trusted Advisor cost optimization checks in every account and send an SNS notification whenever the checks detect increased EC2 usage.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 239,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect needs to design a new microservice for a company\'s application. Clients must be able to call an HTTPS endpoint to reach the microservice. The microservice also must use AWS Identity and Access Management (IAM) to authenticate calls. The solutions architect will write the logic for this microservice by using a single AWS Lambda function that is written in Go 1.x. Which solution will deploy the function in the MOST operationally efficient way?',
    answer: 'A. Create an Amazon API Gateway REST API. Configure the method to use the Lambda function. Enable IAM authentication on the API.',
    answerVariants: [
      'A. Create an Amazon API Gateway REST API. Configure the method to use the Lambda function. Enable IAM authentication on the API.',
      'B. Create an Application Load Balancer with an HTTPS listener. Register the Lambda function as the target. Use mutual TLS certificates for authentication.',
      'C. Deploy the Lambda function behind a Network Load Balancer. Use signed cookies from Amazon CloudFront to authenticate callers.',
      'D. Deploy the Go microservice to AWS App Runner with a custom domain name and attach an IAM instance profile to the service.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 240,
    topicSlug: 'network-performance-and-hybrid',
    question: 'A company previously migrated its data warehouse solution to AWS. The company also has an AWS Direct Connect connection. Corporate office users query the data warehouse using a visualization tool. The average size of a query returned by the data warehouse is 50 MB and each webpage sent by the visualization tool is approximately 500 KB. Result sets returned by the data warehouse are not cached. Which solution provides the LOWEST data transfer egress cost for the company?',
    answer: 'D. Host the visualization tool in the same AWS Region as the data warehouse and access it over a Direct Connect connection at a location in the same Region.',
    answerVariants: [
      'A. Host the visualization tool on premises and query the data warehouse over the public internet so all result sets are returned directly to the office.',
      'B. Host the visualization tool in a different AWS Region and access both the visualization pages and query results through the company\'s existing Direct Connect connection.',
      'C. Cache query result sets in Amazon CloudFront so office users receive the 50 MB query results from the nearest edge location.',
      'D. Host the visualization tool in the same AWS Region as the data warehouse and access it over a Direct Connect connection at a location in the same Region.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 241,
    topicSlug: 'database-performance-and-caching',
    question: 'n online learning company is migrating to the AWS Cloud. The company maintains its student records in a PostgreSQL database. The company needs a solution in which its data is available and online across multiple AWS Regions at all times. Which solution will meet these requirements with the LEAST amount of operational overhead?',
    answer: 'A. Migrate the PostgreSQL database to an Amazon Aurora PostgreSQL global database.',
    answerVariants: [
      'A. Migrate the PostgreSQL database to an Amazon Aurora PostgreSQL global database.',
      'B. Migrate the PostgreSQL database to an Amazon RDS for PostgreSQL DB instance. Create a read replica in another Region.',
      'C. Deploy PostgreSQL on Amazon EC2 instances in multiple Regions and synchronize them by using AWS DataSync.',
      'D. Migrate the PostgreSQL database to Amazon DynamoDB global tables to replicate the relational data across Regions.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 242,
    topicSlug: 'identity-access-and-governance',
    question: 'A company hosts its web application on AWS using seven Amazon EC2 instances. The company requires that the IP addresses of all healthy EC2 instances be returned in response to DNS queries. Which policy should be used to meet this requirement?',
    answer: 'C. Multivalue routing policy',
    answerVariants: [
      'A. Weighted routing policy.',
      'B. Failover routing policy.',
      'C. Multivalue routing policy.',
      'D. Latency routing policy.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 243,
    topicSlug: 'edge-and-global-routing',
    question: 'A medical research lab produces data that is related to a new study. The lab wants to make the data available with minimum latency to clinics across the country for their on-premises, file-based applications. The data files are stored in an Amazon S3 bucket that has read-only permissions for each clinic. What should a solutions architect recommend to meet these requirements?',
    answer: 'A. Deploy an AWS Storage Gateway file gateway as a virtual machine (VM) on premises at each clinic.',
    answerVariants: [
      'A. Deploy an AWS Storage Gateway file gateway as a virtual machine (VM) on premises at each clinic.',
      'B. Replicate the S3 bucket into a new S3 bucket in every AWS Region closest to each clinic and give each clinic read-only access to its bucket.',
      'C. Deploy Amazon CloudFront in front of the S3 bucket and mount the CloudFront distribution as a file share in each clinic.',
      'D. Use AWS Transfer Family SFTP servers at each clinic so the file-based applications can download study data from Amazon S3.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 244,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is using a content management system that runs on a single Amazon EC2 instance. The EC2 instance contains both the web server and the database software. The company must make its website platform highly available and must enable the website to scale to meet user demand. What should a solutions architect recommend to meet these requirements?',
    answer: 'C. Move the database to Amazon Aurora with a read replica in another Availability Zone. Create an Amazon Machine Image (AMI) from the EC2 instance. Configure an Application Load Balancer in two Availability Zones. Attach an Auto Scaling group that uses the AMI across two Availability Zones.',
    answerVariants: [
      'A. Keep the existing EC2 instance and database together. Create an AMI and launch a standby EC2 instance in a second Availability Zone for manual failover.',
      'B. Move the website to Amazon S3 static hosting. Keep the database on the same EC2 instance and scale reads by using EBS snapshots.',
      'C. Move the database to Amazon Aurora with a read replica in another Availability Zone. Create an Amazon Machine Image (AMI) from the EC2 instance. Configure an Application Load Balancer in two Availability Zones. Attach an Auto Scaling group that uses the AMI across two Availability Zones.',
      'D. Replace the architecture with a single larger EC2 instance and use Amazon CloudFront in front of the site to reduce origin traffic.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 245,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is launching an application on AWS. The application uses an Application Load Balancer (ALB) to direct traffic to at least two Amazon EC2 instances in a single target group. The instances are in an Auto Scaling group for each environment. The company requires a development environment and a production environment. The production environment will have periods of high traffic. Which solution will configure the development environment MOST cost-effectively?',
    answer: 'A. Reconfigure the target group in the development environment to have only one EC2 instance as a target.',
    answerVariants: [
      'A. Reconfigure the target group in the development environment to have only one EC2 instance as a target.',
      'B. Reconfigure the Auto Scaling group in the development environment to run in one Availability Zone only and remove the ALB.',
      'C. Replace the ALB in the development environment with a Network Load Balancer to reduce hourly load balancer charges.',
      'D. Keep two EC2 instances in the development environment and purchase Reserved Instances for the development capacity.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 246,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs a web application on Amazon EC2 instances in multiple Availability Zones. The EC2 instances are in private subnets. A solutions architect implements an internet-facing Application Load Balancer (ALB) and specifies the EC2 instances as the target group. However, the internet traffic is not reaching the EC2 instances. How should the solutions architect reconfigure the architecture to resolve this issue?',
    answer: 'A. Create public subnets in each Availability Zone. Associate the public subnets with the ALB. Update the route tables for the public subnets with a route to the internet gateway.',
    answerVariants: [
      'A. Create public subnets in each Availability Zone. Associate the public subnets with the ALB. Update the route tables for the public subnets with a route to the internet gateway.',
      'B. Move the EC2 instances into the public subnets so the internet-facing ALB can connect to them directly on their public IP addresses.',
      'C. Replace the internet-facing ALB with a Network Load Balancer in the private subnets so the load balancer can communicate with the targets internally.',
      'D. Add a NAT gateway to each private subnet and route inbound traffic from the ALB through the NAT gateways to the EC2 instances.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 247,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has deployed a database in Amazon RDS for MySQL. Due to increased transactions, the database support team is reporting slow reads against the DB instance and recommends adding a read replica. Which combination of actions should a solutions architect take before implementing this change? (Choose two.)',
    answer: 'A. Enable automated backups on the source RDS for MySQL DB instance before creating the read replica.',
    answerVariants: [
      'A. Enable automated backups on the source RDS for MySQL DB instance before creating the read replica.',
      'B. Convert the database tables to a replication-supported engine such as InnoDB before creating the read replica.',
      'C. Enable Multi-AZ on the source DB instance so the read replica can be created from the standby instance.',
      'D. Increase the allocated storage on the source DB instance so the read replica can copy the full dataset faster.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 248,
    topicSlug: 'event-driven-and-messaging',
    question: 'Users report that some submitted data is not being processed Amazon CloudWatch reveals that the EC2 instances have a consistent CPU utilization at or near 100%. The company wants to improve system performance and scale the system based on user load. What should a solutions architect do to meet these requirements?',
    answer: 'D. Route incoming requests to Amazon Simple Queue Service (Amazon SQS). Configure an EC2 Auto Scaling group based on queue size. Update the software to read from the queue.',
    answerVariants: [
      'A. Increase the size of the current EC2 instances and continue processing submitted data synchronously in the web tier.',
      'B. Place an Application Load Balancer in front of the existing EC2 instances and scale the EC2 fleet on CPU utilization only.',
      'C. Migrate the submitted data processing to Amazon RDS so the database can scale to match user request volume.',
      'D. Route incoming requests to Amazon Simple Queue Service (Amazon SQS). Configure an EC2 Auto Scaling group based on queue size. Update the software to read from the queue.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 249,
    topicSlug: 'storage-performance-patterns',
    question: '249Topic 1',
    answer: 'B. Use Amazon FSx for Windows File Server to provide a fully managed SMB file share for the media application.',
    answerVariants: [
      'A. Use Amazon EFS to provide a fully managed NFS file system that SMB clients can mount without modification.',
      'B. Use Amazon FSx for Windows File Server to provide a fully managed SMB file share for the media application.',
      'C. Use Amazon S3 File Gateway to expose the media data over SMB directly from an S3 bucket in all Availability Zones.',
      'D. Use Amazon EC2 Windows instances with attached EBS volumes and configure your own SMB cluster for the shared data.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 250,
    topicSlug: 'identity-access-and-governance',
    question: 'A company\'s security team requests that network traffic be captured in VPC Flow Logs. The logs will be frequently accessed for 90 days and then accessed intermittently. What should a solutions architect do to meet these requirements when configuring the logs?',
    answer: 'D. Use Amazon S3 as the target. Enable an S3 Lifecycle policy to transition the logs to S3 Standard-Infrequent Access (S3 Standard-IA) after 90 days.',
    answerVariants: [
      'A. Use Amazon CloudWatch Logs as the target. Export the logs to Amazon S3 Glacier Flexible Retrieval after 90 days.',
      'B. Use Amazon Kinesis Data Firehose as the target. Configure Firehose to buffer logs in Amazon Redshift for 90 days before archival.',
      'C. Use Amazon EFS as the target so the security team can access the VPC Flow Logs as files for the first 90 days.',
      'D. Use Amazon S3 as the target. Enable an S3 Lifecycle policy to transition the logs to S3 Standard-Infrequent Access (S3 Standard-IA) after 90 days.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 251,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An Amazon EC2 instance is located in a private subnet in a new VPC. This subnet does not have outbound internet access, but the EC2 instance needs the ability to download monthly security updates from an outside vendor. What should a solutions architect do to meet these requirements?',
    answer: 'B. Create a NAT gateway, and place it in a public subnet. Configure the private subnet route table to use the NAT gateway as the default route.',
    answerVariants: [
      'A. Attach an internet gateway directly to the private subnet and add a route to the internet gateway from the subnet route table.',
      'B. Create a NAT gateway, and place it in a public subnet. Configure the private subnet route table to use the NAT gateway as the default route.',
      'C. Create a VPC endpoint for the outside vendor and route the monthly security update traffic through the endpoint.',
      'D. Launch a bastion host in a public subnet and configure the EC2 instance to proxy its update traffic through the bastion host.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 252,
    topicSlug: 'storage-performance-patterns',
    question: 'A solutions architect needs to design a system to store client case files. The files are core company assets and are important. The number of files will grow over time. The files must be simultaneously accessible from multiple application servers that run on Amazon EC2 instances. The solution must have built-in redundancy. Which solution meets these requirements?',
    answer: 'A. Amazon Elastic File System (Amazon EFS)',
    answerVariants: [
      'A. Amazon Elastic File System (Amazon EFS).',
      'B. Amazon Elastic Block Store (Amazon EBS) Multi-Attach volumes.',
      'C. Amazon S3 Standard with multipart upload enabled.',
      'D. Amazon FSx for Windows File Server.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 253,
    topicSlug: 'identity-access-and-governance',
    question: 'policy que.',
    answer: 'C. Deleting Amazon EC2 instances.',
  },
  {
    questionNumber: 254,
    topicSlug: 'network-security-controls',
    question: 'A company is reviewing a recent migration of a three-tier application to a VPC. The security team discovers that the principle of least privilege is not being applied to Amazon EC2 security group ingress and egress rules between the application tiers. What should a solutions architect do to correct this issue?',
    answer: 'B. Create security group rules using the security group ID as the source or destination.',
    answerVariants: [
      'A. Replace all security groups with network ACLs so each subnet enforces least-privilege filtering between tiers.',
      'B. Create security group rules using the security group ID as the source or destination.',
      'C. Assign a unique public IP address to each instance so the security team can create more granular CIDR-based rules.',
      'D. Consolidate all application tiers into a single security group to simplify ingress and egress management.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 255,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an ecommerce checkout workflow that writes an order to a database and calls a service to process the payment. Users are experiencing timeouts during the checkout process. When users resubmit the checkout form, multiple unique orders are created for the same desired transaction. How should a solutions architect refactor this workflow to prevent the creation of multiple orders?',
    answer: 'D. Store the order in the database. Send a message that includes the order number to an Amazon Simple Queue Service (Amazon SQS) FIFO queue. Set the payment service to retrieve the message and process the order. Delete the message from the queue.',
    answerVariants: [
      'A. Process the payment first. If the payment succeeds, write the order to the database. If the order write fails, refund the payment asynchronously.',
      'B. Store the order in the database and invoke the payment service synchronously again if the user resubmits the checkout form.',
      'C. Send every checkout request to an Amazon SQS standard queue. Have multiple payment workers process the queue in parallel and retry failures automatically.',
      'D. Store the order in the database. Send a message that includes the order number to an Amazon Simple Queue Service (Amazon SQS) FIFO queue. Set the payment service to retrieve the message and process the order. Delete the message from the queue.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 256,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A solutions architect is implementing a document review application using an Amazon S3 bucket for storage. The solution must prevent accidental deletion of the documents and ensure that all versions of the documents are available. Users must be able to download, modify, and upload documents. Which combination of actions should be taken to meet these requirements? (Choose two.)',
    answer: 'B. Enable versioning on the bucket.',
    answerVariants: [
      'A. Configure S3 Object Lock in compliance mode so users cannot replace existing document versions after edits.',
      'B. Enable versioning on the bucket.',
      'C. Configure S3 Standard-Infrequent Access as the default storage class so previous versions stay protected from deletion.',
      'D. Restrict all users to read-only access and create a separate upload bucket for modified versions of the documents.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 257,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 258,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company has an application that places hundreds of .csv files into an Amazon S3 bucket every hour. The files are 1 GB in size. Each time a file is uploaded, the company needs to convert the file to Apache Parquet format and place the output file into an S3 bucket. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'D. Create an AWS Glue extract, transform, and load (ETL) job to convert the .csv files to Parquet format and place the output files into an S3 bucket. Create an AWS Lambda function for each S3 PUT event to invoke the ETL job.',
    answerVariants: [
      'A. Configure Amazon Athena to query each CSV file directly from S3 and save the query results back to S3 in Parquet format.',
      'B. Create an Amazon EMR cluster that runs continuously and polls the bucket every hour for new CSV files to convert to Parquet.',
      'C. Create a Lambda function that downloads each 1 GB CSV file, converts the file to Parquet in memory, and uploads the result to S3.',
      'D. Create an AWS Glue extract, transform, and load (ETL) job to convert the .csv files to Parquet format and place the output files into an S3 bucket. Create an AWS Lambda function for each S3 PUT event to invoke the ETL job.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 259,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is implementing new data retention policies for all databases that run on Amazon RDS DB instances. The company must retain daily backups for a minimum period of 2 years. The backups must be consistent and restorable. Which solution should a solutions architect recommend to meet these requirements?',
    answer: 'A. Create a backup vault in AWS Backup to retain RDS backups. Create a new backup plan with a daily schedule and an expiration period of 2 years after creation. Assign the RDS DB instances to the backup plan.',
    answerVariants: [
      'A. Create a backup vault in AWS Backup to retain RDS backups. Create a new backup plan with a daily schedule and an expiration period of 2 years after creation. Assign the RDS DB instances to the backup plan.',
      'B. Increase the automated backup retention setting on each RDS DB instance to 730 days and rely on native RDS backups only.',
      'C. Export an RDS snapshot to Amazon S3 every day and configure an S3 Lifecycle policy to delete the exported objects after 2 years.',
      'D. Use Amazon Data Lifecycle Manager to create daily EBS-style snapshots for the RDS DB instances and expire the snapshots after 2 years.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 260,
    topicSlug: 'storage-performance-patterns',
    question: 'A company\'s compliance team needs to move its file shares to AWS. The shares run on a Windows Server SMB file share. A self-managed on-premises Active Directory controls access to the files and folders. The company wants to use Amazon FSx for Windows File Server as part of the solution. The company must ensure that the on-premises Active Directory groups restrict access to the FSx for Windows File Server SMB compliance shares, folders, and files after the move to AWS. The company has created an FSx for Windows File Server file system. Which solution will meet these requirements?',
    answer: 'D. Join the file system to the Active Directory to restrict access.',
    answerVariants: [
      'A. Create local users and groups directly on the FSx for Windows File Server file system that mirror the on-premises Active Directory identities.',
      'B. Configure an AWS IAM Identity Center permission set for the FSx file shares so SMB folder access follows the existing AD groups.',
      'C. Use AWS Directory Service Simple AD and migrate the file share permissions manually into the new directory before cutover.',
      'D. Join the file system to the Active Directory to restrict access.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 261,
    topicSlug: 'edge-and-global-routing',
    question: 'A company recently announced the deployment of its retail website to a global audience. The website runs on multiple Amazon EC2 instances behind an Elastic Load Balancer. The instances run in an Auto Scaling group across multiple Availability Zones. The company wants to provide its customers with different versions of content based on the devices that the customers use to access the website. Which combination of actions should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'A. Configure Amazon CloudFront to cache multiple versions of the content.',
    answerVariants: [
      'A. Configure Amazon CloudFront to cache multiple versions of the content.',
      'B. Configure an Application Load Balancer listener rule to serve different content versions based on the User-Agent header.',
      'C. Deploy separate Auto Scaling groups for each device type and route users by using Route 53 weighted records.',
      'D. Store all device-specific content in Amazon EFS and mount the file system to every EC2 instance for dynamic selection.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 262,
    topicSlug: 'network-security-controls',
    question: 'A company plans to use Amazon ElastiCache for its multi-tier web application. A solutions architect creates a Cache VPC for the ElastiCache cluster and an App VPC for the application\'s Amazon EC2 instances. Both VPCs are in the us-east-1 Region. The solutions architect must implement a solution to provide the application\'s EC2 instances with access to the ElastiCache cluster. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'A. Create a peering connection between the VPCs. Add a route table entry for the peering connection in both VPCs. Configure an inbound rule for the ElastiCache cluster\'s security group to allow inbound connection from the application\'s security groups.',
    answerVariants: [
      'A. Create a peering connection between the VPCs. Add a route table entry for the peering connection in both VPCs. Configure an inbound rule for the ElastiCache cluster\'s security group to allow inbound connection from the application\'s security groups.',
      'B. Create a Transit Gateway and attach both VPCs. Update route tables and allow all traffic between VPC CIDR blocks in both security groups.',
      'C. Expose the ElastiCache endpoint through a public Network Load Balancer and allow inbound access from the App VPC public subnet CIDR ranges.',
      'D. Use AWS PrivateLink to expose ElastiCache from the Cache VPC as an endpoint service and connect from the App VPC interface endpoint.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 263,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is building an application that consists of several microservices. The company has decided to use container technologies to deploy its software on AWS. The company needs a solution that minimizes the amount of ongoing effort for maintenance and scaling. The company cannot manage additional infrastructure. Which combination of actions should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'D. Deploy an Amazon Elastic Container Service (Amazon ECS) cluster with AWS Fargate. Configure service auto scaling policies for each microservice.',
    answerVariants: [
      'A. Deploy an Amazon Elastic Container Service (Amazon ECS) cluster.',
      'B. Deploy an Amazon Elastic Kubernetes Service (Amazon EKS) cluster with self-managed worker nodes and custom scaling scripts.',
      'C. Run each microservice in Docker containers on a fleet of Amazon EC2 instances managed by an Auto Scaling group.',
      'D. Deploy an Amazon Elastic Container Service (Amazon ECS) cluster with AWS Fargate. Configure service auto scaling policies for each microservice.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 264,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a web application hosted over 10 Amazon EC2 instances with traffic directed by Amazon Route 53. The company occasionally experiences a timeout error when attempting to browse the application. The networking team finds that some DNS queries return IP addresses of unhealthy instances, resulting in the timeout error. What should a solutions architect implement to overcome these timeout errors?',
    answer: 'D. Create an Application Load Balancer (ALB) with a health check in front of the EC2 instances. Route to the ALB from Route 53.',
    answerVariants: [
      'A. Configure Route 53 multivalue answer routing directly to the EC2 instance IP addresses and remove unhealthy records manually.',
      'B. Increase the DNS TTL in Route 53 so clients cache healthy instance IP addresses for longer periods.',
      'C. Use Route 53 weighted routing across all 10 EC2 instance records and assign lower weights to frequently unhealthy instances.',
      'D. Create an Application Load Balancer (ALB) with a health check in front of the EC2 instances. Route to the ALB from Route 53.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 265,
    topicSlug: 'edge-and-global-routing',
    question: 'A solutions architect needs to design a highly available application consisting of web, application, and database tiers. HTTPS content delivery should be as close to the edge as possible, with the least delivery time. Which solution meets these requirements and is MOST secure?',
    answer: 'C. Configure a public Application Load Balancer (ALB) with multiple redundant Amazon EC2 instances in private subnets. Configure Amazon CloudFront to deliver HTTPS content using the public ALB as the origin.',
    answerVariants: [
      'A. Configure a public Network Load Balancer with EC2 instances in public subnets and use Amazon Route 53 latency routing for HTTPS content delivery.',
      'B. Host all content directly in Amazon S3 website endpoints and use CloudFront only for static object caching.',
      'C. Configure a public Application Load Balancer (ALB) with multiple redundant Amazon EC2 instances in private subnets. Configure Amazon CloudFront to deliver HTTPS content using the public ALB as the origin.',
      'D. Deploy the web and application tiers on one EC2 instance in each Availability Zone and terminate HTTPS on each instance by using self-managed certificates.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 266,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a popular gaming platform running on AWS. The application is sensitive to latency because latency can impact the user experience and introduce unfair advantages to some players. The application is deployed in every AWS Region. It runs on Amazon EC2 instances that are part of Auto Scaling groups configured behind Application Load Balancers (ALBs). A solutions architect needs to implement a mechanism to monitor the health of the application and redirect traffic to healthy endpoints. Which solution meets these requirements?',
    answer: 'A. Configure an accelerator in AWS Global Accelerator. Add a listener for the port that the application listens on, and attach it to a Regional endpoint in each Region. Add the ALB as the endpoint.',
    answerVariants: [
      'A. Configure an accelerator in AWS Global Accelerator. Add a listener for the port that the application listens on, and attach it to a Regional endpoint in each Region. Add the ALB as the endpoint.',
      'B. Use Amazon CloudFront with all ALBs as origins and route traffic by origin groups with health checks in each Region.',
      'C. Configure Route 53 geolocation records that point directly to the EC2 instances in each Region and rely on instance health checks.',
      'D. Create a Transit Gateway inter-Region peering mesh and route end-user game traffic through the nearest peered VPC endpoint.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 267,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has one million users that use its mobile app. The company must analyze the data usage in near-real time. The company also must encrypt the data in near-real time and must store the data in a centralized location in Apache Parquet format for further processing. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'D. Create an Amazon Kinesis Data Firehose delivery stream to store the data in Amazon S3. Create an Amazon Kinesis Data Analytics application to analyze the data.',
    answerVariants: [
      'A. Ingest the mobile data with Amazon SQS, run batch SQL transformations in Amazon Athena, and store the transformed data in Amazon S3 as CSV files.',
      'B. Use Amazon Kinesis Data Streams and custom EC2 consumers to encrypt and transform data, then write output files to Amazon EFS in Parquet format.',
      'C. Send all data directly to Amazon Redshift Serverless and run periodic UNLOAD commands to export encrypted Parquet files to Amazon S3.',
      'D. Create an Amazon Kinesis Data Firehose delivery stream to store the data in Amazon S3. Create an Amazon Kinesis Data Analytics application to analyze the data.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 268,
    topicSlug: 'database-performance-and-caching',
    question: 'A gaming company has a web application that displays scores. The application runs on Amazon EC2 instances behind an Application Load Balancer. The application stores data in an Amazon RDS for MySQL database. Users are starting to experience long delays and interruptions that are caused by database read performance. The company wants to improve the user experience while minimizing changes to the application\'s architecture. What should a solutions architect do to meet these requirements?',
    answer: 'A. Create one or more read replicas for the Amazon RDS for MySQL database and route read traffic to the replicas.',
    answerVariants: [
      'A. Create one or more read replicas for the Amazon RDS for MySQL database and route read traffic to the replicas.',
      'B. Use RDS Proxy between the application and the database.',
      'C. Move the database to Amazon DynamoDB Accelerator (DAX) while keeping the existing MySQL schema unchanged.',
      'D. Increase the Auto Scaling group minimum capacity for the EC2 web tier so application servers can retry database reads faster.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 269,
    topicSlug: 'database-performance-and-caching',
    question: 'An ecommerce company has noticed performance degradation of its Amazon RDS based web application. The performance degradation is attributed to an increase in the number of read-only SQL queries triggered by business analysts. A solutions architect needs to solve the problem with minimal changes to the existing web application. What should the solutions architect recommend?',
    answer: 'C. Create a read replica of the primary database and have the business analysts run their queries.',
    answerVariants: [
      'A. Increase the DB instance class size and run all analyst read-only queries against the primary database.',
      'B. Place Amazon ElastiCache in front of the RDS database and cache every analyst SQL query result for 24 hours.',
      'C. Create a read replica of the primary database and have the business analysts run their queries.',
      'D. Migrate the database to Amazon DynamoDB and export analyst reports to S3 each day for SQL analysis.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 270,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is using a centralized AWS account to store log data in various Amazon S3 buckets. A solutions architect needs to ensure that the data is encrypted at rest before the data is uploaded to the S3 buckets. The data also must be encrypted in transit. Which solution meets these requirements?',
    answer: 'C. Enable server-side encryption with AWS KMS (SSE-KMS) on the destination S3 buckets and require TLS for all S3 requests by using bucket policies.',
    answerVariants: [
      'A. Use client-side encryption to encrypt the data that is being uploaded to the S3 buckets.',
      'B. Enable SSE-S3 on the buckets and allow both HTTP and HTTPS requests to avoid ingestion failures.',
      'C. Enable server-side encryption with AWS KMS (SSE-KMS) on the destination S3 buckets and require TLS for all S3 requests by using bucket policies.',
      'D. Use Amazon Macie to discover sensitive data in the buckets and then apply encryption to existing objects with periodic scan jobs.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 271,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A solutions architect observes that a nightly batch processing job is automatically scaled up for 1 hour before the desired Amazon EC2 capacity is reached. The peak capacity is the \'same every night and the batch jobs always start at 1 AM. The solutions architect needs to find a cost-effective solution that will allow for the desired EC2 capacity to be reached quickly and allow the Auto Scaling group to scale down after the batch jobs are complete. What should the solutions architect do to meet these requirements?',
    answer: 'C. Configure scheduled scaling to scale up to the desired compute level.',
    answerVariants: [
      'A. Configure a step scaling policy that increases capacity when CPU exceeds 80% and decreases capacity when CPU is below 20%.',
      'B. Configure predictive scaling for the Auto Scaling group and let the service infer the nightly pattern over time.',
      'C. Configure scheduled scaling to scale up to the desired compute level.',
      'D. Purchase Reserved Instances for the peak overnight capacity and keep the Auto Scaling group at peak size permanently.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 272,
    topicSlug: 'edge-and-global-routing',
    question: 'A company serves a dynamic website from a fleet of Amazon EC2 instances behind an Application Load Balancer (ALB). The website needs to support multiple languages to serve customers around the world. The website\'s architecture is running in the us-west-1 Region and is exhibiting high request latency for users that are located in other parts of the world. The website needs to serve requests quickly and efficiently regardless of a user\'s location. However, the company does not want to recreate the existing architecture across multiple Regions. What should a solutions architect do to meet these requirements?',
    answer: 'B. Configure an Amazon CloudFront distribution with the ALB as the origin. Set the cache behavior settings to cache based on the Accept-Language request header.',
    answerVariants: [
      'A. Deploy a second ALB in another Region and configure Route 53 latency-based records with failover for each language endpoint.',
      'B. Configure an Amazon CloudFront distribution with the ALB as the origin. Set the cache behavior settings to cache based on the Accept-Language request header.',
      'C. Use AWS Global Accelerator in front of the ALB and route requests by source country to language-specific target groups.',
      'D. Enable ALB HTTP header-based routing to dedicated EC2 instances for each language and disable response caching.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 273,
    topicSlug: 'edge-and-global-routing',
    question: '273Topic 1',
    answer: 'B. Create a cross-Region read replica for the database in the DR Region. Deploy the remaining infrastructure in the DR Region at reduced capacity and scale up during failover.',
    answerVariants: [
      'A. Back up the primary Region database once per day to Amazon S3 and restore the latest backup in the DR Region only during failover.',
      'B. Create a cross-Region read replica for the database in the DR Region. Deploy the remaining infrastructure in the DR Region at reduced capacity and scale up during failover.',
      'C. Use active-active full-capacity deployments in both Regions with Route 53 weighted routing to split production traffic.',
      'D. Copy AMIs and infrastructure templates to the DR Region and keep no running resources there until a disaster occurs.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 274,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs an application on Amazon EC2 instances. The company needs to implement a disaster recovery (DR) solution for the application. The DR solution needs to have a recovery time objective (RTO) of less than 4 hours. The DR solution also needs to use the fewest possible AWS resources during normal operations. Which solution will meet these requirements in the MOST operationally efficient way?',
    answer: 'B. Create Amazon Machine Images (AMIs) to back up the EC2 instances. Copy the AMIs to a secondary AWS Region. Automate infrastructure deployment in the secondary Region by using AWS CloudFormation.',
    answerVariants: [
      'A. Run a warm standby environment in a secondary Region at near-full production scale so failover can happen immediately.',
      'B. Create Amazon Machine Images (AMIs) to back up the EC2 instances. Copy the AMIs to a secondary AWS Region. Automate infrastructure deployment in the secondary Region by using AWS CloudFormation.',
      'C. Deploy an active-active architecture across two Regions and distribute traffic with AWS Global Accelerator at all times.',
      'D. Back up the EC2 instances to Amazon S3 Glacier Deep Archive and restore them on demand to a secondary Region if needed.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 275,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs an internal browser-based application. The application runs on Amazon EC2 instances behind an Application Load Balancer. The instances run in an Amazon EC2 Auto Scaling group across multiple Availability Zones. The Auto Scaling group scales up to 20 instances during work hours, but scales down to 2 instances overnight. Staff are complaining that the application is very slow when the day begins, although it runs well by mid-morning. How should the scaling be changed to address the staff complaints and keep costs to a minimum?',
    answer: 'A. Configure a scheduled scaling action to increase capacity before the workday begins. Keep target tracking for daytime elasticity.',
    answerVariants: [
      'A. Configure a scheduled scaling action to increase capacity before the workday begins. Keep target tracking for daytime elasticity.',
      'B. Increase the Auto Scaling group minimum capacity to 20 instances so there is no morning warm-up period.',
      'C. Implement a target tracking action triggered at a lower CPU threshold, and decrease the cooldown period.',
      'D. Replace the Auto Scaling policy with step scaling that adds one instance every 5 minutes once CPU usage exceeds 60%.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 276,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has a multi-tier application deployed on several Amazon EC2 instances in an Auto Scaling group. An Amazon RDS for Oracle instance is the application\' s data layer that uses Oracle-specific PL/SQL functions. Traffic to the application has been steadily increasing. This is causing the EC2 instances to become overloaded and the RDS instance to run out of storage. The Auto Scaling group does not have any scaling metrics and defines the minimum healthy instance count only. The company predicts that traffic will continue to increase at a steady but unpredictable rate before leveling off. What should a solutions architect do to ensure the system can automatically scale for the increased traffic? (Choose two.)',
    answer: 'A. Configure storage Auto Scaling on the RDS for Oracle instance.',
    answerVariants: [
      'A. Configure storage Auto Scaling on the RDS for Oracle instance.',
      'B. Replace Amazon RDS for Oracle with Amazon DynamoDB and migrate all PL/SQL logic to Lambda functions.',
      'C. Increase the EC2 instance size manually every month to accommodate the expected steady traffic growth.',
      'D. Disable Auto Scaling for EC2 and run a fixed number of instances to avoid instability during growth periods.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 277,
    topicSlug: 'storage-performance-patterns',
    question: 'A company provides an online service for posting video content and transcoding it for use by any mobile platform. The application architecture uses Amazon Elastic File System (Amazon EFS) Standard to collect and store the videos so that multiple Amazon EC2 Linux instances can access the video content for processing. As the popularity of the service has grown over time, the storage costs have become too expensive. Which storage solution is MOST cost-effective?',
    answer: 'D. Use Amazon S3 for storing the video content. Move the files temporarily over to an Amazon Elastic Block Store (Amazon EBS) volume attached to the server for processing.',
    answerVariants: [
      'A. Continue to store all videos in Amazon EFS Standard and purchase additional throughput so processing remains fast.',
      'B. Move all video content to Amazon EFS One Zone and process files directly from EFS across all EC2 instances.',
      'C. Store all videos in Amazon FSx for Lustre and keep the entire dataset permanently mounted for all transcoding workers.',
      'D. Use Amazon S3 for storing the video content. Move the files temporarily over to an Amazon Elastic Block Store (Amazon EBS) volume attached to the server for processing.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 278,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company wants to create an application to store employee data in a hierarchical structured relationship. The company needs a minimum-latency response to high-traffic queries for the employee data and must protect any sensitive data. The company also needs to receive monthly email messages if any financial information is present in the employee data. Which combination of steps should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'B. Use Amazon DynamoDB to store the employee data in hierarchies. Export the data to Amazon S3 every month.',
    answerVariants: [
      'A. Store the hierarchical employee data in Amazon RDS for MySQL and run monthly database snapshots to S3 for financial data checks.',
      'B. Use Amazon DynamoDB to store the employee data in hierarchies. Export the data to Amazon S3 every month.',
      'C. Store the employee data in Amazon ElastiCache and replicate to S3 daily for persistence and financial data scans.',
      'D. Store all employee data directly in Amazon S3 and use S3 event notifications for each write to evaluate financial fields.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 279,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has an application that is backed by an Amazon DynamoDB table. The company\'s compliance requirements specify that database backups must be taken every month, must be available for 6 months, and must be retained for 7 years. Which solution will meet these requirements?',
    answer: 'A. Create an AWS Backup plan to back up the DynamoDB table on the first day of each month. Specify a lifecycle policy that transitions the backup to cold storage after 6 months. Set the retention period for each backup to 7 years.',
    answerVariants: [
      'A. Create an AWS Backup plan to back up the DynamoDB table on the first day of each month. Specify a lifecycle policy that transitions the backup to cold storage after 6 months. Set the retention period for each backup to 7 years.',
      'B. Enable DynamoDB point-in-time recovery and keep continuous backups for 7 years. Export monthly recovery points to Amazon S3 Glacier.',
      'C. Schedule a monthly DynamoDB export to S3 and apply S3 Lifecycle transitions to cold storage after 6 months with 7-year retention.',
      'D. Create daily on-demand DynamoDB backups and manually delete all but one backup each month to satisfy the monthly retention policy.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 280,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is using Amazon CloudFront with its website. The company has enabled logging on the CloudFront distribution, and logs are saved in one of the company\'s Amazon S3 buckets. The company needs to perform advanced analyses on the logs and build visualizations. What should a solutions architect do to meet these requirements?',
    answer: 'B. Use standard SQL queries in Amazon Athena to analyze the CloudFront logs in the S3 bucket. Visualize the results with Amazon QuickSight.',
    answerVariants: [
      'A. Load the CloudFront logs into Amazon OpenSearch Service and build visualizations with OpenSearch Dashboards.',
      'B. Use standard SQL queries in Amazon Athena to analyze the CloudFront logs in the S3 bucket. Visualize the results with Amazon QuickSight.',
      'C. Use AWS Glue DataBrew to profile the CloudFront logs and create dashboards directly in AWS Glue Studio.',
      'D. Use Amazon Redshift to ingest the CloudFront logs from S3 and build visualizations by exporting query output to CSV reports.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 281,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a fleet of web servers using an Amazon RDS for PostgreSQL DB instance. After a routine compliance check, the company sets a standard that requires a recovery point objective (RPO) of less than 1 second for all its production databases. Which solution meets these requirements?',
    answer: 'A. Enable a Multi-AZ deployment for the DB instance.',
    answerVariants: [
      'A. Enable a Multi-AZ deployment for the DB instance.',
      'B. Create a read replica in another Availability Zone and direct all write traffic to the read replica.',
      'C. Configure automated snapshots every 1 minute and restore from the latest snapshot in the event of failure.',
      'D. Enable Amazon RDS Proxy in front of the DB instance to reduce connection overhead and improve failover speed.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 282,
    topicSlug: 'network-security-controls',
    question: 'A company runs a web application that is deployed on Amazon EC2 instances in the private subnet of a VPC. An Application Load Balancer (ALB) that extends across the public subnets directs web traffic to the EC2 instances. The company wants to implement new security measures to restrict inbound traffic from the ALB to the EC2 instances while preventing access from any other source inside or outside the private subnet of the EC2 instances. Which solution will meet these requirements?',
    answer: 'B. Configure the security group for the EC2 instances to only allow traffic that comes from the security group for the ALB.',
    answerVariants: [
      'A. Configure a network ACL on the private subnets to allow inbound traffic from 0.0.0.0/0 only on port 80 and 443.',
      'B. Configure the security group for the EC2 instances to only allow traffic that comes from the security group for the ALB.',
      'C. Configure the security group for the EC2 instances to allow inbound traffic from the VPC CIDR block on all TCP ports.',
      'D. Configure the ALB security group to allow outbound traffic only to the EC2 instance private IP addresses.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 283,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 284,
    topicSlug: 'cost-visibility-and-governance',
    question: 'As part of budget planning, management wants a report of AWS billed items listed by user. The data will be used to create department budgets. A solutions architect needs to determine the most efficient way to obtain this report information. Which solution meets these requirements?',
    answer: 'B. Create a report in Cost Explorer and download the report.',
    answerVariants: [
      'A. Enable AWS CloudTrail and generate a monthly report that maps API calls to IAM users for budget planning.',
      'B. Create a report in Cost Explorer and download the report.',
      'C. Use AWS Trusted Advisor cost optimization checks and export the checks by IAM user to CSV.',
      'D. Query the billing data from Amazon CloudWatch metrics and build a custom report in Amazon QuickSight.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 285,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company hosts its static website by using Amazon S3. The company wants to add a contact form to its webpage. The contact form will have dynamic server-side components for users to input their name, email address, phone number, and user message. The company anticipates that there will be fewer than 100 site visits each month. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Create an Amazon API Gateway endpoint with an AWS Lambda backend that makes a call to Amazon Simple Email Service (Amazon SES).',
    answerVariants: [
      'A. Host a contact form service on an Amazon EC2 instance behind an Application Load Balancer and send emails by using an SMTP relay.',
      'B. Create an Amazon API Gateway endpoint with an AWS Lambda backend that makes a call to Amazon Simple Email Service (Amazon SES).',
      'C. Use Amazon Cognito user pools and AWS AppSync resolvers to process contact form submissions and send emails.',
      'D. Use AWS Elastic Beanstalk to deploy a small web server that receives form submissions and forwards them to Amazon SNS.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 286,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has a static website that is hosted on Amazon CloudFront in front of Amazon S3. The static website uses a database backend. The company notices that the website does not reflect updates that have been made in the website\'s Git repository. The company checks the continuous integration and continuous delivery (CI/CD) pipeline between the Git repository and Amazon S3. The company verifies that the webhooks are configured properly and that the CI/CD pipeline is sending messages that indicate successful deployments.',
    answer: 'B. Create an Amazon CloudFront invalidation after each successful deployment so viewers receive the latest objects.',
    answerVariants: [
      'A. Increase the CloudFront default TTL to cache updated objects for longer and reduce stale content checks from edge locations.',
      'B. Create an Amazon CloudFront invalidation after each successful deployment so viewers receive the latest objects.',
      'C. Recreate the CloudFront distribution after every successful deployment to ensure all edge caches are reset globally.',
      'D. Disable CloudFront caching entirely and serve all website requests directly from the S3 origin bucket.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 287,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to migrate a Windows-based application from on premises to the AWS Cloud. The application has three tiers: an application tier, a business tier, and a database tier with Microsoft SQL Server. The company wants to use specific features of SQL Server such as native backups and Data Quality Services. The company also needs to share files for processing between the tiers. How should a solutions architect design the architecture to meet these requirements?',
    answer: 'B. Host all three tiers on Amazon EC2 instances. Use Amazon FSx for Windows File Server for file sharing between the tiers.',
    answerVariants: [
      'A. Host the application and business tiers on AWS Lambda and use Amazon RDS for SQL Server for the database tier.',
      'B. Host all three tiers on Amazon EC2 instances. Use Amazon FSx for Windows File Server for file sharing between the tiers.',
      'C. Host the database tier on Amazon Aurora PostgreSQL and use Amazon EFS for cross-tier file sharing.',
      'D. Host all tiers on Amazon ECS with Fargate and use Amazon S3 as the shared file system between Windows containers.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 288,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is migrating a Linux-based web server group to AWS. The web servers must access files in a shared file store for some content. The company must not make any changes to the application. What should a solutions architect do to meet these requirements?',
    answer: 'C. Create an Amazon Elastic File System (Amazon EFS) file system. Mount the EFS file system on all web servers.',
    answerVariants: [
      'A. Create an Amazon S3 bucket and mount it to each Linux web server by using a FUSE-based S3 file system driver.',
      'B. Create an Amazon FSx for Windows File Server file share and mount it on each Linux web server over SMB.',
      'C. Create an Amazon Elastic File System (Amazon EFS) file system. Mount the EFS file system on all web servers.',
      'D. Attach one Amazon EBS volume to each web server and synchronize files between volumes by using cron jobs.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 289,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has an AWS Lambda function that needs read access to an Amazon S3 bucket that is located in the same AWS account. Which solution will meet these requirements in the MOST secure manner?',
    answer: 'B. Apply an IAM role to the Lambda function. Apply an IAM policy to the role to grant read access to the S3 bucket.',
    answerVariants: [
      'A. Create an IAM user with read-only S3 permissions. Store the IAM user access keys in Lambda environment variables.',
      'B. Apply an IAM role to the Lambda function. Apply an IAM policy to the role to grant read access to the S3 bucket.',
      'C. Attach an S3 bucket policy that allows all Lambda functions in the account to read from the bucket.',
      'D. Create a VPC endpoint for Amazon S3 and attach an endpoint policy that grants the Lambda function read access.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 290,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company hosts a web application on multiple Amazon EC2 instances. The EC2 instances are in an Auto Scaling group that scales in response to user demand. The company wants to optimize cost savings without making a long-term commitment. Which EC2 instance purchasing option should a solutions architect recommend to meet these requirements?',
    answer: 'C. A mix of On-Demand Instances and Spot Instances',
    answerVariants: [
      'A. Reserved Instances for all EC2 instances in the Auto Scaling group.',
      'B. Dedicated Hosts for all EC2 instances to maximize placement control and cost savings.',
      'C. A mix of On-Demand Instances and Spot Instances.',
      'D. Savings Plans for all compute usage with a 3-year no-upfront commitment.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 291,
    topicSlug: 'edge-and-global-routing',
    question: 'A media company uses Amazon CloudFront for its publicly available streaming video content. The company wants to secure the video content that is hosted in Amazon S3 by controlling who has access. Some of the company\'s users are using a custom HTTP client that does not support cookies. Some of the company\'s users are unable to change the hardcoded URLs that they are using for access. Which services or methods will meet these requirements with the LEAST impact to the users? (Choose two.)',
    answer: 'D. Use signed URLs for clients that cannot use cookies and signed cookies for browser clients that access multiple files.',
    answerVariants: [
      'A. Signed cookies.',
      'B. Restrict access by using S3 bucket ACLs only and keep CloudFront objects public for all users.',
      'C. Omit all URL signing and rely on CloudFront geo-restriction to protect video content from unauthorized viewers.',
      'D. Use signed URLs for clients that cannot use cookies and signed cookies for browser clients that access multiple files.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 292,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is preparing a new data platform that will ingest real-time streaming data from multiple sources. The company needs to transform the data before writing the data to Amazon S3. The company needs the ability to use SQL to query the transformed data. Which solutions will meet these requirements? (Choose two.)',
    answer: 'A. Use Amazon Kinesis Data Streams to stream the data. Use Amazon Kinesis Data Analytics to transform the data. Use Amazon Kinesis Data Firehose to write the data to Amazon S3. Use Amazon Athena to query the transformed data from Amazon S3.',
    answerVariants: [
      'A. Use Amazon Kinesis Data Streams to stream the data. Use Amazon Kinesis Data Analytics to transform the data. Use Amazon Kinesis Data Firehose to write the data to Amazon S3. Use Amazon Athena to query the transformed data from Amazon S3.',
      'B. Use Amazon SQS to ingest the stream, AWS Glue jobs to transform records every hour, and Amazon Redshift to query the transformed data.',
      'C. Use Amazon MSK for ingestion, run transformations on a persistent Amazon EMR cluster, and store transformed data in Amazon EFS for SQL access.',
      'D. Use Amazon API Gateway WebSocket APIs for ingestion, AWS Lambda for transformation, and Amazon DynamoDB for SQL querying.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 293,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has an on-premises volume backup solution that has reached its end of life. The company wants to use AWS as part of a new backup solution and wants to maintain local access to all the data while it is backed up on AWS. The company wants to ensure that the data backed up on AWS is automatically and securely transferred. Which solution meets these requirements?',
    answer: 'D. Use AWS Storage Gateway and configure a stored volume gateway. Run the Storage Gateway software appliance on premises and map the gateway storage volumes to on-premises storage. Mount the gateway storage volumes to provide local access to the data.',
    answerVariants: [
      'A. Use AWS DataSync to copy on-premises backup volumes to Amazon S3 nightly and mount S3 buckets directly for local access.',
      'B. Use Amazon FSx File Gateway to present SMB shares from AWS and keep all primary backup data only in the cloud.',
      'C. Use AWS Backup gateway with no local volume cache and restore files on demand from AWS whenever users request local access.',
      'D. Use AWS Storage Gateway and configure a stored volume gateway. Run the Storage Gateway software appliance on premises and map the gateway storage volumes to on-premises storage. Mount the gateway storage volumes to provide local access to the data.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 294,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An application that is hosted on Amazon EC2 instances needs to access an Amazon S3 bucket. Traffic must not traverse the internet. How should a solutions architect configure access to meet these requirements?',
    answer: 'B. Set up a gateway VPC endpoint for Amazon S3 in the VPC.',
    answerVariants: [
      'A. Attach an internet gateway to the private subnet route table and permit only Amazon S3 IP ranges in the security group rules.',
      'B. Set up a gateway VPC endpoint for Amazon S3 in the VPC.',
      'C. Deploy a NAT gateway in the private subnet and route all S3 requests through the NAT gateway using private DNS.',
      'D. Create an interface VPC endpoint for Amazon S3 in each subnet and route all traffic through the endpoint ENIs.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 295,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'An ecommerce company stores terabytes of customer data in the AWS Cloud. The data contains personally identifiable information (PII). The company wants to use the data in three applications. Only one of the applications needs to process the PII. The PII must be removed before the other two applications process the data. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Use Amazon Macie to discover and classify PII in the S3 data. Route non-PII and de-identified outputs to separate locations for downstream applications.',
    answerVariants: [
      'A. Duplicate the full S3 dataset into three separate buckets and use IAM policies so only one application can read objects with PII.',
      'B. Store the data in an Amazon S3 bucket. Process and transform the data by using S3 Object Lambda before returning the data to the requesting application.',
      'C. Use Amazon Macie to discover and classify PII in the S3 data. Route non-PII and de-identified outputs to separate locations for downstream applications.',
      'D. Move all data into Amazon DynamoDB and create table-level access controls so only one application can read PII attributes.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 296,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A development team has launched a new application that is hosted on Amazon EC2 instances inside a development VPC. A solutions architect needs to create a new VPC in the same account. The new VPC will be peered with the development VPC. The VPC CIDR block for the development VPC is 192.168.0.0/24. The solutions architect needs to create a CIDR block for the new VPC. The CIDR block must be valid for a VPC peering connection to the development VPC. What is the SMALLEST CIDR block that meets these requirements?',
    answer: 'A. 10.0.0.0/30',
    answerVariants: [
      'A. 10.0.0.0/30.',
      'B. 192.168.0.0/23.',
      'C. 192.168.0.128/25.',
      'D. 10.0.1.0/24.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 297,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect needs to implement a solution to automate the scalability of the application. The solution must optimize the cost of the architecture and must ensure that the application has enough CPU resources when surges occur. Which solution will meet these requirements?',
    answer: 'B. Create an EC2 Auto Scaling group. Select the existing ALB as the load balancer and the existing target group as the target group. Set a target tracking scaling policy that is based on the ASGAverageCPUUtilization metric. Set the minimum instances to 2, the desired capacity to 3, the maximum instances to 6, and the target value to 50%. Add the EC2 instances to the Auto Scaling group.',
    answerVariants: [
      'A. Keep the existing EC2 instances outside Auto Scaling and manually add more instances during traffic surges when CPU usage exceeds 50%.',
      'B. Create an EC2 Auto Scaling group. Select the existing ALB as the load balancer and the existing target group as the target group. Set a target tracking scaling policy that is based on the ASGAverageCPUUtilization metric. Set the minimum instances to 2, the desired capacity to 3, the maximum instances to 6, and the target value to 50%. Add the EC2 instances to the Auto Scaling group.',
      'C. Configure a scheduled scaling policy that runs every hour to add one instance and then remove one instance 30 minutes later.',
      'D. Move the workload to a single larger EC2 instance and keep the ALB in front to absorb request spikes during traffic surges.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 298,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is running a critical business application on Amazon EC2 instances behind an Application Load Balancer. The EC2 instances run in an Auto Scaling group and access an Amazon RDS DB instance. The design did not pass an operational review because the EC2 instances and the DB instance are all located in a single Availability Zone. A solutions architect must update the design to use a second Availability Zone. Which solution will make the application highly available?',
    answer: 'A. Configure the Auto Scaling group to span at least two Availability Zones and migrate the RDS DB instance to Multi-AZ deployment.',
    answerVariants: [
      'A. Configure the Auto Scaling group to span at least two Availability Zones and migrate the RDS DB instance to Multi-AZ deployment.',
      'B. Keep the current single-AZ design and add an Amazon CloudFront distribution to improve availability for end users.',
      'C. Add a read replica in the same Availability Zone and configure the ALB to route requests directly to the read replica.',
      'D. Replace Amazon RDS with a self-managed database on EC2 in the second Availability Zone and replicate data asynchronously.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 299,
    topicSlug: 'storage-performance-patterns',
    question: 'A research laboratory needs to process approximately 8 TB of data. The laboratory requires sub-millisecond latencies and a minimum throughput of 6 GBps for the storage subsystem. Hundreds of Amazon EC2 instances that run Amazon Linux will distribute and process the data. Which solution will meet the performance requirements?',
    answer: 'B. Create an Amazon S3 bucket to store the raw data. Create an Amazon FSx for Lustre file system that uses persistent SSD storage. Select the option to import data from and export data to Amazon S3. Mount the file system on the EC2 instances.',
    answerVariants: [
      'A. Create an Amazon EFS file system in Max I/O mode and mount it on all EC2 instances for shared processing of the 8 TB dataset.',
      'B. Create an Amazon S3 bucket to store the raw data. Create an Amazon FSx for Lustre file system that uses persistent SSD storage. Select the option to import data from and export data to Amazon S3. Mount the file system on the EC2 instances.',
      'C. Use Amazon S3 Standard as the live storage layer and access the objects directly from the EC2 instances by using the S3 API.',
      'D. Use Amazon EBS io2 Block Express volumes attached to one EC2 instance and share data to all other instances over NFS.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 300,
    topicSlug: 'database-performance-and-caching',
    question: 'A company needs to migrate a legacy application from an on-premises data center to the AWS Cloud because of hardware capacity constraints. The application runs 24 hours a day, 7 days a week. The application\'s database storage continues to grow over time. What should a solutions architect do to meet these requirements MOST cost-effectively?',
    answer: 'C. Migrate the application layer to Amazon EC2 Reserved Instances. Migrate the data storage layer to Amazon Aurora Reserved Instances.',
    answerVariants: [
      'A. Migrate the application layer to On-Demand EC2 instances and migrate the database to Amazon RDS for MySQL with general purpose SSD storage.',
      'B. Migrate the application layer to Spot Instances and migrate the database to Amazon DynamoDB on-demand capacity mode.',
      'C. Migrate the application layer to Amazon EC2 Reserved Instances. Migrate the data storage layer to Amazon Aurora Reserved Instances.',
      'D. Migrate the application layer to AWS Lambda and keep the existing on-premises database synchronized with AWS by using AWS DataSync.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 301,
    topicSlug: 'storage-performance-patterns',
    question: '301Topic 1',
    answer: 'B. Use AWS DataSync to transfer data from the on-premises Windows file server to Amazon FSx for Windows File Server.',
    answerVariants: [
      'A. Use AWS Snowball Edge devices to copy all data from the on-premises file server and import the data into Amazon FSx for Windows File Server.',
      'B. Use AWS DataSync to transfer data from the on-premises Windows file server to Amazon FSx for Windows File Server.',
      'C. Use AWS Transfer Family with SFTP to migrate SMB file shares directly into Amazon FSx for Windows File Server.',
      'D. Use AWS Storage Gateway tape gateway to write the file share contents to virtual tapes, then restore the tapes into Amazon FSx.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 302,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to create a mobile app that allows users to stream slow-motion video clips on their mobile devices. Currently, the app captures video clips and uploads the video clips in raw format into an Amazon S3 bucket. The app retrieves these video clips directly from the S3 bucket. However, the videos are large in their raw format. Users are experiencing issues with buffering and playback on mobile devices. The company wants to implement solutions to maximize the performance and scalability of the app while minimizing operational overhead. Which combination of solutions will meet these requirements? (Choose two.)',
    answer: 'A. Deploy Amazon CloudFront for content delivery and caching.',
    answerVariants: [
      'A. Deploy Amazon CloudFront for content delivery and caching.',
      'B. Continue serving raw videos directly from Amazon S3, and increase the S3 request rate quota for the bucket.',
      'C. Store videos in Amazon EFS and mount the file system on a fleet of EC2 media servers behind an Application Load Balancer.',
      'D. Use Amazon API Gateway WebSocket APIs to stream raw video objects from S3 to clients in chunks.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 303,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is launching a new application deployed on an Amazon Elastic Container Service (Amazon ECS) cluster and is using the Fargate launch type for ECS tasks. The company is monitoring CPU and memory usage because it is expecting high traffic to the application upon its launch. However, the company wants to reduce costs when utilization decreases. What should a solutions architect recommend?',
    answer: 'D. Use AWS Application Auto Scaling with target tracking policies to scale when ECS metric breaches trigger an Amazon CloudWatch alarm.',
    answerVariants: [
      'A. Increase the number of ECS tasks manually whenever CPU or memory usage rises above 70%.',
      'B. Replace ECS Fargate with fixed-size EC2 instances so the company can control scaling logic by scripts.',
      'C. Configure only step scaling for ECS tasks with one-time scheduled actions during launch week.',
      'D. Use AWS Application Auto Scaling with target tracking policies to scale when ECS metric breaches trigger an Amazon CloudWatch alarm.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 304,
    topicSlug: 'storage-performance-patterns',
    question: 'A company recently created a disaster recovery site in a different AWS Region. The company needs to transfer large amounts of data back and forth between NFS file systems in the two Regions on a periodic basis. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use AWS DataSync.',
    answerVariants: [
      'A. Use AWS DataSync.',
      'B. Use S3 Cross-Region Replication from one Region to another and mount S3 buckets through file gateway endpoints.',
      'C. Use AWS Snowball Edge devices periodically to move changed NFS data between the Regions.',
      'D. Use AWS Transfer Family and schedule NFS exports through SFTP from each file system.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 305,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is designing a shared storage solution for a gaming application that is hosted in the AWS Cloud. The company needs the ability to use SMB clients to access data. The solution must be fully managed. Which AWS solution meets these requirements?',
    answer: 'C. Create an Amazon FSx for Windows File Server file system. Attach the file system to the origin server. Connect the application server to the file system.',
    answerVariants: [
      'A. Create an Amazon EFS file system and use an SMB gateway appliance on EC2 to proxy SMB access for the gaming application.',
      'B. Create an Amazon S3 bucket and mount it to all game servers over SMB by using a third-party filesystem driver.',
      'C. Create an Amazon FSx for Windows File Server file system. Attach the file system to the origin server. Connect the application server to the file system.',
      'D. Create a self-managed Windows file share cluster on EC2 instances with EBS volumes for shared SMB access.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 306,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to run an in-memory database for a latency-sensitive application that runs on Amazon EC2 instances. The application processes more than 100,000 transactions each minute and requires high network throughput. A solutions architect needs to provide a cost-effective network design that minimizes data transfer charges. Which solution meets these requirements?',
    answer: 'A. Launch all EC2 instances in the same Availability Zone within the same AWS Region. Specify a placement group with cluster strategy when launching EC2 instances.',
    answerVariants: [
      'A. Launch all EC2 instances in the same Availability Zone within the same AWS Region. Specify a placement group with cluster strategy when launching EC2 instances.',
      'B. Distribute EC2 instances evenly across all Availability Zones and use spread placement groups to reduce correlated failures.',
      'C. Deploy instances in two Regions and route traffic through AWS Global Accelerator for lowest transfer cost and latency.',
      'D. Place all EC2 instances behind an internet-facing Application Load Balancer and use cross-zone load balancing.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 307,
    topicSlug: 'exam-preparation',
    question: 'A company that primarily runs its application servers on premises has decided to migrate to AWS. The company wants to minimize its need to scale its Internet Small Computer Systems Interface (iSCSI) storage on premises. The company wants only its recently accessed data to remain stored locally. Which AWS solution should the company use to meet these requirements?',
    answer: 'D. AWS Storage Gateway Volume Gateway cached volumes.',
    answerVariants: [
      'A. AWS Storage Gateway tape gateway with virtual tapes retained on premises.',
      'B. AWS DataSync with scheduled synchronization to Amazon S3 and no local cache.',
      'C. AWS Storage Gateway file gateway with all data pinned locally and no cloud tiering.',
      'D. AWS Storage Gateway Volume Gateway cached volumes.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 308,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has multiple AWS accounts that use consolidated billing. The company runs several active high performance Amazon RDS for Oracle On-Demand DB instances for 90 days. The company\'s finance team has access to AWS Trusted Advisor in the consolidated billing account and all other AWS accounts. The finance team needs to use the appropriate AWS account to access the Trusted Advisor check recommendations for RDS. The finance team must review the appropriate Trusted Advisor check to reduce RDS costs. Which combination of steps should the finance team take to meet these requirements? (Choose two.)',
    answer: 'B. Review Trusted Advisor recommendations in each member account and use the Amazon RDS Reserved DB Instances check.',
    answerVariants: [
      'A. Review the Trusted Advisor checks only in the consolidated billing management account because all RDS recommendations are centralized there.',
      'B. Review Trusted Advisor recommendations in each member account and use the Amazon RDS Reserved DB Instances check.',
      'C. Use AWS Budgets in the management account to automatically convert all RDS On-Demand usage to Reserved DB instances.',
      'D. Use Cost Explorer recommendations only; Trusted Advisor does not provide RDS reservation guidance for member accounts.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 309,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A solutions architect needs to optimize storage costs. The solutions architect must identify any Amazon S3 buckets that are no longer being accessed or are rarely accessed. Which solution will accomplish this goal with the LEAST operational overhead?',
    answer: 'A. Analyze bucket access patterns by using the S3 Storage Lens dashboard for advanced activity metrics.',
    answerVariants: [
      'A. Analyze bucket access patterns by using the S3 Storage Lens dashboard for advanced activity metrics.',
      'B. Enable server access logging on each bucket and manually query each log file weekly by using EC2-hosted scripts.',
      'C. Turn on CloudTrail data events for every bucket and inspect each PutObject and GetObject call manually each month.',
      'D. Run daily AWS Config conformance packs to detect buckets that have no new objects for 30 days.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 310,
    topicSlug: 'edge-and-global-routing',
    question: 'A company sells datasets to customers who do research in artificial intelligence and machine learning (AI/ML). The datasets are large, formatted files that are stored in an Amazon S3 bucket in the us-east-1 Region. The company hosts a web application that the customers use to purchase access to a given dataset. The web application is deployed on multiple Amazon EC2 instances behind an Application Load Balancer. After a purchase is made, customers receive an S3 signed URL that allows access to the files. The customers are distributed across North America and Europe. The company wants to reduce the cost that is associated with data transfers and wants to maintain or improve performance. What should a solutions architect do to meet these requirements?',
    answer: 'B. Deploy an Amazon CloudFront distribution with the existing S3 bucket as the origin. Direct customer requests to the CloudFront URL. Switch to CloudFront signed URLs for access control.',
    answerVariants: [
      'A. Keep using direct S3 signed URLs and increase S3 transfer acceleration for each object to improve global download speed.',
      'B. Deploy an Amazon CloudFront distribution with the existing S3 bucket as the origin. Direct customer requests to the CloudFront URL. Switch to CloudFront signed URLs for access control.',
      'C. Replicate the S3 bucket to Europe and North America Regions and generate Region-specific S3 signed URLs for all customers.',
      'D. Move all dataset files to EFS in us-east-1 and serve them over EC2 instances behind a Network Load Balancer.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 311,
    topicSlug: 'exam-preparation',
    question: 'A company is using AWS to design a web application that will process insurance quotes. Users will request quotes from the application. Quotes must be separated by quote type, must be responded to within 24 hours, and must not get lost. The solution must maximize operational efficiency and must minimize maintenance. Which solution meets these requirements?',
    answer: 'C. Use separate Amazon SQS queues by quote type, process with AWS Lambda workers, and configure a dead-letter queue for failed messages.',
    answerVariants: [
      'A. Use Amazon SNS to deliver quote requests directly to multiple EC2 workers and retry failures from instance logs.',
      'B. Store quote requests in Amazon S3 prefixes by quote type and run nightly AWS Glue jobs to process all quotes in batch.',
      'C. Use separate Amazon SQS queues by quote type, process with AWS Lambda workers, and configure a dead-letter queue for failed messages.',
      'D. Use Amazon EventBridge scheduled rules to pull all quote requests every 24 hours and process them synchronously.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 312,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has an application that runs on several Amazon EC2 instances. Each EC2 instance has multiple Amazon Elastic Block Store (Amazon EBS) data volumes attached to it. The application\'s EC2 instance configuration and data need to be backed up nightly. The application also needs to be recoverable in a different AWS Region. Which solution will meet these requirements in the MOST operationally efficient way?',
    answer: 'C. Create a backup plan by using AWS Backup to perform nightly backups. Copy the backups to another Region. Add the application\'s EBS volumes as resources.',
    answerVariants: [
      'A. Create nightly AMIs manually for each EC2 instance and copy the AMIs to another Region. Restore EBS data from the AMIs.',
      'B. Enable EBS snapshots from each instance by using cron scripts, then copy snapshots manually to another Region once per week.',
      'C. Create a backup plan by using AWS Backup to perform nightly backups. Copy the backups to another Region. Add the application\'s EBS volumes as resources.',
      'D. Use AWS DataSync to copy all attached EBS volume files directly to an S3 bucket in another Region each night.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 313,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is building a mobile app on AWS. The company wants to expand its reach to millions of users. The company needs to build a platform so that authorized users can watch the company\'s content on their mobile devices. What should a solutions architect recommend to meet these requirements?',
    answer: 'C. Use Amazon CloudFront. Provide signed URLs to stream content.',
    answerVariants: [
      'A. Use Amazon S3 static website endpoints only and rely on bucket policies to restrict unauthorized mobile users.',
      'B. Use AWS Global Accelerator with EC2 media servers in each Region and generate temporary IAM credentials for clients.',
      'C. Use Amazon CloudFront. Provide signed URLs to stream content.',
      'D. Use Amazon API Gateway WebSocket APIs to broker all video streams and authorize each stream by API keys.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 314,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has an on-premises MySQL database used by the global sales team with infrequent access patterns. The sales team requires the database to have minimal downtime. A database administrator wants to migrate this database to AWS without selecting a particular instance type in anticipation of more users in the future. Which service should a solutions architect recommend?',
    answer: 'B. Amazon Aurora Serverless for MySQL',
    answerVariants: [
      'A. Amazon RDS for MySQL on a fixed-size instance class with Multi-AZ enabled.',
      'B. Amazon Aurora Serverless for MySQL.',
      'C. Self-managed MySQL on EC2 instances behind a Network Load Balancer.',
      'D. Amazon DynamoDB global tables with a relational mapper layer.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 315,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 316,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company uses an Amazon EC2 instance to run a script to poll for and process messages in an Amazon Simple Queue Service (Amazon SQS) queue. The company wants to reduce operational costs while maintaining its ability to process a growing number of messages that are added to the queue. What should a solutions architect recommend to meet these requirements?',
    answer: 'C. Migrate the script on the EC2 instance to an AWS Lambda function with the appropriate runtime.',
    answerVariants: [
      'A. Keep the EC2-based script and move message polling to cron jobs that run every minute for better efficiency.',
      'B. Replace Amazon SQS with Amazon SNS and invoke the EC2 script by HTTP notifications.',
      'C. Migrate the script on the EC2 instance to an AWS Lambda function with the appropriate runtime.',
      'D. Increase the EC2 instance size and poll the SQS queue with higher parallelism from the same host.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 317,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company uses a legacy application to produce data in CSV format. The legacy application stores the output data in Amazon S3. The company is deploying a new commercial off-the-shelf (COTS) application that can perform complex SQL queries to analyze data that is stored in Amazon Redshift and Amazon S3 only. However, the COTS application cannot process the .csv files that the legacy application produces. The company cannot update the legacy application to produce data in another format. The company needs to implement a solution so that the COTS application can use the data that the legacy application produces. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Create an AWS Glue extract, transform, and load (ETL) job that runs on a schedule. Configure the ETL job to process the .csv files and store the processed data in Amazon Redshift.',
    answerVariants: [
      'A. Create an AWS Glue extract, transform, and load (ETL) job that runs on a schedule. Configure the ETL job to process the .csv files and store the processed data in Amazon Redshift.',
      'B. Use AWS Lambda for each CSV file and write transformed rows directly to Amazon Redshift one row at a time.',
      'C. Use Amazon EMR clusters that run continuously to parse CSV and then export transformed output to EFS for COTS queries.',
      'D. Use Amazon Athena views on CSV data in S3 and configure the COTS application to read Athena query history results.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 318,
    topicSlug: 'network-security-controls',
    question: 'A company recently migrated its entire IT environment to the AWS Cloud. The company discovers that users are provisioning oversized Amazon EC2 instances and modifying security group rules without using the appropriate change control process. A solutions architect must devise a strategy to track and audit these inventory and configuration changes. Which actions should the solutions architect take to meet these requirements? (Choose two.)',
    answer: 'A. Enable AWS CloudTrail and use it for auditing.',
    answerVariants: [
      'A. Enable AWS CloudTrail and use it for auditing.',
      'B. Enable only VPC Flow Logs to track all EC2 size changes and security group rule modifications.',
      'C. Use AWS Trusted Advisor checks to capture all inventory and configuration history changes automatically.',
      'D. Create a CloudWatch dashboard that lists EC2 instance types and security groups daily.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 319,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company has hundreds of Amazon EC2 Linux-based instances in the AWS Cloud. Systems administrators have used shared SSH keys to manage the instances. After a recent audit, the company\'s security team is mandating the removal of all shared keys. A solutions architect must design a solution that provides secure access to the EC2 instances. Which solution will meet this requirement with the LEAST amount of administrative overhead?',
    answer: 'A. Use AWS Systems Manager Session Manager to connect to the EC2 instances.',
    answerVariants: [
      'A. Use AWS Systems Manager Session Manager to connect to the EC2 instances.',
      'B. Create unique SSH key pairs per administrator and distribute public keys manually to all EC2 instances by scripts.',
      'C. Create a bastion host in each subnet and require all administrators to share a rotating SSH key on the bastion.',
      'D. Use AWS Transfer Family to generate temporary SSH credentials for each EC2 login session.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 320,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is using a fleet of Amazon EC2 instances to ingest data from on-premises data sources. The data is in JSON format and ingestion rates can be as high as 1 MB/s. When an EC2 instance is rebooted, the data in-flight is lost. The company\'s data science team wants to query ingested data in near-real time. Which solution provides near-real-time data querying that is scalable with minimal data loss?',
    answer: 'A. Publish data to Amazon Kinesis Data Streams. Use Kinesis Data Analytics to query the data.',
    answerVariants: [
      'A. Publish data to Amazon Kinesis Data Streams. Use Kinesis Data Analytics to query the data.',
      'B. Publish data to Amazon SNS topics and run Athena queries directly on SNS delivery logs for near-real-time analytics.',
      'C. Store all incoming JSON messages on EBS volumes and run hourly batch SQL jobs on EC2 to derive insights.',
      'D. Write data directly to Amazon S3 and trigger AWS Glue crawlers on each object upload for real-time querying.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 321,
    topicSlug: 'identity-access-and-governance',
    question: 'What should a solutions architect do to ensure that all objects uploaded to an Amazon S3 bucket are encrypted?',
    answer: 'D. Update the bucket policy to deny if the PutObject does not have an x-amz-server-side-encryption header set.',
    answerVariants: [
      'A. Enable versioning on the bucket and block all PutObject requests that overwrite existing objects.',
      'B. Enable S3 Block Public Access at the account level so all uploaded objects are encrypted by default.',
      'C. Configure an S3 Lifecycle policy to transition all objects to S3 Glacier Instant Retrieval after 1 day.',
      'D. Update the bucket policy to deny if the PutObject does not have an x-amz-server-side-encryption header set.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 322,
    topicSlug: 'event-driven-and-messaging',
    question: 'A solutions architect is designing a multi-tier application for a company. The application\'s users upload images from a mobile device. The application generates a thumbnail of each image and returns a message to the user to confirm that the image was uploaded successfully. The thumbnail generation can take up to 60 seconds, but the company wants to provide a faster response time to its users to notify them that the original image was received. The solutions architect must design the application to asynchronously dispatch requests to the different application tiers. What should the solutions architect do to meet these requirements?',
    answer: 'C. Create an Amazon Simple Queue Service (Amazon SQS) message queue. As images are uploaded, place a message on the SQS queue for thumbnail generation. Alert the user through an application message that the image was received.',
    answerVariants: [
      'A. Generate thumbnails synchronously in the mobile upload API and return a success message only when thumbnail processing completes.',
      'B. Use Amazon EventBridge scheduled rules to poll for newly uploaded images every minute and process thumbnails in batches.',
      'C. Create an Amazon Simple Queue Service (Amazon SQS) message queue. As images are uploaded, place a message on the SQS queue for thumbnail generation. Alert the user through an application message that the image was received.',
      'D. Store image requests in Amazon DynamoDB and run Amazon Athena queries to identify new images that require thumbnail generation.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 323,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company\'s facility has badge readers at every entrance throughout the building. When badges are scanned, the readers send a message over HTTPS to indicate who attempted to access that particular entrance.',
    answer: 'C. Ingest badge-reader HTTPS events through Amazon API Gateway into Amazon Kinesis Data Streams, process with AWS Lambda, and store analyzed results in Amazon S3 for the security team.',
    answerVariants: [
      'A. Send all badge-reader messages to one EC2 instance over HTTPS and write results to local files for analysis.',
      'B. Route reader messages into Amazon SQS standard queues and run a nightly batch process to aggregate security events.',
      'C. Ingest badge-reader HTTPS events through Amazon API Gateway into Amazon Kinesis Data Streams, process with AWS Lambda, and store analyzed results in Amazon S3 for the security team.',
      'D. Use Amazon SNS topics for each entrance and manually export subscription logs each day for investigation.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 324,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to implement a disaster recovery plan for its primary on-premises file storage volume. The file storage volume is mounted from an Internet Small Computer Systems Interface (iSCSI) device on a local storage server. The file storage volume holds hundreds of terabytes (TB) of data. The company wants to ensure that end users retain immediate access to all file types from the on-premises systems without experiencing latency. Which solution will meet these requirements with the LEAST amount of change to the company\'s existing infrastructure?',
    answer: 'C. Provision an AWS Storage Gateway Volume Gateway cached volume. Set the local cache to 10 TB. Mount the Volume Gateway cached volume to the existing file server by using iSCSI, and copy all files to the storage volume. Configure scheduled snapshots of the storage volume. To recover from a disaster, restore a snapshot to an Amazon Elastic Block Store (Amazon EBS) volume and attach the EBS volume to an Amazon EC2 instance.',
    answerVariants: [
      'A. Replace the iSCSI file server with AWS DataSync and run one-way copy tasks to Amazon S3 on an hourly schedule.',
      'B. Use AWS Transfer Family SFTP endpoints with local NAS exports and store all snapshots in Amazon FSx for Windows File Server.',
      'C. Provision an AWS Storage Gateway Volume Gateway cached volume. Set the local cache to 10 TB. Mount the Volume Gateway cached volume to the existing file server by using iSCSI, and copy all files to the storage volume. Configure scheduled snapshots of the storage volume. To recover from a disaster, restore a snapshot to an Amazon Elastic Block Store (Amazon EBS) volume and attach the EBS volume to an Amazon EC2 instance.',
      'D. Create a new EFS file system in AWS and mount it directly to on-premises servers by using an internet VPN tunnel.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 325,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is hosting a web application from an Amazon S3 bucket. The application uses Amazon Cognito as an identity provider to authenticate users and return a JSON Web Token (JWT) that provides access to protected resources that are stored in another S3 bucket. Upon deployment of the application, users report errors and are unable to access the protected content. A solutions architect must resolve this issue by providing proper permissions so that users can access the protected content. Which solution meets these requirements?',
    answer: 'A. Update the Amazon Cognito identity pool to assume the proper IAM role for access to the protected content.',
    answerVariants: [
      'A. Update the Amazon Cognito identity pool to assume the proper IAM role for access to the protected content.',
      'B. Add public read permissions to the protected S3 bucket and trust the JWT expiration window to limit access.',
      'C. Replace Amazon Cognito with IAM users for each website user and store user access keys in browser local storage.',
      'D. Configure API Gateway authorizers to proxy all protected S3 file downloads through Lambda functions.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 326,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'An image hosting company uploads its large assets to Amazon S3 Standard buckets. The company uses multipart upload in parallel by using S3 APIs and overwrites if the same object is uploaded again. For the first 30 days after upload, the objects will be accessed frequently. The objects will be used less frequently after 30 days, but the access patterns for each object will be inconsistent. The company must optimize its S3 storage costs while maintaining high availability and resiliency of stored assets. Which combination of actions should a solutions architect recommend to meet these requirements? (Choose two.)',
    answer: 'A. Move assets to S3 Intelligent-Tiering after 30 days.',
    answerVariants: [
      'A. Move assets to S3 Intelligent-Tiering after 30 days.',
      'B. Transition all assets directly to S3 Glacier Deep Archive after 30 days for maximum savings.',
      'C. Keep all assets in S3 Standard for 12 months because access patterns are inconsistent after 30 days.',
      'D. Transition all assets to S3 One Zone-IA after 30 days to reduce cost while retaining multi-AZ durability.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 327,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect must secure a VPC network that hosts Amazon EC2 instances. The EC2 instances contain highly sensitive data and run in a private subnet. According to company policy, the EC2 instances that run in the VPC can access only approved third-party software repositories on the internet for software product updates that use the third party\'s URL. Other internet traffic must be blocked. Which solution meets these requirements?',
    answer: 'B. Route outbound traffic through a network firewall or proxy that allows only approved repository domain destinations and blocks all other internet traffic.',
    answerVariants: [
      'A. Attach an internet gateway to the private subnets and use security groups to allow only TCP 443 egress from the EC2 instances.',
      'B. Route outbound traffic through a network firewall or proxy that allows only approved repository domain destinations and blocks all other internet traffic.',
      'C. Use a NAT gateway only. Configure route tables to force all private subnet traffic through the NAT gateway.',
      'D. Create VPC endpoints for all third-party repositories and disable DNS resolution for every unapproved internet domain.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 328,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is hosting a three-tier ecommerce application in the AWS Cloud. The company hosts the website on Amazon S3 and integrates the website with an API that handles sales requests. The company hosts the API on three Amazon EC2 instances behind an Application Load Balancer (ALB). The API consists of static and dynamic front-end content along with backend workers that process sales requests asynchronously. The company is expecting a significant and sudden increase in the number of sales requests during events for the launch of new products. What should a solutions architect recommend to ensure that all the requests are processed successfully?',
    answer: 'B. Add an Amazon CloudFront distribution for the static content. Place the EC2 instances in an Auto Scaling group to launch new instances based on network traffic.',
    answerVariants: [
      'A. Keep static and dynamic content served only from EC2, and increase the EC2 instance size for all API instances.',
      'B. Add an Amazon CloudFront distribution for the static content. Place the EC2 instances in an Auto Scaling group to launch new instances based on network traffic.',
      'C. Move backend workers to one larger EC2 instance and use Route 53 weighted records to spread sales requests.',
      'D. Store all sales requests in Amazon S3 and process them once per hour by using AWS Glue jobs.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 329,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A security audit reveals that Amazon EC2 instances are not being patched regularly. A solutions architect needs to provide a solution that will run regular security scans across a large fleet of EC2 instances. The solution should also patch the EC2 instances on a regular schedule and provide a report of each instance\'s patch status. Which solution will meet these requirements?',
    answer: 'D. Turn on Amazon Inspector in the account. Configure Amazon Inspector to scan the EC2 instances for software vulnerabilities. Set up AWS Systems Manager Patch Manager to patch the EC2 instances on a regular schedule.',
    answerVariants: [
      'A. Enable only AWS Config managed rules to detect missing patches and manually patch instances from EC2 console.',
      'B. Deploy Amazon GuardDuty and use GuardDuty findings as the patch baseline for the EC2 fleet.',
      'C. Use CloudTrail and Athena to detect patch drift, then trigger ad hoc run commands for individual instances.',
      'D. Turn on Amazon Inspector in the account. Configure Amazon Inspector to scan the EC2 instances for software vulnerabilities. Set up AWS Systems Manager Patch Manager to patch the EC2 instances on a regular schedule.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 330,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is planning to store data on Amazon RDS DB instances. The company must encrypt the data at rest. What should a solutions architect do to meet this requirement?',
    answer: 'A. Create a key in AWS Key Management Service (AWS KMS). Enable encryption for the DB instances.',
    answerVariants: [
      'A. Create a key in AWS Key Management Service (AWS KMS). Enable encryption for the DB instances.',
      'B. Enable Amazon RDS automated backups and snapshots to ensure encrypted restore points at rest.',
      'C. Use AWS Secrets Manager to encrypt database credentials and rely on credential rotation for data encryption at rest.',
      'D. Enable SSL for database connections to encrypt all table data at rest in the DB instance.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 331,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company must migrate 20 TB of data from a data center to the AWS Cloud within 30 days. The company\'s network bandwidth is limited to 15 Mbps and cannot exceed 70% utilization. What should a solutions architect do to meet these requirements?',
    answer: 'A. Use AWS Snowball.',
    answerVariants: [
      'A. Use AWS Snowball.',
      'B. Use AWS DataSync over the existing 15 Mbps network link with continuous transfer for 30 days.',
      'C. Use S3 Transfer Acceleration from the data center and split uploads into multipart operations.',
      'D. Use AWS Storage Gateway file gateway and sync all files to S3 through the internet connection.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 332,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company needs to provide its employees with secure access to confidential and sensitive files. The company wants to ensure that the files can be accessed only by authorized users. The files must be downloaded securely to the employees\' devices. The files are stored in an on-premises Windows file server. However, due to an increase in remote usage, the file server is running out of capacity. Which solution will meet these requirements?',
    answer: 'B. Migrate the files to an Amazon FSx for Windows File Server file system. Integrate the Amazon FSx file system with the on-premises Active Directory. Configure AWS Client VPN.',
    answerVariants: [
      'A. Move files to Amazon S3 and use pre-signed URLs for all employees with IAM users for authorization.',
      'B. Migrate the files to an Amazon FSx for Windows File Server file system. Integrate the Amazon FSx file system with the on-premises Active Directory. Configure AWS Client VPN.',
      'C. Use Amazon EFS for file storage and join EFS directly to on-premises Active Directory for SMB access.',
      'D. Keep files on premises and replicate to EC2 instance store volumes in AWS every night for remote access.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 333,
    topicSlug: 'identity-access-and-governance',
    question: 'A company\'s application runs on Amazon EC2 instances behind an Application Load Balancer (ALB). The instances run in an Amazon EC2 Auto Scaling group across multiple Availability Zones. On the first day of every month at midnight, the application becomes much slower when the month-end financial calculation batch runs. This causes the CPU utilization of the EC2 instances to immediately peak to 100%, which disrupts the application. What should a solutions architect recommend to ensure the application is able to handle the workload and avoid downtime?',
    answer: 'C. Configure an EC2 Auto Scaling scheduled scaling policy based on the monthly schedule.',
    answerVariants: [
      'A. Configure an AWS Lambda function to increase ALB listener timeout values on the first day of each month.',
      'B. Increase the Auto Scaling group minimum size permanently to the monthly peak instance count.',
      'C. Configure an EC2 Auto Scaling scheduled scaling policy based on the monthly schedule.',
      'D. Enable AWS Compute Optimizer and apply all recommended instance type changes before every month-end run.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 334,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to give a customer the ability to use on-premises Microsoft Active Directory to download files that are stored in Amazon S3. The customer\'s application uses an SFTP client to download the files. Which solution will meet these requirements with the LEAST operational overhead and no changes to the customer\'s application?',
    answer: 'A. Set up AWS Transfer Family with SFTP for Amazon S3. Configure integrated Active Directory authentication.',
    answerVariants: [
      'A. Set up AWS Transfer Family with SFTP for Amazon S3. Configure integrated Active Directory authentication.',
      'B. Set up Amazon FSx for Windows File Server and expose it over SFTP by running custom EC2 SFTP servers.',
      'C. Use AWS DataSync with on-demand tasks so customers can download files through DataSync task URLs.',
      'D. Use AWS Storage Gateway file gateway and require users to access files over SMB from the on-premises Active Directory.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 335,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is experiencing sudden increases in demand. The company needs to provision large Amazon EC2 instances from an Amazon Machine Image (AMI). The instances will run in an Auto Scaling group. The company needs a solution that provides minimum initialization latency to meet the demand. Which solution meets these requirements?',
    answer: 'B. Enable Amazon Elastic Block Store (Amazon EBS) fast snapshot restore on a snapshot. Provision an AMI by using the snapshot. Replace the AMI in the Auto Scaling group with the new AMI.',
    answerVariants: [
      'A. Increase the Auto Scaling cooldown period so instances have more time to initialize before receiving traffic.',
      'B. Enable Amazon Elastic Block Store (Amazon EBS) fast snapshot restore on a snapshot. Provision an AMI by using the snapshot. Replace the AMI in the Auto Scaling group with the new AMI.',
      'C. Move all boot volumes to magnetic EBS volumes to reduce initialization variance and improve launch predictability.',
      'D. Use a warm pool only and keep AMI creation unchanged so all future launches occur from standard snapshots.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 336,
    topicSlug: 'identity-access-and-governance',
    question: 'A company hosts a multi-tier web application that uses an Amazon Aurora MySQL DB cluster for storage. The application tier is hosted on Amazon EC2 instances. The company\'s IT security guidelines mandate that the database credentials be encrypted and rotated every 14 days. What should a solutions architect do to meet this requirement with the LEAST operational effort?',
    answer: 'A. Create a new AWS Key Management Service (AWS KMS) encryption key. Use AWS Secrets Manager to create a new secret that uses the KMS key with the appropriate credentials. Associate the secret with the Aurora DB cluster. Configure a custom rotation period of 14 days.',
    answerVariants: [
      'A. Create a new AWS Key Management Service (AWS KMS) encryption key. Use AWS Secrets Manager to create a new secret that uses the KMS key with the appropriate credentials. Associate the secret with the Aurora DB cluster. Configure a custom rotation period of 14 days.',
      'B. Store database credentials in AWS Systems Manager Parameter Store and rotate the parameters manually every 14 days.',
      'C. Create IAM database authentication tokens and force all EC2 instances to generate tokens at startup every 14 days.',
      'D. Encrypt the credentials file on each EC2 instance with KMS and rotate the encrypted file by cron every 14 days.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 337,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has deployed a web application on AWS. The company hosts the backend database on Amazon RDS for MySQL with a primary DB instance and five read replicas to support scaling needs. The read replicas must lag no more than 1 second behind the primary DB instance. The database routinely runs scheduled stored procedures. As traffic on the website increases, the replicas experience additional lag during periods of peak load. A solutions architect must reduce the replication lag as much as possible. The solutions architect must minimize changes to the application code and must minimize ongoing operational overhead. Which solution will meet these requirements?',
    answer: 'A. Migrate the database to Amazon Aurora MySQL. Replace the read replicas with Aurora Replicas, and configure Aurora Auto Scaling. Replace the stored procedures with Aurora MySQL native functions.',
    answerVariants: [
      'A. Migrate the database to Amazon Aurora MySQL. Replace the read replicas with Aurora Replicas, and configure Aurora Auto Scaling. Replace the stored procedures with Aurora MySQL native functions.',
      'B. Keep Amazon RDS for MySQL and increase the number of read replicas from five to ten manually.',
      'C. Use Amazon ElastiCache in front of all read replicas and keep all analytical and stored procedure workloads unchanged.',
      'D. Move all report and read workloads to one larger EC2 MySQL instance and retain the existing primary RDS instance.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 338,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect must create a disaster recovery (DR) plan for a high-volume software as a service (SaaS) platform. All data for the platform is stored in an Amazon Aurora MySQL DB cluster. The DR plan must replicate data to a secondary AWS Region. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'D. Set up an Aurora global database for the DB cluster. Specify a minimum of one DB instance in the secondary Region.',
    answerVariants: [
      'A. Enable cross-Region snapshot copy for the Aurora DB cluster and restore snapshots in the secondary Region during disasters.',
      'B. Use AWS Database Migration Service to continuously replicate Aurora data to an Amazon RDS for MySQL DB instance in the DR Region.',
      'C. Export Aurora binlogs to Amazon S3 and replay logs manually to rebuild the database in the secondary Region.',
      'D. Set up an Aurora global database for the DB cluster. Specify a minimum of one DB instance in the secondary Region.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 339,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company has a custom application with embedded credentials that retrieves information from an Amazon RDS MySQL DB instance. Management says the application must be made more secure with the least amount of programming effort. What should a solutions architect do to meet these requirements?',
    answer: 'C. Create credentials on the RDS for MySQL database for the application user and store the credentials in AWS Secrets Manager. Configure the application to load the database credentials from Secrets Manager. Set up a credentials rotation schedule for the application user in the RDS for MySQL database using Secrets Manager.',
    answerVariants: [
      'A. Keep embedded credentials in the application and encrypt the application source code repository with KMS.',
      'B. Move the credentials to environment variables on each EC2 instance and rotate values manually every month.',
      'C. Create credentials on the RDS for MySQL database for the application user and store the credentials in AWS Secrets Manager. Configure the application to load the database credentials from Secrets Manager. Set up a credentials rotation schedule for the application user in the RDS for MySQL database using Secrets Manager.',
      'D. Store the credentials in an encrypted Amazon S3 object and download the object during each application startup.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 340,
    topicSlug: 'identity-access-and-governance',
    question: 'A media company hosts its website on AWS. The website application\'s architecture includes a fleet of Amazon EC2 instances behind an Application Load Balancer (ALB) and a database that is hosted on Amazon Aurora. The company\'s cybersecurity team reports that the application is vulnerable to SQL injection. How should the company resolve this issue?',
    answer: 'A. Use AWS WAF in front of the ALB. Associate the appropriate web ACLs with AWS WAF.',
    answerVariants: [
      'A. Use AWS WAF in front of the ALB. Associate the appropriate web ACLs with AWS WAF.',
      'B. Use AWS Shield Advanced only and rely on Shield signatures to block SQL injection attacks.',
      'C. Put a Network ACL deny list on database subnets to block SQL keywords from application traffic.',
      'D. Increase Aurora parameter group logging settings so the database rejects all suspicious SQL statements automatically.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 341,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has an Amazon S3 data lake that is governed by AWS Lake Formation. The company wants to create a visualization in Amazon QuickSight by joining the data in the data lake with operational data that is stored in an Amazon Aurora MySQL database. The company wants to enforce column-level authorization so that the company\'s marketing team can access only a subset of columns in the database. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use Lake Formation and AWS Glue Data Catalog federation for Aurora MySQL. Enforce column-level permissions in Lake Formation and query from QuickSight through Athena.',
    answerVariants: [
      'A. Export Aurora MySQL tables to S3 daily, join with data lake tables in QuickSight SPICE, and enforce access only through IAM policies.',
      'B. Use Lake Formation and AWS Glue Data Catalog federation for Aurora MySQL. Enforce column-level permissions in Lake Formation and query from QuickSight through Athena.',
      'C. Build a custom API service in front of Aurora and S3. Apply column filtering logic in the API before QuickSight reads the data.',
      'D. Replicate all Aurora tables into Amazon Redshift and use Redshift role-based access only for column-level restrictions.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 342,
    topicSlug: 'identity-access-and-governance',
    question: 'A transaction processing company has weekly scripted batch jobs that run on Amazon EC2 instances. The EC2 instances are in an Auto Scaling group. The number of transactions can vary, but the baseline CPU utilization that is noted on each run is at least 60%. The company needs to provision the capacity 30 minutes before the jobs run. Currently, engineers complete this task by manually modifying the Auto Scaling group parameters. The company does not have the resources to analyze the required capacity trends for the Auto Scaling group counts. The company needs an automated way to modify the Auto Scaling group\'s desired capacity. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Create a predictive scaling policy for the Auto Scaling group. Configure the policy to scale based on forecast. Set the scaling metric to CPU utilization. Set the target value for the metric to 60%. In the policy, set the instances to pre-launch 30 minutes before the jobs run.',
    answerVariants: [
      'A. Keep manual scaling before each run and create CloudWatch alarms to notify engineers when CPU exceeds 60% during jobs.',
      'B. Use only target tracking scaling on average CPU and remove all pre-launch requirements for the weekly jobs.',
      'C. Create a predictive scaling policy for the Auto Scaling group. Configure the policy to scale based on forecast. Set the scaling metric to CPU utilization. Set the target value for the metric to 60%. In the policy, set the instances to pre-launch 30 minutes before the jobs run.',
      'D. Use scheduled scaling actions and manually adjust desired capacity each week based on the previous week\'s job logs.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 343,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect is designing a company\'s disaster recovery (DR) architecture. The company has a MySQL database that runs on an Amazon EC2 instance in a private subnet with scheduled backup. The DR design needs to include multiple AWS Regions. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Migrate the MySQL database to an Amazon Aurora global database. Host the primary DB cluster in the primary Region. Host the secondary DB cluster in the DR Region.',
    answerVariants: [
      'A. Keep MySQL on EC2 and replicate nightly EBS snapshots to the DR Region for rapid restore.',
      'B. Migrate to Amazon RDS for MySQL Multi-AZ in one Region and rely on backups for cross-Region disaster recovery.',
      'C. Migrate the MySQL database to an Amazon Aurora global database. Host the primary DB cluster in the primary Region. Host the secondary DB cluster in the DR Region.',
      'D. Use AWS Database Migration Service to copy MySQL changes to Amazon S3 and reload into MySQL in DR when needed.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 344,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has a Java application that uses Amazon Simple Queue Service (Amazon SQS) to parse messages. The application cannot parse messages that are larger than 256 KB in size. The company wants to implement a solution to give the application the ability to parse messages as large as 50 MB. Which solution will meet these requirements with the FEWEST changes to the code?',
    answer: 'A. Use the Amazon SQS Extended Client Library for Java to host messages that are larger than 256 KB in Amazon S3.',
    answerVariants: [
      'A. Use the Amazon SQS Extended Client Library for Java to host messages that are larger than 256 KB in Amazon S3.',
      'B. Increase the maximum message size setting for the SQS queue from 256 KB to 50 MB.',
      'C. Replace SQS with Amazon SNS standard topics and publish up to 50 MB payloads directly in each message.',
      'D. Store all large payloads in DynamoDB and keep only message IDs in SQS standard queues.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 345,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to restrict access to the content of one of its main web applications and to protect the content by using authorization techniques available on AWS. The company wants to implement a serverless architecture and an authentication solution for fewer than 100 users. The solution needs to integrate with the main web application and serve web content globally. The solution must also scale as the company\'s user base grows while providing the lowest login latency possible. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'A. Use Amazon Cognito for authentication. Use Lambda@Edge for authorization. Use Amazon CloudFront to serve the web application globally.',
    answerVariants: [
      'A. Use Amazon Cognito for authentication. Use Lambda@Edge for authorization. Use Amazon CloudFront to serve the web application globally.',
      'B. Use IAM users for all application users and deploy a single Region Application Load Balancer for global traffic.',
      'C. Use API Gateway authorizers only and host static web content in one Region without an edge distribution.',
      'D. Use AWS Directory Service with EC2-based web proxies in each Region for user login and authorization.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 346,
    topicSlug: 'storage-performance-patterns',
    question: 'A company has an aging network-attached storage (NAS) array in its data center. The NAS array presents SMB shares and NFS shares to client workstations. The company does not want to purchase a new NAS array. The company also does not want to incur the cost of renewing the NAS array\'s support contract. Some of the data is accessed frequently, but much of the data is inactive.',
    answer: 'B. Use AWS Storage Gateway file gateway with SMB and NFS shares backed by Amazon S3, and apply S3 Lifecycle policies for inactive data.',
    answerVariants: [
      'A. Keep the existing NAS and copy only archived files to S3 Glacier Flexible Retrieval once per quarter.',
      'B. Use AWS Storage Gateway file gateway with SMB and NFS shares backed by Amazon S3, and apply S3 Lifecycle policies for inactive data.',
      'C. Replace all shares with Amazon EFS and mount EFS directly to all workstations by using SMB clients.',
      'D. Use AWS DataSync one time to migrate all files to S3 and require users to access files through the AWS Management Console.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 347,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company has an application that is running on Amazon EC2 instances. A solutions architect has standardized the company on a particular instance family and various instance sizes based on the current needs of the company. The company wants to maximize cost savings for the application over the next 3 years. The company needs to be able to change the instance family and sizes in the next 6 months based on application popularity and usage. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'A. Compute Savings Plan',
    answerVariants: [
      'A. Compute Savings Plan.',
      'B. Standard Reserved Instances for one specific instance family and size over 3 years.',
      'C. EC2 Spot Instances only, with interruption handling for all production requests.',
      'D. Dedicated Hosts without reservation commitment for the entire application workload.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 348,
    topicSlug: 'database-performance-and-caching',
    question: 'A company collects data from a large number of participants who use wearable devices. The company stores the data in an Amazon DynamoDB table and uses applications to analyze the data. The data workload is constant and predictable. The company wants to stay at or below its forecasted budget for DynamoDB. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Use provisioned mode. Specify the read capacity units (RCUs) and write capacity units (WCUs).',
    answerVariants: [
      'A. Use on-demand mode for all reads and writes because it always gives the lowest cost for steady workloads.',
      'B. Use provisioned mode. Specify the read capacity units (RCUs) and write capacity units (WCUs).',
      'C. Use provisioned mode with zero RCUs and WCUs and rely on burst capacity for all traffic.',
      'D. Use DynamoDB Accelerator only and remove all base table capacity settings from the account.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 349,
    topicSlug: 'identity-access-and-governance',
    question: 'A company stores confidential data in an Amazon Aurora PostgreSQL database in the ap-southeast-3 Region. The database is encrypted with an AWS Key Management Service (AWS KMS) customer managed key. The company was recently acquired and must securely share a backup of the database with the acquiring company\'s AWS account in ap-southeast-3. What should a solutions architect do to meet these requirements?',
    answer: 'B. Create a database snapshot. Add the acquiring company\'s AWS account to the KMS key policy. Share the snapshot with the acquiring company\'s AWS account.',
    answerVariants: [
      'A. Export the Aurora PostgreSQL data to unencrypted CSV files in S3 and share the S3 bucket with the acquiring account.',
      'B. Create a database snapshot. Add the acquiring company\'s AWS account to the KMS key policy. Share the snapshot with the acquiring company\'s AWS account.',
      'C. Create a read replica in the acquiring company account directly from the source database and disable encryption for data transfer.',
      'D. Copy the snapshot to another Region and then share the copied snapshot without changing any KMS key policies.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 350,
    topicSlug: 'database-performance-and-caching',
    question: 'A company uses a 100 GB Amazon RDS for Microsoft SQL Server Single-AZ DB instance in the us-east-1 Region to store customer transactions. The company needs high availability and automatic recovery for the DB instance. The company must also run reports on the RDS database several times a year. The report process causes transactions to take longer than usual to post to the customers\' accounts. The company needs a solution that will improve the performance of the report process. Which combination of steps will meet these requirements? (Choose two.)',
    answer: 'A. Modify the DB instance from a Single-AZ DB instance to a Multi-AZ deployment.',
    answerVariants: [
      'A. Modify the DB instance from a Single-AZ DB instance to a Multi-AZ deployment.',
      'B. Keep the Single-AZ DB instance and increase storage from 100 GB to 500 GB for higher availability and report isolation.',
      'C. Move reports to the primary DB instance during off-hours only and disable all backups while reports run.',
      'D. Replace RDS SQL Server with Amazon DynamoDB to separate reporting and transactional workloads without failover complexity.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 351,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is moving its data management application to AWS. The company wants to transition to an event-driven architecture. The architecture needs to be more distributed and to use serverless concepts while performing the different aspects of the workflow. The company also wants to minimize operational overhead. Which solution will meet these requirements?',
    answer: 'D. Build out the workflow in AWS Step Functions. Use Step Functions to create a state machine. Use the state machine to invoke AWS Lambda functions to process the workflow steps.',
    answerVariants: [
      'A. Use one large AWS Lambda function that performs every workflow step sequentially inside a single invocation.',
      'B. Use Amazon SQS queues only and let each queue consumer decide which next step should run based on message attributes.',
      'C. Use EC2 cron jobs to orchestrate multiple Lambda functions and persist workflow states in local disk files.',
      'D. Build out the workflow in AWS Step Functions. Use Step Functions to create a state machine. Use the state machine to invoke AWS Lambda functions to process the workflow steps.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 352,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is designing the network for an online multi-player game. The game uses the UDP networking protocol and will be deployed in eight AWS Regions. The network architecture needs to minimize latency and packet loss to give end users a high-quality gaming experience. Which solution will meet these requirements?',
    answer: 'B. Set up AWS Global Accelerator with UDP listeners and endpoint groups in each Region.',
    answerVariants: [
      'A. Use Amazon Route 53 latency routing with UDP records and direct clients to regional EC2 public IP addresses.',
      'B. Set up AWS Global Accelerator with UDP listeners and endpoint groups in each Region.',
      'C. Use an Application Load Balancer in each Region and terminate all UDP traffic on the ALB listener ports.',
      'D. Use Amazon CloudFront for UDP traffic and configure edge behavior policies for packet-loss mitigation.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 353,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts a three-tier web application on Amazon EC2 instances in a single Availability Zone. The web application uses a self-managed MySQL database that is hosted on an EC2 instance to store data in an Amazon Elastic Block Store (Amazon EBS) volume. The MySQL database currently uses a 1 TB Provisioned IOPS SSD (io2) EBS volume. The company expects traffic of 1,000 IOPS for both reads and writes at peak traffic. The company wants to minimize any disruptions, stabilize performance, and reduce costs while retaining the capacity for double the IOPS. The company wants to move the database tier to a fully managed solution that is highly available and fault tolerant. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Use a Multi-AZ deployment of an Amazon RDS for MySQL DB instance with a General Purpose SSD (gp2) EBS volume.',
    answerVariants: [
      'A. Move to Amazon RDS for MySQL Single-AZ with io2 storage and double the baseline provisioned IOPS to 4,000.',
      'B. Use a Multi-AZ deployment of an Amazon RDS for MySQL DB instance with a General Purpose SSD (gp2) EBS volume.',
      'C. Keep self-managed MySQL on EC2 and reduce volume size from 1 TB io2 to 500 GB gp3 to cut storage cost.',
      'D. Migrate to Amazon Aurora Serverless and disable high availability to reduce monthly cost at peak traffic.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 354,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts a serverless application on AWS. The application uses Amazon API Gateway, AWS Lambda, and an Amazon RDS for PostgreSQL database. The company notices an increase in application errors that result from database connection timeouts during times of peak traffic or unpredictable traffic. The company needs a solution that reduces the application failures with the least amount of change to the code. What should a solutions architect do to meet these requirements?',
    answer: 'B. Enable RDS Proxy on the RDS DB instance.',
    answerVariants: [
      'A. Increase Lambda timeout and memory settings so each function can keep more direct database connections open.',
      'B. Enable RDS Proxy on the RDS DB instance.',
      'C. Replace API Gateway with an Application Load Balancer so Lambda invocations are less bursty.',
      'D. Migrate PostgreSQL to DynamoDB to remove relational connection limits during peak traffic.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 355,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is migrating an old application to AWS. The application runs a batch job every hour and is CPU intensive. The batch job takes 15 minutes on average with an on-premises server. The server has 64 virtual CPU (vCPU) and 512 GiB of memory. Which solution will run the batch job within 15 minutes with the LEAST operational overhead?',
    answer: 'D. Use AWS Batch on Amazon EC2.',
    answerVariants: [
      'A. Run the batch task in AWS Lambda with 10 GB ephemeral storage and invoke it hourly with EventBridge.',
      'B. Run the workload on Amazon ECS Fargate tasks with fixed size resources and one always-on task per hour.',
      'C. Use an EC2 instance in an Auto Scaling group and run cron every hour on a persistent host.',
      'D. Use AWS Batch on Amazon EC2.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 356,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company stores its data objects in Amazon S3 Standard storage. A solutions architect has found that 75% of the data is rarely accessed after 30 days. The company needs all the data to remain immediately accessible with the same high availability and resiliency, but the company wants to minimize storage costs. Which storage solution will meet these requirements?',
    answer: 'B. Move the data objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 30 days.',
    answerVariants: [
      'A. Move all objects to S3 Glacier Instant Retrieval after 30 days to preserve immediate retrieval and lower cost.',
      'B. Move the data objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 30 days.',
      'C. Move all objects to S3 One Zone-IA after 30 days because resiliency remains equivalent to S3 Standard.',
      'D. Keep all objects in S3 Standard and use S3 Storage Lens to optimize costs without changing storage classes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 357,
    topicSlug: 'edge-and-global-routing',
    question: 'A gaming company is moving its public scoreboard from a data center to the AWS Cloud. The company uses Amazon EC2 Windows Server instances behind an Application Load Balancer to host its dynamic application. The company needs a highly available storage solution for the application. The application consists of static files and dynamic server-side code. Which combination of steps should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'A. Store the static files on Amazon S3. Use Amazon CloudFront to cache objects at the edge.',
    answerVariants: [
      'A. Store the static files on Amazon S3. Use Amazon CloudFront to cache objects at the edge.',
      'B. Keep static files on each EC2 Windows instance local disk and synchronize file changes between instances hourly.',
      'C. Store all static assets in Amazon RDS and load assets through SQL queries from web servers.',
      'D. Replace dynamic application servers with static website hosting only in Amazon S3.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 358,
    topicSlug: 'edge-and-global-routing',
    question: 'A social media company runs its application on Amazon EC2 instances behind an Application Load Balancer (ALB). The ALB is the origin for an Amazon CloudFront distribution. The application has more than a billion images stored in an Amazon S3 bucket and processes thousands of images each second. The company wants to resize the images dynamically and serve appropriate formats to clients. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Use a Lambda@Edge function with an external image management library. Associate the Lambda@Edge function with the CloudFront behaviors that serve the images.',
    answerVariants: [
      'A. Resize images in EC2 instances behind the ALB before storing all image variants permanently in Amazon EBS volumes.',
      'B. Use S3 object metadata rules to request automatic image resizing and format conversion at object retrieval time.',
      'C. Use a Lambda@Edge function with an external image management library. Associate the Lambda@Edge function with the CloudFront behaviors that serve the images.',
      'D. Replace CloudFront with API Gateway and use Lambda proxy integrations for every image request globally.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 359,
    topicSlug: 'data-protection-and-key-management',
    question: 'A hospital needs to store patient records in an Amazon S3 bucket. The hospital\'s compliance team must ensure that all protected health information (PHI) is encrypted in transit and at rest. The compliance team must administer the encryption key for data at rest. Which solution will meet these requirements?',
    answer: 'C. Use the aws:SecureTransport condition on S3 bucket policies to allow only encrypted connections over HTTPS (TLS). Configure default encryption for each S3 bucket to use server-side encryption with AWS KMS keys (SSE-KMS). Assign the compliance team to manage the KMS keys.',
    answerVariants: [
      'A. Use SSE-S3 for encryption at rest and allow HTTP and HTTPS access while restricting IAM users by source IP ranges.',
      'B. Use client-side encryption only and share client encryption keys with the compliance team in a secured spreadsheet.',
      'C. Use the aws:SecureTransport condition on S3 bucket policies to allow only encrypted connections over HTTPS (TLS). Configure default encryption for each S3 bucket to use server-side encryption with AWS KMS keys (SSE-KMS). Assign the compliance team to manage the KMS keys.',
      'D. Use S3 Glacier Deep Archive for all patient records and rely on Glacier vault lock to satisfy transport and key management requirements.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 360,
    topicSlug: 'exam-preparation',
    question: 'A company uses Amazon API Gateway to run a private gateway with two REST APIs in the same VPC. The BuyStock RESTful web service calls the CheckFunds RESTful web service to ensure that enough funds are available before a stock can be purchased. The company has noticed in the VPC flow logs that the BuyStock RESTful web service calls the CheckFunds RESTful web service over the internet instead of through the VPC. A solutions architect must implement a solution so that the APIs communicate through the VPC. Which solution will meet these requirements with the FEWEST changes to the code?',
    answer: 'B. Use an interface endpoint.',
    answerVariants: [
      'A. Expose both private APIs publicly through edge-optimized endpoints and restrict access with API keys.',
      'B. Use an interface endpoint.',
      'C. Configure a NAT gateway in the VPC so private API-to-API calls traverse the internet through managed egress.',
      'D. Use a gateway VPC endpoint for API Gateway private APIs and route calls through private route table entries.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 361,
    topicSlug: 'edge-and-global-routing',
    question: 'A company hosts a multiplayer gaming application on AWS. The company wants the application to read data with sub-millisecond latency and run one-time queries on historical data. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Use Amazon DynamoDB with DynamoDB Accelerator (DAX) for data that is frequently accessed. Export the data to an Amazon S3 bucket by using DynamoDB table export. Run one-time queries on the data in Amazon S3 by using Amazon Athena.',
    answerVariants: [
      'A. Use Amazon RDS for MySQL with read replicas for the game data and run one-time historical queries on the primary database.',
      'B. Use Amazon ElastiCache Redis only for all game data and run one-time queries directly against the Redis keyspace.',
      'C. Use Amazon DynamoDB with DynamoDB Accelerator (DAX) for data that is frequently accessed. Export the data to an Amazon S3 bucket by using DynamoDB table export. Run one-time queries on the data in Amazon S3 by using Amazon Athena.',
      'D. Use Amazon Aurora Serverless and cache all data in Amazon CloudFront to achieve sub-millisecond latency globally.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 362,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company uses a payment processing system that requires messages for a particular payment ID to be received in the same order that they were sent. Otherwise, the payments might be processed incorrectly. Which actions should a solutions architect take to meet this requirement? (Choose two.)',
    answer: 'B. Write the messages to an Amazon Kinesis data stream with the payment ID as the partition key.',
    answerVariants: [
      'A. Write all payment messages to an Amazon SQS standard queue and scale consumers horizontally for maximum throughput.',
      'B. Write the messages to an Amazon Kinesis data stream with the payment ID as the partition key.',
      'C. Publish all payment messages to an Amazon SNS standard topic and process them concurrently in Lambda subscribers.',
      'D. Use EventBridge bus archives and replay to guarantee in-order delivery by payment ID.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 363,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is building a game system that needs to send unique events to separate leaderboard, matchmaking, and authentication services concurrently. The company needs an AWS event-driven system that guarantees the order of the events. Which solution will meet these requirements?',
    answer: 'B. Amazon Simple Notification Service (Amazon SNS) FIFO topics',
    answerVariants: [
      'A. Amazon EventBridge event bus with multiple rules and targets for each downstream service.',
      'B. Amazon Simple Notification Service (Amazon SNS) FIFO topics.',
      'C. Amazon SQS standard queue with three independent consumers for leaderboard, matchmaking, and authentication.',
      'D. AWS Step Functions with one sequential state machine invocation per game event.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 364,
    topicSlug: 'event-driven-and-messaging',
    question: 'A hospital is designing a new application that gathers symptoms from patients. The hospital has decided to use Amazon Simple Queue Service (Amazon SQS) and Amazon Simple Notification Service (Amazon SNS) in the architecture.',
    answer: 'B. Enable server-side encryption with AWS KMS for Amazon SQS and Amazon SNS. Enforce TLS and least-privilege IAM policies for producers and consumers.',
    answerVariants: [
      'A. Use Amazon SQS and SNS without encryption and rely on VPC isolation only to protect patient symptom data.',
      'B. Enable server-side encryption with AWS KMS for Amazon SQS and Amazon SNS. Enforce TLS and least-privilege IAM policies for producers and consumers.',
      'C. Store all symptom data in Amazon S3 and trigger SNS notifications from scheduled Athena queries every hour.',
      'D. Use Amazon MQ brokers in public subnets and secure access with shared username and password credentials.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 365,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a web application that is backed by Amazon RDS. A new database administrator caused data loss by accidentally editing information in a database table. To help recover from this type of incident, the company wants the ability to restore the database to its state from 5 minutes before any change within the last 30 days. Which feature should the solutions architect include in the design to meet this requirement?',
    answer: 'C. Automated backups',
    answerVariants: [
      'A. Manual DB snapshots before every deployment and restore from the most recent snapshot if accidental updates occur.',
      'B. Read replicas with delayed replication to roll back accidental write operations up to 30 days.',
      'C. Automated backups.',
      'D. Export DB transaction logs to S3 and replay logs manually into a new database for every incident.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 366,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'Answer not provided in source file.',
  },
  {
    questionNumber: 367,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is using Amazon Route 53 latency-based routing to route requests to its UDP-based application for users around the world. The application is hosted on redundant servers in the company\'s on-premises data centers in the United States, Asia, and Europe. The company\'s compliance requirements state that the application must be hosted on premises. The company wants to improve the performance and availability of the application. What should a solutions architect do to meet these requirements?',
    answer: 'A. Configure three Network Load Balancers (NLBs) in the three AWS Regions to address the on-premises endpoints. Create an accelerator by using AWS Global Accelerator, and register the NLBs as its endpoints. Provide access to the application by using a CNAME that points to the accelerator DNS.',
    answerVariants: [
      'A. Configure three Network Load Balancers (NLBs) in the three AWS Regions to address the on-premises endpoints. Create an accelerator by using AWS Global Accelerator, and register the NLBs as its endpoints. Provide access to the application by using a CNAME that points to the accelerator DNS.',
      'B. Keep Route 53 latency routing and increase DNS TTL values so clients stay pinned to regional on-premises endpoints longer.',
      'C. Replace on-premises servers with EC2 instances in the same Regions and route UDP traffic through Application Load Balancers.',
      'D. Use CloudFront as the global entry point for UDP traffic and connect CloudFront origins to each on-premises data center.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 368,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect wants all new users to have specific complexity requirements and mandatory rotation periods for IAM user passwords. What should the solutions architect do to accomplish this?',
    answer: 'A. Set an overall password policy for the entire AWS account.',
    answerVariants: [
      'A. Set an overall password policy for the entire AWS account.',
      'B. Create separate IAM password policies for each IAM group and enforce complexity at group level only.',
      'C. Enable AWS Organizations SCPs that deny logins if IAM user passwords are older than the required rotation period.',
      'D. Configure AWS Config managed rules to generate alerts when user passwords do not meet complexity requirements.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 369,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has migrated an application to Amazon EC2 Linux instances. One of these EC2 instances runs several 1-hour tasks on a schedule. These tasks were written by different teams and have no common programming language. The company is concerned about performance and scalability while these tasks run on a single instance. A solutions architect needs to implement a solution to resolve these concerns. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use AWS Batch to run the tasks as jobs. Schedule the jobs by using Amazon EventBridge (Amazon CloudWatch Events).',
    answerVariants: [
      'A. Use AWS Batch to run the tasks as jobs. Schedule the jobs by using Amazon EventBridge (Amazon CloudWatch Events).',
      'B. Keep all tasks on one EC2 instance and increase the instance size to handle periodic CPU spikes.',
      'C. Package each task into separate Lambda functions and invoke all functions in parallel every hour from one script.',
      'D. Use Amazon ECS with one always-running container for each task and trigger them by SSH commands hourly.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 370,
    topicSlug: 'network-performance-and-hybrid',
    question: 'A company runs a public three-tier web application in a VPC. The application runs on Amazon EC2 instances across multiple Availability Zones. The EC2 instances that run in private subnets need to communicate with a license server over the internet. The company needs a managed solution that minimizes operational maintenance. Which solution meets these requirements?',
    answer: 'C. Provision a NAT gateway in a public subnet. Modify each private subnet\'s route table with a default route that points to the NAT gateway.',
    answerVariants: [
      'A. Attach an internet gateway directly to each private subnet and create explicit routes to the internet for license-server traffic.',
      'B. Deploy NAT instances in each private subnet and manage scaling and patching for all NAT hosts manually.',
      'C. Provision a NAT gateway in a public subnet. Modify each private subnet\'s route table with a default route that points to the NAT gateway.',
      'D. Create a gateway VPC endpoint for the external license server so private instances can access the internet through private routing.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 371,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company needs to create an Amazon Elastic Kubernetes Service (Amazon EKS) cluster to host a digital media streaming application. The EKS cluster will use a managed node group that is backed by Amazon Elastic Block Store (Amazon EBS) volumes for storage. The company must encrypt all data at rest by using a customer managed key that is stored in AWS Key Management Service (AWS KMS). Which combination of actions will meet this requirement with the LEAST operational overhead? (Choose two.)',
    answer: 'C. Enable EBS encryption by default in the AWS Region where the EKS cluster will be created. Select the customer managed key as the default key.',
    answerVariants: [
      'A. Disable EBS encryption by default and encrypt only pods that store media files by using application-level encryption.',
      'B. Use AWS-managed default keys for EBS encryption and rotate those keys manually every 30 days for compliance.',
      'C. Enable EBS encryption by default in the AWS Region where the EKS cluster will be created. Select the customer managed key as the default key.',
      'D. Use unencrypted EBS volumes in EKS and rely on encrypted EKS network traffic for data-at-rest compliance.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 372,
    topicSlug: 'identity-access-and-governance',
    question: 'A company wants to migrate an Oracle database to AWS. The database consists of a single table that contains millions of geographic information systems (GIS) images that are high resolution and are identified by a geographic code. When a natural disaster occurs, tens of thousands of images get updated every few minutes. Each geographic code has a single image or row that is associated with it. The company wants a solution that is highly available and scalable during such events. Which solution meets these requirements MOST cost-effectively?',
    answer: 'D. Store the images in Amazon S3 buckets. Store geographic codes and image S3 URLs in a database table. Use Oracle running on an Amazon RDS Multi-AZ DB instance.',
    answerVariants: [
      'A. Store all GIS images as BLOBs in one Oracle database on EC2 and scale vertically during disaster events.',
      'B. Store all images in Amazon EFS and keep geographic codes in an Oracle table in a Single-AZ RDS DB instance.',
      'C. Store images in DynamoDB binary attributes and keep metadata in a separate Oracle table on premises.',
      'D. Store the images in Amazon S3 buckets. Store geographic codes and image S3 URLs in a database table. Use Oracle running on an Amazon RDS Multi-AZ DB instance.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 373,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an application that collects data from IoT sensors on automobiles. The data is streamed and stored in Amazon S3 through Amazon Kinesis Data Firehose. The data produces trillions of S3 objects each year. Each morning, the company uses the data from the previous 30 days to retrain a suite of machine learning (ML) models. Four times each year, the company uses the data from the previous 12 months to perform analysis and train other ML models. The data must be available with minimal delay for up to 1 year. After 1 year, the data must be retained for archival purposes. Which storage solution meets these requirements MOST cost-effectively?',
    answer: 'D. Use the S3 Standard storage class. Create an S3 Lifecycle policy to transition objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 30 days, and then to S3 Glacier Deep Archive after 1 year.',
    answerVariants: [
      'A. Store all data in S3 Glacier Deep Archive immediately to reduce storage costs for long-term retention requirements.',
      'B. Store all data in S3 Intelligent-Tiering and keep it there indefinitely with no lifecycle transitions.',
      'C. Store all data in S3 Standard-IA from day 1 and transition to S3 One Zone-IA after 1 year.',
      'D. Use the S3 Standard storage class. Create an S3 Lifecycle policy to transition objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 30 days, and then to S3 Glacier Deep Archive after 1 year.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 374,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is running several business applications in three separate VPCs within the us-east-1 Region. The applications must be able to communicate between VPCs. The applications also must be able to consistently send hundreds of gigabytes of data each day to a latency-sensitive application that runs in a single on-premises data center.',
    answer: 'B. Use AWS Transit Gateway to connect all VPCs and a Direct Connect gateway to connect the on-premises data center to the Transit Gateway.',
    answerVariants: [
      'A. Create full-mesh VPC peering between all VPCs and connect on premises through a single Site-to-Site VPN tunnel.',
      'B. Use AWS Transit Gateway to connect all VPCs and a Direct Connect gateway to connect the on-premises data center to the Transit Gateway.',
      'C. Use individual virtual private gateways per VPC and separate Direct Connect connections from each VPC to on premises.',
      'D. Route all inter-VPC and on-premises traffic through one centralized NAT gateway in a shared services VPC.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 375,
    topicSlug: 'compute-selection-and-scaling',
    question: 'An ecommerce company is building a distributed application that involves several serverless functions and AWS services to complete order-processing tasks. These tasks require manual approvals as part of the workflow. A solutions architect needs to design an architecture for the order-processing application. The solution must be able to combine multiple AWS Lambda functions into responsive serverless applications. The solution also must orchestrate data and services that run on Amazon EC2 instances, containers, or on-premises servers. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use AWS Step Functions to build the application.',
    answerVariants: [
      'A. Use AWS Step Functions to build the application.',
      'B. Use one Amazon SQS queue and custom worker logic to orchestrate every order-processing step and manual approval.',
      'C. Use API Gateway WebSocket callbacks and Lambda state storage in DynamoDB for all workflow transitions.',
      'D. Use AWS Batch jobs for all order-processing steps and trigger approvals through EC2-hosted scripts.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 376,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has launched an Amazon RDS for MySQL DB instance. Most of the connections to the database come from serverless applications. Application traffic to the database changes significantly at random intervals. At times of high demand, users report that their applications experience database connection rejection errors. Which solution will resolve this issue with the LEAST operational overhead?',
    answer: 'A. Create a proxy in RDS Proxy. Configure the users\' applications to use the DB instance through RDS Proxy.',
    answerVariants: [
      'A. Create a proxy in RDS Proxy. Configure the users\' applications to use the DB instance through RDS Proxy.',
      'B. Increase max_connections and allocate a larger RDS instance class to support every serverless connection directly.',
      'C. Add more read replicas and route write traffic through each replica to spread connection load.',
      'D. Move all serverless applications behind an Application Load Balancer so connection bursts are reduced.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 377,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company recently deployed a new auditing system to centralize information about operating system versions, patching, and installed software for Amazon EC2 instances. A solutions architect must ensure all instances provisioned through EC2 Auto Scaling groups successfully send reports to the auditing system as soon as they are launched and terminated. Which solution achieves these goals MOST efficiently?',
    answer: 'B. Use EC2 Auto Scaling lifecycle hooks to run a custom script to send data to the audit system when instances are launched and terminated.',
    answerVariants: [
      'A. Poll the Auto Scaling group every minute by using Lambda and send updates to the auditing system when instance count changes.',
      'B. Use EC2 Auto Scaling lifecycle hooks to run a custom script to send data to the audit system when instances are launched and terminated.',
      'C. Use CloudTrail event history only and manually export launch and terminate events weekly for the auditing system.',
      'D. Configure a cron task on each instance to send audit information every hour after boot.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 378,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is developing a real-time multiplayer game that uses UDP for communications between the client and servers in an Auto Scaling group. Spikes in demand are anticipated during the day, so the game server platform must adapt accordingly. Developers want to store gamer scores and other non-relational data in a database solution that will scale without intervention. Which solution should a solutions architect recommend?',
    answer: 'B. Use a Network Load Balancer for traffic distribution and Amazon DynamoDB on-demand for data storage.',
    answerVariants: [
      'A. Use an Application Load Balancer for UDP traffic and Amazon RDS for MySQL with Auto Scaling storage for gamer scores.',
      'B. Use a Network Load Balancer for traffic distribution and Amazon DynamoDB on-demand for data storage.',
      'C. Use AWS Global Accelerator only and store gamer scores in Amazon ElastiCache with snapshots for durability.',
      'D. Use Amazon API Gateway WebSocket endpoints and Amazon S3 object storage for all score updates.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 379,
    topicSlug: 'edge-and-global-routing',
    question: 'A company hosts a frontend application that uses an Amazon API Gateway API backend that is integrated with AWS Lambda. When the API receives requests, the Lambda function loads many libraries. Then the Lambda function connects to an Amazon RDS database, processes the data, and returns the data to the frontend application. The company wants to ensure that response latency is as low as possible for all its users with the fewest number of changes to the company\'s operations. Which solution will meet these requirements?',
    answer: 'B. Configure provisioned concurrency for the Lambda function that handles the requests.',
    answerVariants: [
      'A. Increase API Gateway timeout settings and keep Lambda cold starts unchanged.',
      'B. Configure provisioned concurrency for the Lambda function that handles the requests.',
      'C. Move the Lambda function code to EC2 instances in an Auto Scaling group behind the same API.',
      'D. Use CloudFront in front of API Gateway and disable all caching to force fresh backend responses.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 380,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is migrating its on-premises workload to the AWS Cloud. The company already uses several Amazon EC2 instances and Amazon RDS DB instances. The company wants a solution that automatically starts and stops the EC2 instances and DB instances outside of business hours. The solution must minimize cost and infrastructure maintenance. Which solution will meet these requirements?',
    answer: 'D. Create an AWS Lambda function that will start and stop the EC2 instances and DB instances. Configure Amazon EventBridge to invoke the Lambda function on a schedule.',
    answerVariants: [
      'A. Use AWS Compute Optimizer to detect idle resources and automatically stop EC2 and RDS instances after business hours.',
      'B. Configure AWS Systems Manager Automation documents and execute them manually each evening to stop all resources.',
      'C. Use Auto Scaling scheduled actions for EC2 instances and rely on RDS automatic pause for all DB instance types.',
      'D. Create an AWS Lambda function that will start and stop the EC2 instances and DB instances. Configure Amazon EventBridge to invoke the Lambda function on a schedule.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 381,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts a three-tier web application that includes a PostgreSQL database. The database stores the metadata from documents. The company searches the metadata for key terms to retrieve documents that the company reviews in a report each month. The documents are stored in Amazon S3. The documents are usually written only once, but they are updated frequently. The reporting process takes a few hours with the use of relational queries. The reporting process must not prevent any document modifications or the addition of new documents. A solutions architect needs to implement a solution to speed up the reporting process. Which solution will meet these requirements with the LEAST amount of change to the application code?',
    answer: 'B. Set up a new Amazon Aurora PostgreSQL DB cluster that includes an Aurora Replica. Issue queries to the Aurora Replica to generate the reports.',
    answerVariants: [
      'A. Increase the size of the existing PostgreSQL primary DB instance and run all monthly report queries on the primary instance.',
      'B. Set up a new Amazon Aurora PostgreSQL DB cluster that includes an Aurora Replica. Issue queries to the Aurora Replica to generate the reports.',
      'C. Export all metadata to Amazon S3 daily and run report generation only with Athena queries against the exports.',
      'D. Move monthly reporting logic to the application tier and cache all metadata in memory before generating reports.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 382,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has a three-tier application on AWS that ingests sensor data from its users\' devices. The traffic flows through a Network Load Balancer (NLB), then to Amazon EC2 instances for the web tier, and finally to EC2 instances for the application tier. The application tier makes calls to a database. What should a solutions architect do to improve the security of the data in transit?',
    answer: 'A. Configure a TLS listener. Deploy the server certificate on the NLB.',
    answerVariants: [
      'A. Configure a TLS listener. Deploy the server certificate on the NLB.',
      'B. Configure an HTTP listener on the NLB and enable TLS termination only on the application-tier EC2 instances.',
      'C. Replace the NLB with an ALB and use plain TCP from ALB to both web and application tiers.',
      'D. Encrypt data in transit only between application tier and database; leave device-to-web-tier traffic unencrypted.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 383,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is planning to migrate a commercial off-the-shelf application from its on-premises data center to AWS. The software has a software licensing model using sockets and cores with predictable capacity and uptime requirements. The company wants to use its existing licenses, which were purchased earlier this year. Which Amazon EC2 pricing option is the MOST cost-effective?',
    answer: 'A. Dedicated Reserved Hosts',
    answerVariants: [
      'A. Dedicated Reserved Hosts.',
      'B. On-Demand Instances with Compute Savings Plans for 1 year.',
      'C. Spot Instances with interruption handling and no host affinity.',
      'D. Standard Reserved Instances without dedicated host placement.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 384,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs an application on Amazon EC2 Linux instances across multiple Availability Zones. The application needs a storage layer that is highly available and Portable Operating System Interface (POSIX)-compliant. The storage layer must provide maximum data durability and must be shareable across the EC2 instances. The data in the storage layer will be accessed frequently for the first 30 days and will be accessed infrequently after that time. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Use the Amazon Elastic File System (Amazon EFS) Standard storage class. Create a lifecycle management policy to move infrequently accessed data to EFS Standard-Infrequent Access (EFS Standard-IA).',
    answerVariants: [
      'A. Use Amazon S3 Standard for POSIX-compliant shared access and transition infrequently accessed data to S3 Standard-IA.',
      'B. Use Amazon FSx for Windows File Server and SMB access from Linux instances to meet POSIX requirements.',
      'C. Use the Amazon Elastic File System (Amazon EFS) Standard storage class. Create a lifecycle management policy to move infrequently accessed data to EFS Standard-Infrequent Access (EFS Standard-IA).',
      'D. Use Amazon EBS gp3 volumes attached to one instance per AZ and replicate data between volumes manually.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 385,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect is creating a new VPC design. There are two public subnets for the load balancer, two private subnets for web servers, and two private subnets for MySQL. The web servers use only HTTPS. The solutions architect has already created a security group for the load balancer allowing port 443 from 0.0.0.0/0. Company policy requires that each resource has the least access required to still be able to perform its tasks. Which additional configuration strategy should the solutions architect use to meet these requirements?',
    answer: 'C. Create a security group for the web servers and allow port 443 from the load balancer. Create a security group for the MySQL servers and allow port 3306 from the web servers security group.',
    answerVariants: [
      'A. Allow all inbound traffic between subnets by CIDR to simplify network communication and reduce security-group complexity.',
      'B. Assign one shared security group to load balancer, web servers, and MySQL so traffic is unrestricted inside the group.',
      'C. Create a security group for the web servers and allow port 443 from the load balancer. Create a security group for the MySQL servers and allow port 3306 from the web servers security group.',
      'D. Expose MySQL on port 3306 to 0.0.0.0/0 and rely on database user authentication for protection.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 386,
    topicSlug: 'database-performance-and-caching',
    question: 'An ecommerce company is running a multi-tier application on AWS. The front-end and backend tiers both run on Amazon EC2, and the database runs on Amazon RDS for MySQL. The backend tier communicates with the RDS instance. There are frequent calls to return identical datasets from the database that are causing performance slowdowns. Which action should be taken to improve the performance of the backend?',
    answer: 'B. Implement Amazon ElastiCache to cache the large datasets.',
    answerVariants: [
      'A. Increase the size of the RDS for MySQL instance and route all duplicate dataset reads directly to the primary database.',
      'B. Implement Amazon ElastiCache to cache the large datasets.',
      'C. Add more EC2 backend instances and use local memory cache on each instance without a shared cache service.',
      'D. Move all frequently requested datasets into Amazon S3 and read objects synchronously for each request.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 387,
    topicSlug: 'identity-access-and-governance',
    question: 'A new employee has joined a company as a deployment engineer. The deployment engineer will be using AWS CloudFormation templates to create multiple AWS resources. A solutions architect wants the deployment engineer to perform job activities while following the principle of least privilege. Which combination of actions should the solutions architect take to accomplish this goal? (Choose two.)',
    answer: 'D. Create a new IAM user for the deployment engineer and add the IAM user to a group that has an IAM policy that allows AWS CloudFormation actions only.',
    answerVariants: [
      'A. Give the deployment engineer AdministratorAccess so CloudFormation can create all resources without IAM permission issues.',
      'B. Create one shared IAM user for the whole deployment team and rotate access keys weekly for accountability.',
      'C. Allow the deployment engineer to assume the root user session of each account for CloudFormation stack deployments.',
      'D. Create a new IAM user for the deployment engineer and add the IAM user to a group that has an IAM policy that allows AWS CloudFormation actions only.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 388,
    topicSlug: 'network-security-controls',
    question: 'A company is deploying a two-tier web application in a VPC. The web tier is using an Amazon EC2 Auto Scaling group with public subnets that span multiple Availability Zones. The database tier consists of an Amazon RDS for MySQL DB instance in separate private subnets. The web tier requires access to the database to retrieve product information. The web application is not working as intended. The web application reports that it cannot connect to the database. The database is confirmed to be up and running. All configurations for the network ACLs, security groups, and route tables are still in their default states. What should a solutions architect recommend to fix the application?',
    answer: 'D. Add an inbound rule to the security group of the database tier\'s RDS instance to allow traffic from the web tiers security group.',
    answerVariants: [
      'A. Modify the database subnet route table to include a route from the public web-tier subnets on port 3306 only.',
      'B. Add inbound rules to the default network ACL to allow 0.0.0.0/0 access to the RDS port from all web clients.',
      'C. Place the RDS DB instance in a public subnet so web-tier EC2 instances can reach it through public DNS endpoints.',
      'D. Add an inbound rule to the security group of the database tier\'s RDS instance to allow traffic from the web tiers security group.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 389,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has a large dataset for its online advertising business stored in an Amazon RDS for MySQL DB instance in a single Availability Zone. The company wants business reporting queries to run without impacting the write operations to the production DB instance. Which solution meets these requirements?',
    answer: 'A. Deploy RDS read replicas to process the business reporting queries.',
    answerVariants: [
      'A. Deploy RDS read replicas to process the business reporting queries.',
      'B. Move the reporting workload to the primary DB instance during off-peak hours and keep all writes on the same instance.',
      'C. Export transactional data to CSV files in S3 and run all business reporting manually from downloaded files.',
      'D. Replace the RDS DB instance with DynamoDB and use on-demand capacity for reporting queries.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 390,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts a three-tier ecommerce application on a fleet of Amazon EC2 instances. The instances run in an Auto Scaling group behind an Application Load Balancer (ALB). All ecommerce data is stored in an Amazon RDS for MariaDB Multi-AZ DB instance. The company wants to optimize customer session management during transactions. The application must store session data durably. Which solutions will meet these requirements? (Choose two.)',
    answer: 'B. Store session state in Amazon ElastiCache for Redis with Multi-AZ and automatic failover enabled.',
    answerVariants: [
      'A. Store all session data on each EC2 instance local disk and rely on ALB stickiness to keep users on the same instance.',
      'B. Store session state in Amazon ElastiCache for Redis with Multi-AZ and automatic failover enabled.',
      'C. Store all session data in browser cookies only and remove all server-side session tracking.',
      'D. Keep session state in the RDS MariaDB database by writing every session read and write synchronously.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 391,
    topicSlug: 'identity-access-and-governance',
    question: 'A company needs a backup strategy for its three-tier stateless web application. The web application runs on Amazon EC2 instances in an Auto Scaling group with a dynamic scaling policy that is configured to respond to scaling events. The database tier runs on Amazon RDS for PostgreSQL. The web application does not require temporary local storage on the EC2 instances. The company\'s recovery point objective (RPO) is 2 hours. The backup strategy must maximize scalability and optimize resource utilization for this environment. Which solution will meet these requirements?',
    answer: 'C. Retain the latest Amazon Machine Images (AMIs) of the web and application tiers. Enable automated backups in Amazon RDS and use point-in-time recovery to meet the RPO.',
    answerVariants: [
      'A. Back up every EC2 instance EBS volume every 5 minutes and restore all instances from snapshots during failures.',
      'B. Disable backups for the stateless EC2 tier and rely only on RDS snapshots that run once every 24 hours.',
      'C. Retain the latest Amazon Machine Images (AMIs) of the web and application tiers. Enable automated backups in Amazon RDS and use point-in-time recovery to meet the RPO.',
      'D. Replicate all EC2 instances in active-active mode across Regions and store session data in local instance storage.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 392,
    topicSlug: 'network-security-controls',
    question: 'A company wants to deploy a new public web application on AWS. The application includes a web server tier that uses Amazon EC2 instances. The application also includes a database tier that uses an Amazon RDS for MySQL DB instance. The application must be secure and accessible for global customers that have dynamic IP addresses. How should a solutions architect configure the security groups to meet these requirements?',
    answer: 'A. Configure the security group for the web servers to allow inbound traffic on port 443 from 0.0.0.0/0. Configure the security group for the DB instance to allow inbound traffic on port 3306 from the security group of the web servers.',
    answerVariants: [
      'A. Configure the security group for the web servers to allow inbound traffic on port 443 from 0.0.0.0/0. Configure the security group for the DB instance to allow inbound traffic on port 3306 from the security group of the web servers.',
      'B. Configure the web server security group to allow all inbound traffic and configure the DB security group to allow inbound traffic from the VPC CIDR block.',
      'C. Configure both web and DB security groups to allow inbound traffic from 0.0.0.0/0 on all required application ports.',
      'D. Configure only network ACLs and remove all security group restrictions for easier management of dynamic customer IP addresses.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 393,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A payment processing company records all voice communication with its customers and stores the audio files in an Amazon S3 bucket. The company needs to capture the text from the audio files. The company must remove from the text any personally identifiable information (PII) that belongs to customers. What should a solutions architect do to meet these requirements?',
    answer: 'C. Configure an Amazon Transcribe transcription job with PII redaction turned on. When an audio file is uploaded to the S3 bucket, invoke an AWS Lambda function to start the transcription job. Store the output in a separate S3 bucket.',
    answerVariants: [
      'A. Use Amazon Comprehend Medical to transcribe audio directly and redact PII before storing text in the same source S3 bucket.',
      'B. Use Amazon Rekognition to detect PII in audio streams and save only non-sensitive transcripts to S3.',
      'C. Configure an Amazon Transcribe transcription job with PII redaction turned on. When an audio file is uploaded to the S3 bucket, invoke an AWS Lambda function to start the transcription job. Store the output in a separate S3 bucket.',
      'D. Use AWS Glue ETL jobs to process uploaded audio files nightly and mask customer information in generated transcripts.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 394,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is running a multi-tier ecommerce web application in the AWS Cloud. The application runs on Amazon EC2 instances with an Amazon RDS for MySQL Multi-AZ DB instance. Amazon RDS is configured with the latest generation DB instance with 2,000 GB of storage in a General Purpose SSD (gp3) Amazon Elastic Block Store (Amazon EBS) volume. The database performance affects the application during periods of high demand.',
    answer: 'B. Migrate the DB storage to Provisioned IOPS SSD (io2) and configure sufficient IOPS above peak demand.',
    answerVariants: [
      'A. Reduce allocated storage size and keep gp3 so the database can burst above 20,000 IOPS during peak periods.',
      'B. Migrate the DB storage to Provisioned IOPS SSD (io2) and configure sufficient IOPS above peak demand.',
      'C. Add more read replicas and keep all writes on gp3 storage with unchanged IOPS limits.',
      'D. Move the database to magnetic storage to lower latency variability during high write periods.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 395,
    topicSlug: 'identity-access-and-governance',
    question: 'An IAM user made several configuration changes to AWS resources in their company\'s account during a production deployment last week. A solutions architect learned that a couple of security group rules are not configured as desired. The solutions architect wants to confirm which IAM user was responsible for making changes. Which service should the solutions architect use to find the desired information?',
    answer: 'C. AWS CloudTrail',
    answerVariants: [
      'A. Amazon CloudWatch Logs Insights.',
      'B. AWS Config timeline.',
      'C. AWS CloudTrail.',
      'D. Amazon GuardDuty findings.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 396,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has implemented a self-managed DNS service on AWS. The solution consists of the following:  Amazon EC2 instances in different AWS Regions  Endpoints of a standard accelerator in AWS Global Accelerator The company wants to protect the solution against DDoS attacks. What should a solutions architect do to meet this requirement?',
    answer: 'A. Subscribe to AWS Shield Advanced. Add the accelerator as a resource to protect.',
    answerVariants: [
      'A. Subscribe to AWS Shield Advanced. Add the accelerator as a resource to protect.',
      'B. Enable AWS WAF directly on the standard accelerator endpoint resources to block DDoS traffic.',
      'C. Attach AWS Firewall Manager policies to each EC2 instance that provides DNS records.',
      'D. Increase Route 53 health-check intervals and failover thresholds to absorb volumetric attacks automatically.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 397,
    topicSlug: 'database-performance-and-caching',
    question: 'An ecommerce company needs to run a scheduled daily job to aggregate and filter sales records for analytics. The company stores the sales records in an Amazon S3 bucket. Each object can be up to 10 GB in size. Based on the number of sales events, the job can take up to an hour to complete. The CPU and memory usage of the job are constant and are known in advance.',
    answer: 'C. Use AWS Batch to run a scheduled containerized aggregation job against the S3 dataset.',
    answerVariants: [
      'A. Run one persistent EC2 instance and execute cron scripts daily to process all files in the S3 bucket.',
      'B. Use AWS Lambda to process each 10 GB object individually and aggregate the outputs in memory.',
      'C. Use AWS Batch to run a scheduled containerized aggregation job against the S3 dataset.',
      'D. Use Amazon Kinesis Data Streams to ingest all S3 objects before daily analysis and filtering.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 398,
    topicSlug: 'edge-and-global-routing',
    question: 'A company needs to transfer 600 TB of data from its on-premises network-attached storage (NAS) system to the AWS Cloud. The data transfer must be complete within 2 weeks. The data is sensitive and must be encrypted in transit. The company\'s internet connection can support an upload speed of 100 Mbps. Which solution meets these requirements MOST cost-effectively?',
    answer: 'C. Use the AWS Snow Family console to order several AWS Snowball Edge Storage Optimized devices. Use the devices to transfer the data to Amazon S3.',
    answerVariants: [
      'A. Use AWS DataSync over the 100 Mbps connection with end-to-end TLS and continue transfer continuously for 2 weeks.',
      'B. Use S3 Transfer Acceleration from the NAS system with multipart uploads and client-side encryption only.',
      'C. Use the AWS Snow Family console to order several AWS Snowball Edge Storage Optimized devices. Use the devices to transfer the data to Amazon S3.',
      'D. Use AWS Storage Gateway file gateway and replicate the NAS data to S3 in near real time through the internet.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 399,
    topicSlug: 'exam-preparation',
    question: 'A financial company hosts a web application on AWS. The application uses an Amazon API Gateway Regional API endpoint to give users the ability to retrieve current stock prices. The company\'s security team has noticed an increase in the number of API requests. The security team is concerned that HTTP flood attacks might take the application offline.',
    answer: 'B. Associate AWS WAF with the API Gateway stage and configure a rate-based rule to block HTTP flood traffic.',
    answerVariants: [
      'A. Increase API Gateway throttling limits and rely on CloudWatch alarms to detect and notify on HTTP flood attacks.',
      'B. Associate AWS WAF with the API Gateway stage and configure a rate-based rule to block HTTP flood traffic.',
      'C. Place a Network Load Balancer in front of API Gateway and configure NLB security groups to filter malicious source IPs.',
      'D. Enable AWS Shield Standard only on the API endpoint and disable all API keys to reduce request volume.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 400,
    topicSlug: 'event-driven-and-messaging',
    question: 'A meteorological startup company has a custom web application to sell weather data to its users online. The company uses Amazon DynamoDB to store its data and wants to build a new service that sends an alert to the managers of four internal teams every time a new weather event is recorded. The company does not want this new service to affect the performance of the current application. What should a solutions architect do to meet these requirements with the LEAST amount of operational overhead?',
    answer: 'C. Enable Amazon DynamoDB Streams on the table. Use triggers to write to a single Amazon Simple Notification Service (Amazon SNS) topic to which the teams can subscribe.',
    answerVariants: [
      'A. Poll the DynamoDB table every minute from four Lambda functions and send separate emails directly to each internal team.',
      'B. Add synchronous notification logic to the existing web application whenever a weather event record is inserted.',
      'C. Enable Amazon DynamoDB Streams on the table. Use triggers to write to a single Amazon Simple Notification Service (Amazon SNS) topic to which the teams can subscribe.',
      'D. Export DynamoDB events nightly to S3 and use EventBridge schedules to notify each team once per day.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 401,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to use the AWS Cloud to make an existing application highly available and resilient. The current version of the application resides in the company\'s data center. The application recently experienced data loss after a database server crashed because of an unexpected power outage. The company needs a solution that avoids any single points of failure. The solution must give the application the ability to scale to meet user demand. Which solution will meet these requirements?',
    answer: 'A. Deploy the application servers by using Amazon EC2 instances in an Auto Scaling group across multiple Availability Zones. Use an Amazon RDS DB instance in a Multi-AZ configuration.',
    answerVariants: [
      'A. Deploy the application servers by using Amazon EC2 instances in an Auto Scaling group across multiple Availability Zones. Use an Amazon RDS DB instance in a Multi-AZ configuration.',
      'B. Deploy one large EC2 instance and one Single-AZ RDS instance, then create nightly snapshots.',
      'C. Keep the application on premises and replicate backups to S3 once per day.',
      'D. Use AWS Lambda for the application and DynamoDB global tables without database failover requirements.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 402,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company needs to ingest and handle large amounts of streaming data that its application generates. The application runs on Amazon EC2 instances and sends data to Amazon Kinesis Data Streams, which is configured with default settings. Every other day, the application consumes the data and writes the data to an Amazon S3 bucket for business intelligence (BI) processing. The company observes that Amazon S3 is not receiving all the data that the application sends to Kinesis Data Streams. What should a solutions architect do to resolve this issue?',
    answer: 'C. Increase the Kinesis Data Streams retention period and ensure the consumer reads from the stream before records expire.',
    answerVariants: [
      'A. Reduce the number of shards and read the stream less frequently to lower read costs.',
      'B. Replace Kinesis Data Streams with SNS so records are delivered to S3 automatically.',
      'C. Increase the Kinesis Data Streams retention period and ensure the consumer reads from the stream before records expire.',
      'D. Use S3 Transfer Acceleration to improve Kinesis delivery to S3.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 403,
    topicSlug: 'identity-access-and-governance',
    question: 'A developer has an application that uses an AWS Lambda function to upload files to Amazon S3 and needs the required permissions to perform the task. The developer already has an IAM user with valid IAM credentials required for Amazon S3. What should a solutions architect do to grant the permissions?',
    answer: 'D. Create an IAM execution role with the required permissions and attach the IAM role to the Lambda function.',
    answerVariants: [
      'A. Reuse the developer IAM user access keys inside Lambda environment variables.',
      'B. Add an S3 bucket policy that allows public write access from Lambda service principal.',
      'C. Put the Lambda function in a public subnet to inherit S3 permissions.',
      'D. Create an IAM execution role with the required permissions and attach the IAM role to the Lambda function.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 404,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has deployed a serverless application that invokes an AWS Lambda function when new documents are uploaded to an Amazon S3 bucket. The application uses the Lambda function to process the documents. After a recent marketing campaign, the company noticed that the application did not process many of the documents. What should a solutions architect do to improve the architecture of this application?',
    answer: 'D. Create an Amazon Simple Queue Service (Amazon SQS) queue. Send the requests to the queue. Configure the queue as an event source for Lambda.',
    answerVariants: [
      'A. Increase Lambda timeout to 15 minutes and process all uploads synchronously.',
      'B. Trigger two Lambda functions for each upload to improve throughput.',
      'C. Add an EC2 worker fleet that polls S3 directly every minute.',
      'D. Create an Amazon Simple Queue Service (Amazon SQS) queue. Send the requests to the queue. Configure the queue as an event source for Lambda.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 405,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A solutions architect is designing the architecture for a software demonstration environment. The environment will run on Amazon EC2 instances in an Auto Scaling group behind an Application Load Balancer (ALB). The system will experience significant increases in traffic during working hours but is not required to operate on weekends. Which combination of actions should the solutions architect take to ensure that the system can scale to meet demand? (Choose two.)',
    answer: 'A. Use AWS Auto Scaling to adjust the ALB capacity based on request rate.',
    answerVariants: [
      'A. Use AWS Auto Scaling to adjust the ALB capacity based on request rate.',
      'B. Keep a fixed number of instances and only scale ALB listeners.',
      'C. Disable Auto Scaling on weekdays and run only scheduled start/stop actions.',
      'D. Move the environment to one EC2 instance and cache all traffic in CloudFront.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 406,
    topicSlug: 'network-security-controls',
    question: 'A solutions architect is designing a two-tiered architecture that includes a public subnet and a database subnet. The web servers in the public subnet must be open to the internet on port 443. The Amazon RDS for MySQL DB instance in the database subnet must be accessible only to the web servers on port 3306. Which combination of steps should the solutions architect take to meet these requirements? (Choose two.)',
    answer: 'C. Create a security group for the web servers in the public subnet. Add a rule to allow traffic from 0.0.0.0/0 on port 443.',
    answerVariants: [
      'A. Open port 3306 on the DB security group to 0.0.0.0/0 and restrict by database username.',
      'B. Use only network ACLs and leave security groups empty.',
      'C. Create a security group for the web servers in the public subnet. Add a rule to allow traffic from 0.0.0.0/0 on port 443.',
      'D. Place the database in a public subnet and allow web-to-DB traffic over port 80.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 407,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is implementing a shared storage solution for a gaming application that is hosted in the AWS Cloud. The company needs the ability to use Lustre clients to access data. The solution must be fully managed. Which solution meets these requirements?',
    answer: 'D. Create an Amazon FSx for Lustre file system. Attach the file system to the origin server. Connect the application server to the file system.',
    answerVariants: [
      'A. Use Amazon EFS with SMB protocol for Lustre clients.',
      'B. Use S3 Standard and mount via NFS for high-performance shared I/O.',
      'C. Use EC2 instance store volumes replicated manually.',
      'D. Create an Amazon FSx for Lustre file system. Attach the file system to the origin server. Connect the application server to the file system.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 408,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company runs an application that receives data from thousands of geographically dispersed remote devices that use UDP. The application processes the data immediately and sends a message back to the device if necessary. No data is stored. The company needs a solution that minimizes latency for the data transmission from the devices. The solution also must provide rapid failover to another AWS Region. Which solution will meet these requirements?',
    answer: 'B. Use AWS Global Accelerator. Create a Network Load Balancer (NLB) in each of the two Regions as an endpoint. Create an Amazon Elastic Container Service (Amazon ECS) cluster with the Fargate launch type. Create an ECS service on the cluster. Set the ECS service as the target for the NLB. Process the data in Amazon ECS.',
    answerVariants: [
      'A. Use CloudFront with ALBs in both Regions for UDP and failover.',
      'B. Use AWS Global Accelerator. Create a Network Load Balancer (NLB) in each of the two Regions as an endpoint. Create an Amazon Elastic Container Service (Amazon ECS) cluster with the Fargate launch type. Create an ECS service on the cluster. Set the ECS service as the target for the NLB. Process the data in Amazon ECS.',
      'C. Use Route 53 weighted records directly to EC2 public IPs in both Regions.',
      'D. Use API Gateway regional endpoints with Lambda for UDP packet handling.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 409,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A solutions architect must migrate a Windows Internet Information Services (IIS) web application to AWS. The application currently relies on a file share hosted in the user\'s on-premises network-attached storage (NAS). The solutions architect has proposed migrating the IIS web servers to Amazon EC2 instances in multiple Availability Zones that are connected to the storage solution, and configuring an Elastic Load Balancer attached to the instances. Which replacement to the on-premises file share is MOST resilient and durable?',
    answer: 'C. Migrate the file share to Amazon FSx for Windows File Server.',
    answerVariants: [
      'A. Migrate the file share to Amazon S3 and access it with SMB clients directly.',
      'B. Use EBS Multi-Attach across AZs for a shared Windows file system.',
      'C. Migrate the file share to Amazon FSx for Windows File Server.',
      'D. Keep NAS on premises and mount through Direct Connect only.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 410,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is deploying a new application on Amazon EC2 instances. The application writes data to Amazon Elastic Block Store (Amazon EBS) volumes. The company needs to ensure that all data that is written to the EBS volumes is encrypted at rest. Which solution will meet this requirement?',
    answer: 'B. Create the EBS volumes as encrypted volumes. Attach the EBS volumes to the EC2 instances.',
    answerVariants: [
      'A. Encrypt data in transit only with TLS between EC2 and EBS.',
      'B. Create the EBS volumes as encrypted volumes. Attach the EBS volumes to the EC2 instances.',
      'C. Use instance store volumes and encrypt files at the application layer only.',
      'D. Enable S3 default encryption because EBS inherits S3 encryption settings.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 411,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has a web application with sporadic usage patterns. There is heavy usage at the beginning of each month, moderate usage at the start of each week, and unpredictable usage during the week. The application consists of a web server and a MySQL database server running inside the data center. The company would like to move the application to the AWS Cloud, and needs to select a cost-effective database platform that will not require database modifications. Which solution will meet these requirements?',
    answer: 'C. MySQL-compatible Amazon Aurora Serverless',
    answerVariants: [
      'A. Amazon RDS for SQL Server Single-AZ.',
      'B. Self-managed MySQL on EC2 with Auto Scaling.',
      'C. MySQL-compatible Amazon Aurora Serverless.',
      'D. Amazon DynamoDB on-demand with migration from relational schema.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 412,
    topicSlug: 'identity-access-and-governance',
    question: 'An image-hosting company stores its objects in Amazon S3 buckets. The company wants to avoid accidental exposure of the objects in the S3 buckets to the public. All S3 objects in the entire AWS account need to remain private. Which solution will meet these requirements?',
    answer: 'D. Use the S3 Block Public Access feature on the account level. Use AWS Organizations to create a service control policy (SCP) that prevents IAM users from changing the setting. Apply the SCP to the account.',
    answerVariants: [
      'A. Enable versioning on all buckets to prevent public reads.',
      'B. Add bucket policies manually to deny public access on each bucket.',
      'C. Use IAM Access Analyzer only to detect public buckets after deployment.',
      'D. Use the S3 Block Public Access feature on the account level. Use AWS Organizations to create a service control policy (SCP) that prevents IAM users from changing the setting. Apply the SCP to the account.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 413,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An ecommerce company is experiencing an increase in user traffic. The company\'s store is deployed on Amazon EC2 instances as a two-tier web application consisting of a web tier and a separate database tier. As traffic increases, the company notices that the architecture is causing significant delays in sending timely marketing and order confirmation email to users. The company wants to reduce the time it spends resolving complex email delivery issues and minimize operational overhead. What should a solutions architect do to meet these requirements?',
    answer: 'B. Configure the web instance to send email through Amazon Simple Email Service (Amazon SES).',
    answerVariants: [
      'A. Host an SMTP server on EC2 and relay all messages through the database tier.',
      'B. Configure the web instance to send email through Amazon Simple Email Service (Amazon SES).',
      'C. Use CloudWatch alarms to retry failed emails from application logs.',
      'D. Store pending emails in S3 and send them once daily with a batch script.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 414,
    topicSlug: 'exam-preparation',
    question: 'A company has a business system that generates hundreds of reports each day. The business system saves the reports to a network share in CSV format. The company needs to store this data in the AWS Cloud in near-real time for analysis. Which solution will meet these requirements with the LEAST administrative overhead?',
    answer: 'A. Use AWS DataSync to continuously transfer CSV reports from the on-premises network share to Amazon S3, then query with Athena.',
    answerVariants: [
      'A. Use AWS DataSync to continuously transfer CSV reports from the on-premises network share to Amazon S3, then query with Athena.',
      'B. Upload all CSV files manually each day by using the S3 console.',
      'C. Use Snowball Edge weekly and process data after each device return.',
      'D. Store reports in EBS volumes attached to one EC2 instance for analysis.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 415,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is storing petabytes of data in Amazon S3 Standard. The data is stored in multiple S3 buckets and is accessed with varying frequency. The company does not know access patterns for all the data. The company needs to implement a solution for each S3 bucket to optimize the cost of S3 usage. Which solution will meet these requirements with the MOST operational efficiency?',
    answer: 'A. Create an S3 Lifecycle configuration with a rule to transition the objects in the S3 bucket to S3 Intelligent-Tiering.',
    answerVariants: [
      'A. Create an S3 Lifecycle configuration with a rule to transition the objects in the S3 bucket to S3 Intelligent-Tiering.',
      'B. Move all data to S3 Glacier Deep Archive immediately.',
      'C. Keep all data in S3 Standard and monitor with CloudWatch only.',
      'D. Use S3 One Zone-IA for all buckets to minimize storage cost.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 416,
    topicSlug: 'edge-and-global-routing',
    question: 'A rapidly growing global ecommerce company is hosting its web application on AWS. The web application includes static content and dynamic content. The website stores online transaction processing (OLTP) data in an Amazon RDS database The website\'s users are experiencing slow page loads. Which combination of actions should a solutions architect take to resolve this issue? (Choose two.)',
    answer: 'B. Set up an Amazon CloudFront distribution.',
    answerVariants: [
      'A. Increase ALB idle timeout and scale EC2 instances vertically.',
      'B. Set up an Amazon CloudFront distribution.',
      'C. Move all dynamic pages to S3 static website hosting only.',
      'D. Replace RDS with DynamoDB to improve page-load latency directly.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 417,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses Amazon EC2 instances and AWS Lambda functions to run its application. The company has VPCs with public subnets and private subnets in its AWS account. The EC2 instances run in a private subnet in one of the VPCs. The Lambda functions need direct network access to the EC2 instances for the application to work. The application will run for at least 1 year. The company expects the number of Lambda functions that the application uses to increase during that time. The company wants to maximize its savings on all application resources and to keep network latency between the services low. Which solution will meet these requirements?',
    answer: 'C. Configure Lambda functions in the same VPC private subnets as the EC2 instances, and use Savings Plans to optimize long-term compute costs.',
    answerVariants: [
      'A. Keep Lambda outside the VPC and connect through an internet-facing ALB to private EC2 instances.',
      'B. Put EC2 instances in public subnets so Lambda can access them over public IP.',
      'C. Configure Lambda functions in the same VPC private subnets as the EC2 instances, and use Savings Plans to optimize long-term compute costs.',
      'D. Replace Lambda with API Gateway direct integrations to EC2 instances using instance IDs.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 418,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect needs to allow team members to access Amazon S3 buckets in two different AWS accounts: a development account and a production account. The team currently has access to S3 buckets in the development account by using unique IAM users that are assigned to an IAM group that has appropriate permissions in the account. The solutions architect has created an IAM role in the production account. The role has a policy that grants access to an S3 bucket in the production account. Which solution will meet these requirements while complying with the principle of least privilege?',
    answer: 'B. Add the development account as a principal in the trust policy of the role in the production account.',
    answerVariants: [
      'A. Create production IAM users and share passwords with development users.',
      'B. Add the development account as a principal in the trust policy of the role in the production account.',
      'C. Add a bucket ACL that grants full control to all users in both accounts.',
      'D. Use an SCP in development to allow cross-account S3 access automatically.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 419,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Organizations with all features enabled and runs multiple Amazon EC2 workloads in the ap-southeast-2 Region. The company has a service control policy (SCP) that prevents any resources from being created in any other Region. A security policy requires the company to encrypt all data at rest. An audit discovers that employees have created Amazon Elastic Block Store (Amazon EBS) volumes for EC2 instances without encrypting the volumes. The company wants any new EC2 instances that any IAM user or root user launches in ap-southeast-2 to use encrypted EBS volumes. The company wants a solution that will have minimal effect on employees who create EBS volumes. Which combination of steps will meet these requirements? (Choose two.)',
    answer: 'C. Create an SCP. Attach the SCP to the root organizational unit (OU). Define the SCP to deny the ec2:CreateVolume action when the ec2:Encrypted condition equals false.',
    answerVariants: [
      'A. Use AWS Config only to notify when unencrypted EBS volumes are created.',
      'B. Enable EBS encryption by default in one account and rely on user behavior in others.',
      'C. Create an SCP. Attach the SCP to the root organizational unit (OU). Define the SCP to deny the ec2:CreateVolume action when the ec2:Encrypted condition equals false.',
      'D. Require IAM users to attach a custom encryption tag before launching EC2 instances.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 420,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to use an Amazon RDS for PostgreSQL DB cluster to simplify time-consuming database administrative tasks for production database workloads. The company wants to ensure that its database is highly available and will provide automatic failover support in most scenarios in less than 40 seconds. The company wants to offload reads off of the primary instance and keep costs as low as possible. Which solution will meet these requirements?',
    answer: 'D. Use an Amazon RDS Multi-AZ DB cluster deployment. Point the read workload to the reader endpoint.',
    answerVariants: [
      'A. Use Single-AZ RDS PostgreSQL with automated backups every 5 minutes.',
      'B. Use RDS PostgreSQL read replicas in one AZ only and route all traffic to the writer endpoint.',
      'C. Use Aurora Serverless with no reader instances and scale manually during peak reads.',
      'D. Use an Amazon RDS Multi-AZ DB cluster deployment. Point the read workload to the reader endpoint.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 421,
    topicSlug: 'network-security-controls',
    question: 'A company runs a highly available SFTP service. The SFTP service uses two Amazon EC2 Linux instances that run with elastic IP addresses to accept traffic from trusted IP sources on the internet. The SFTP service is backed by shared storage that is attached to the instances. User accounts are created and managed as Linux users in the SFTP servers. The company wants a serverless option that provides high IOPS performance and highly configurable security. The company also wants to maintain control over user permissions. Which solution will meet these requirements?',
    answer: 'B. Create an encrypted Amazon Elastic File System (Amazon EFS) volume. Create an AWS Transfer Family SFTP service with elastic IP addresses and a VPC endpoint that has internet-facing access. Attach a security group to the endpoint that allows only trusted IP addresses. Attach the EFS volume to the SFTP service endpoint. Grant users access to the SFTP service.',
    answerVariants: [
      'A. Use AWS DataSync over public internet and local Linux users on one EC2 instance.',
      'B. Create an encrypted Amazon Elastic File System (Amazon EFS) volume. Create an AWS Transfer Family SFTP service with elastic IP addresses and a VPC endpoint that has internet-facing access. Attach a security group to the endpoint that allows only trusted IP addresses. Attach the EFS volume to the SFTP service endpoint. Grant users access to the SFTP service.',
      'C. Use Amazon S3 static website endpoints for inbound SFTP traffic.',
      'D. Replace SFTP with FTP on ALB and store data in instance store volumes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 422,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is developing a new machine learning (ML) model solution on AWS. The models are developed as independent microservices that fetch approximately 1 GB of model data from Amazon S3 at startup and load the data into memory. Users access the models through an asynchronous API. Users can send a request or a batch of requests and specify where the results should be sent. The company provides models to hundreds of users. The usage patterns for the models are irregular. Some models could be unused for days or weeks. Other models could receive batches of thousands of requests at a time. Which design should a solutions architect recommend to meet these requirements?',
    answer: 'D. Direct the requests from the API into an Amazon Simple Queue Service (Amazon SQS) queue. Deploy the models as Amazon Elastic Container Service (Amazon ECS) services that read from the queue. Enable AWS Auto Scaling on Amazon ECS for both the cluster and copies of the service based on the queue size.',
    answerVariants: [
      'A. Run each model as a permanently warm EC2 instance behind a Classic Load Balancer.',
      'B. Use synchronous API Gateway to invoke one Lambda per request with 15-minute timeout.',
      'C. Store all requests in DynamoDB and process nightly with AWS Batch.',
      'D. Direct the requests from the API into an Amazon Simple Queue Service (Amazon SQS) queue. Deploy the models as Amazon Elastic Container Service (Amazon ECS) services that read from the queue. Enable AWS Auto Scaling on Amazon ECS for both the cluster and copies of the service based on the queue size.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 423,
    topicSlug: 'exam-preparation',
    question: 'Josn format',
    answer: 'A. Store the data in JSON format in Amazon S3 and query it by using serverless analytics services.',
    answerVariants: [
      'A. Store the data in JSON format in Amazon S3 and query it by using serverless analytics services.',
      'B. Convert all JSON data to XML and store it on local NFS servers.',
      'C. Keep all records in one EC2 instance store volume without backups.',
      'D. Send JSON data to Amazon SES for long-term storage.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 424,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is running a custom application on Amazon EC2 On-Demand Instances. The application has frontend nodes that need to run 24 hours a day, 7 days a week and backend nodes that need to run only for a short time based on workload. The number of backend nodes varies during the day. The company needs to scale out and scale in more instances based on workload. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Use Reserved Instances for the frontend nodes. Use Spot Instances for the backend nodes.',
    answerVariants: [
      'A. Use Spot Instances for all nodes, including critical frontend capacity.',
      'B. Use Reserved Instances for the frontend nodes. Use Spot Instances for the backend nodes.',
      'C. Use Dedicated Hosts for frontend and backend nodes to reduce cost.',
      'D. Use On-Demand Instances only and disable scaling for cost control.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 425,
    topicSlug: 'storage-performance-patterns',
    question: 'A company uses high block storage capacity to runs its workloads on premises. The company\'s daily peak input and output transactions per second are not more than 15,000 IOPS. The company wants to migrate the workloads to Amazon EC2 and to provision disk performance independent of storage capacity. Which Amazon Elastic Block Store (Amazon EBS) volume type will meet these requirements MOST cost-effectively?',
    answer: 'C. GP3 volume type',
    answerVariants: [
      'A. Magnetic (standard) volume type.',
      'B. Throughput Optimized HDD (st1) volume type.',
      'C. GP3 volume type.',
      'D. Cold HDD (sc1) volume type.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 426,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company needs to store data from its healthcare application. The application\'s data frequently changes. A new regulation requires audit access at all levels of the stored data. The company hosts the application on an on-premises infrastructure that is running out of storage capacity. A solutions architect must securely migrate the existing data to AWS while satisfying the new regulation. Which solution will meet these requirements?',
    answer: 'D. Use AWS Storage Gateway to move the existing data to Amazon S3. Use AWS CloudTrail to log management events.',
    answerVariants: [
      'A. Copy data to EC2 instance store and enable VPC Flow Logs for auditing.',
      'B. Use Amazon EBS snapshots only and rely on CloudWatch metrics for audit trail.',
      'C. Transfer data with Snowball once and disable all logging to reduce cost.',
      'D. Use AWS Storage Gateway to move the existing data to Amazon S3. Use AWS CloudTrail to log management events.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 427,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect is implementing a complex Java application with a MySQL database. The Java application must be deployed on Apache Tomcat and must be highly available. What should the solutions architect do to meet these requirements?',
    answer: 'B. Deploy the application by using AWS Elastic Beanstalk. Configure a load-balanced environment and a rolling deployment policy.',
    answerVariants: [
      'A. Deploy manually on one EC2 instance and restart Tomcat for each release.',
      'B. Deploy the application by using AWS Elastic Beanstalk. Configure a load-balanced environment and a rolling deployment policy.',
      'C. Package Java code into Lambda functions and store sessions in local memory.',
      'D. Use Amazon Lightsail instances behind Route 53 round-robin only.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 428,
    topicSlug: 'identity-access-and-governance',
    question: 'A serverless application uses Amazon API Gateway, AWS Lambda, and Amazon DynamoDB. The Lambda function needs permissions to read and write to the DynamoDB table. Which solution will give the Lambda function access to the DynamoDB table MOST securely?',
    answer: 'B. Create an IAM role that includes Lambda as a trusted service. Attach a policy to the role that allows read and write access to the DynamoDB table. Update the configuration of the Lambda function to use the new role as the execution role.',
    answerVariants: [
      'A. Store long-lived IAM access keys in Lambda environment variables.',
      'B. Create an IAM role that includes Lambda as a trusted service. Attach a policy to the role that allows read and write access to the DynamoDB table. Update the configuration of the Lambda function to use the new role as the execution role.',
      'C. Attach an IAM policy to API Gateway so Lambda inherits DynamoDB permissions.',
      'D. Configure a resource policy on DynamoDB that allows anonymous read and write.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 429,
    topicSlug: 'exam-preparation',
    question: 'Json format',
    answer: 'A. Store application records in JSON format in Amazon S3 and process them with event-driven serverless services.',
    answerVariants: [
      'A. Store application records in JSON format in Amazon S3 and process them with event-driven serverless services.',
      'B. Convert all JSON records to CSV and email them through Amazon SES.',
      'C. Place all records in one RDS table with no indexing strategy.',
      'D. Keep records only in memory on ECS tasks without durable storage.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 430,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A manufacturing company has machine sensors that upload .csv files to an Amazon S3 bucket. These .csv files must be converted into images and must be made available as soon as possible for the automatic generation of graphical reports. The images become irrelevant after 1 month, but the .csv files must be kept to train machine learning (ML) models twice a year. The ML trainings and audits are planned weeks in advance. Which combination of steps will meet these requirements MOST cost-effectively? (Choose two.)',
    answer: 'B. Design an AWS Lambda function that converts the .csv files into images and stores the images in the S3 bucket. Invoke the Lambda function when a .csv file is uploaded.',
    answerVariants: [
      'A. Run a daily EC2 cron job that scans S3 and converts all files in bulk.',
      'B. Design an AWS Lambda function that converts the .csv files into images and stores the images in the S3 bucket. Invoke the Lambda function when a .csv file is uploaded.',
      'C. Use Amazon EMR for every incoming file and keep all images forever in S3 Standard.',
      'D. Use DataSync to convert CSV files to images during transfer.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 431,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has developed a new video game as a web application. The application is in a three-tier architecture in a VPC with Amazon RDS for MySQL in the database layer. Several players will compete concurrently online. The game\'s developers want to display a top-10 scoreboard in near-real time and offer the ability to stop and restore the game while preserving the current scores. What should a solutions architect do to meet these requirements?',
    answer: 'B. Set up an Amazon ElastiCache for Redis cluster to compute and cache the scores for the web application to display.',
    answerVariants: [
      'A. Query RDS directly on every page refresh and disable caching.',
      'B. Set up an Amazon ElastiCache for Redis cluster to compute and cache the scores for the web application to display.',
      'C. Use S3 object metadata as the real-time leaderboard store.',
      'D. Write scores to CloudWatch Logs and read them from dashboards.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 432,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An ecommerce company wants to use machine learning (ML) algorithms to build and train models. The company will use the models to visualize complex scenarios and to detect trends in customer data. The architecture team wants to integrate its ML models with a reporting platform to analyze the augmented data and use the data directly in its business intelligence dashboards. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use Amazon SageMaker to build and train models. Use Amazon QuickSight to visualize the data.',
    answerVariants: [
      'A. Build custom ML pipelines on EC2 and create charts in Excel manually.',
      'B. Use Amazon SageMaker to build and train models. Use Amazon QuickSight to visualize the data.',
      'C. Use AWS Glue only to train models and Amazon SNS for visualization.',
      'D. Use Athena UDFs to replace model training and reporting.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 433,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is running its production and nonproduction environment workloads in multiple AWS accounts. The accounts are in an organization in AWS Organizations. The company needs to design a solution that will prevent the modification of cost usage tags. Which solution will meet these requirements?',
    answer: 'C. Create a service control policy (SCP) to prevent tag modification except by authorized principals.',
    answerVariants: [
      'A. Use AWS Config rules to detect tag changes after they happen.',
      'B. Restrict billing console access and leave tagging permissions unchanged.',
      'C. Create a service control policy (SCP) to prevent tag modification except by authorized principals.',
      'D. Store approved tags in SSM Parameter Store without IAM enforcement.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 434,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts its application in the AWS Cloud. The application runs on Amazon EC2 instances behind an Elastic Load Balancer in an Auto Scaling group and with an Amazon DynamoDB table. The company wants to ensure the application can be made available in anotherAWS Region with minimal downtime. What should a solutions architect do to meet these requirements with the LEAST amount of downtime?',
    answer: 'C. Deploy the application stack in a second Region and use DynamoDB global tables with Route 53 failover routing.',
    answerVariants: [
      'A. Create an AMI backup weekly and restore manually during outages.',
      'B. Keep only one Region and increase Auto Scaling max capacity.',
      'C. Deploy the application stack in a second Region and use DynamoDB global tables with Route 53 failover routing.',
      'D. Export DynamoDB data monthly to S3 and recover from exports when needed.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 435,
    topicSlug: 'edge-and-global-routing',
    question: 'A company needs to migrate a MySQL database from its on-premises data center to AWS within 2 weeks. The database is 20 TB in size. The company wants to complete the migration with minimal downtime. Which solution will migrate the database MOST cost-effectively?',
    answer: 'A. Order an AWS Snowball Edge Storage Optimized device. Use AWS Database Migration Service (AWS DMS) with AWS Schema Conversion Tool (AWS SCT) to migrate the database with replication of ongoing changes. Send the Snowball Edge device to AWS to finish the migration and continue the ongoing replication.',
    answerVariants: [
      'A. Order an AWS Snowball Edge Storage Optimized device. Use AWS Database Migration Service (AWS DMS) with AWS Schema Conversion Tool (AWS SCT) to migrate the database with replication of ongoing changes. Send the Snowball Edge device to AWS to finish the migration and continue the ongoing replication.',
      'B. Upload the database with S3 multipart uploads and rebuild schema manually.',
      'C. Use only AWS SCT with no replication and stop production writes during migration.',
      'D. Copy data over VPN in one weekend without change data capture.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 436,
    topicSlug: 'database-performance-and-caching',
    question: 'A company moved its on-premises PostgreSQL database to an Amazon RDS for PostgreSQL DB instance. The company successfully launched a new product. The workload on the database has increased. The company wants to accommodate the larger workload without adding infrastructure. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'A. Buy reserved DB instances for the total workload. Make the Amazon RDS for PostgreSQL DB instance larger.',
    answerVariants: [
      'A. Buy reserved DB instances for the total workload. Make the Amazon RDS for PostgreSQL DB instance larger.',
      'B. Migrate to self-managed PostgreSQL on EC2 Spot Instances.',
      'C. Keep current instance class and disable backups to free capacity.',
      'D. Move all reads to S3 Select and keep writes in PostgreSQL.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 437,
    topicSlug: 'identity-access-and-governance',
    question: 'A company operates an ecommerce website on Amazon EC2 instances behind an Application Load Balancer (ALB) in an Auto Scaling group. The site is experiencing performance issues related to a high request rate from illegitimate external systems with changing IP addresses. The security team is worried about potential DDoS attacks against the website. The company must block the illegitimate incoming requests in a way that has a minimal impact on legitimate users. What should a solutions architect recommend?',
    answer: 'B. Deploy AWS WAF, associate it with the ALB, and configure a rate-limiting rule.',
    answerVariants: [
      'A. Block source IPs manually in security groups every hour.',
      'B. Deploy AWS WAF, associate it with the ALB, and configure a rate-limiting rule.',
      'C. Add more EC2 instances to absorb illegitimate traffic.',
      'D. Use NACLs only because they automatically detect DDoS sources.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 438,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company wants to share accounting data with an external auditor. The data is stored in an Amazon RDS DB instance that resides in a private subnet. The auditor has its own AWS account and requires its own copy of the database. What is the MOST secure way for the company to share the database with the auditor?',
    answer: 'D. Create an encrypted snapshot of the database. Share the snapshot with the auditor. Allow access to the AWS Key Management Service (AWS KMS) encryption key.',
    answerVariants: [
      'A. Open the private subnet to the auditor account by adding an internet gateway.',
      'B. Export database rows to CSV and email files to the auditor.',
      'C. Create a read replica in the same account and provide DB password to the auditor.',
      'D. Create an encrypted snapshot of the database. Share the snapshot with the auditor. Allow access to the AWS Key Management Service (AWS KMS) encryption key.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 439,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A solutions architect configured a VPC that has a small range of IP addresses. The number of Amazon EC2 instances that are in the VPC is increasing, and there is an insufficient number of IP addresses for future workloads. Which solution resolves this issue with the LEAST operational overhead?',
    answer: 'A. Add an additional IPv4 CIDR block to increase the number of IP addresses and create additional subnets in the VPC. Create new resources in the new subnets by using the new CIDR.',
    answerVariants: [
      'A. Add an additional IPv4 CIDR block to increase the number of IP addresses and create additional subnets in the VPC. Create new resources in the new subnets by using the new CIDR.',
      'B. Replace all instances with larger instance types to consume fewer IP addresses.',
      'C. Use IPv6 only and delete all IPv4 subnets immediately.',
      'D. Create a second VPC and connect with internet-facing peering only.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 440,
    topicSlug: 'database-performance-and-caching',
    question: 'A company used an Amazon RDS for MySQL DB instance during application testing. Before terminating the DB instance at the end of the test cycle, a solutions architect created two backups. The solutions architect created the first backup by using the mysqldump utility to create a database dump. The solutions architect created the second backup by enabling the final DB snapshot option on RDS termination. The company is now planning for a new test cycle and wants to create a new DB instance from the most recent backup. The company has chosen a MySQL-compatible edition ofAmazon Aurora to host the DB instance. Which solutions will create the new DB instance? (Choose two.)',
    answer: 'A. Import the RDS snapshot directly into Aurora.',
    answerVariants: [
      'A. Import the RDS snapshot directly into Aurora.',
      'B. Restore the mysqldump file into DynamoDB and migrate later to Aurora.',
      'C. Convert the final snapshot to EBS and mount it on an EC2 instance.',
      'D. Use CloudFormation drift detection to recreate the database from backup.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 441,
    topicSlug: 'edge-and-global-routing',
    question: 'A company hosts a multi-tier web application on Amazon Linux Amazon EC2 instances behind an Application Load Balancer. The instances run in an Auto Scaling group across multiple Availability Zones. The company observes that the Auto Scaling group launches more On-Demand Instances when the application\'s end users access high volumes of static web content. The company wants to optimize cost. What should a solutions architect do to redesign the application MOST cost-effectively?',
    answer: 'C. Create an Amazon CloudFront distribution to host the static web contents from an Amazon S3 bucket.',
    answerVariants: [
      'A. Increase desired capacity in the Auto Scaling group and keep static content on EC2.',
      'B. Move static content to EFS and mount it to all web servers.',
      'C. Create an Amazon CloudFront distribution to host the static web contents from an Amazon S3 bucket.',
      'D. Use Route 53 latency records to serve static files from EC2 directly.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 442,
    topicSlug: 'cost-visibility-and-governance',
    question: 'A company stores several petabytes of data across multiple AWS accounts. The company uses AWS Lake Formation to manage its data lake. The company\'s data science team wants to securely share selective data from its accounts with the company\'s engineering team for analytical purposes. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'D. Use Lake Formation tag-based access control to authorize and grant cross-account permissions for the required data to the engineering team accounts.',
    answerVariants: [
      'A. Create duplicate S3 buckets per account and copy data daily.',
      'B. Share IAM users across accounts to simplify permissions.',
      'C. Use bucket ACLs only for all data lake permissions.',
      'D. Use Lake Formation tag-based access control to authorize and grant cross-account permissions for the required data to the engineering team accounts.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 443,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to host a scalable web application on AWS. The application will be accessed by users from different geographic regions of the world. Application users will be able to download and upload unique data up to gigabytes in size. The development team wants a cost-effective solution to minimize upload and download latency and maximize performance. What should a solutions architect do to accomplish this?',
    answer: 'A. Use Amazon S3 with Transfer Acceleration to host the application.',
    answerVariants: [
      'A. Use Amazon S3 with Transfer Acceleration to host the application.',
      'B. Use one EC2 instance in one Region with EBS-backed uploads.',
      'C. Use SFTP over VPN for all global users.',
      'D. Use DynamoDB for binary file upload and download operations.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 444,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has hired a solutions architect to design a reliable architecture for its application. The application consists of one Amazon RDS DB instance and two manually provisioned Amazon EC2 instances that run web servers. The EC2 instances are located in a single Availability Zone. An employee recently deleted the DB instance, and the application was unavailable for 24 hours as a result. The company is concerned with the overall reliability of its environment. What should the solutions architect do to maximize reliability of the application\'s infrastructure?',
    answer: 'B. Update the DB instance to be Multi-AZ, and enable deletion protection. Place the EC2 instances behind an Application Load Balancer, and run them in an EC2 Auto Scaling group across multiple Availability Zones.',
    answerVariants: [
      'A. Keep architecture single-AZ and increase backup frequency to hourly.',
      'B. Update the DB instance to be Multi-AZ, and enable deletion protection. Place the EC2 instances behind an Application Load Balancer, and run them in an EC2 Auto Scaling group across multiple Availability Zones.',
      'C. Replace RDS with one larger EC2 instance that hosts database and web tiers.',
      'D. Use Route 53 health checks only and keep current deployment model.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 445,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company is storing 700 terabytes of data on a large network-attached storage (NAS) system in its corporate data center. The company has a hybrid environment with a 10 Gbps AWS Direct Connect connection. After an audit from a regulator, the company has 90 days to move the data to the cloud. The company needs to move the data efficiently and without disruption. The company still needs to be able to access and update the data during the transfer window. Which solution will meet these requirements?',
    answer: 'A. Create an AWS DataSync agent in the corporate data center. Create a data transfer task. Start the transfer to an Amazon S3 bucket.',
    answerVariants: [
      'A. Create an AWS DataSync agent in the corporate data center. Create a data transfer task. Start the transfer to an Amazon S3 bucket.',
      'B. Copy all files manually over SMB to one EC2 instance.',
      'C. Use S3 Transfer Acceleration from each NAS client without orchestration.',
      'D. Pause all writes for 90 days and ship one Snowball at project end.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 446,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company stores data in PDF format in an Amazon S3 bucket. The company must follow a legal requirement to retain all new and existing data in Amazon S3 for 7 years. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'D. Turn on S3 Object Lock with compliance retention mode for the S3 bucket. Set the retention period to expire after 7 years. Use S3 Batch Operations to bring the existing data into compliance.',
    answerVariants: [
      'A. Enable S3 versioning and delete markers only.',
      'B. Use lifecycle policies to move objects to Glacier after 7 years.',
      'C. Restrict delete operations with IAM policies for one admin role.',
      'D. Turn on S3 Object Lock with compliance retention mode for the S3 bucket. Set the retention period to expire after 7 years. Use S3 Batch Operations to bring the existing data into compliance.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 447,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a stateless web application that runs on AWS Lambda functions that are invoked by Amazon API Gateway. The company wants to deploy the application across multiple AWS Regions to provide Regional failover capabilities. What should a solutions architect do to route traffic to multiple Regions?',
    answer: 'A. Create Amazon Route 53 health checks for each Region. Use an active-active failover configuration.',
    answerVariants: [
      'A. Create Amazon Route 53 health checks for each Region. Use an active-active failover configuration.',
      'B. Use CloudFront origin failover with one Lambda Region only.',
      'C. Configure API Gateway edge-optimized endpoint in one Region.',
      'D. Place all Lambda functions in one Region with Multi-AZ subnets.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 448,
    topicSlug: 'network-performance-and-hybrid',
    question: 'A company has two VPCs named Management and Production. The Management VPC uses VPNs through a customer gateway to connect to a single device in the data center. The Production VPC uses a virtual private gateway with two attached AWS Direct Connect connections. The Management and Production VPCs both use a single VPC peering connection to allow communication between the applications. What should a solutions architect do to mitigate any single point of failure in this architecture?',
    answer: 'C. Add a second set of VPNs to the Management VPC from a second customer gateway device.',
    answerVariants: [
      'A. Replace Direct Connect with one internet VPN for both VPCs.',
      'B. Remove VPC peering and route through public internet endpoints.',
      'C. Add a second set of VPNs to the Management VPC from a second customer gateway device.',
      'D. Move Management workloads into the Production VPC only.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 449,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs its application on an Oracle database. The company plans to quickly migrate to AWS because of limited resources for the database, backup administration, and data center maintenance. The application uses third-party database features that require privileged access. Which solution will help the company migrate the database to AWS MOST cost-effectively?',
    answer: 'B. Migrate the database to Amazon RDS Custom for Oracle. Customize the database settings to support third-party features.',
    answerVariants: [
      'A. Migrate to Aurora PostgreSQL and rewrite all Oracle-specific features immediately.',
      'B. Migrate the database to Amazon RDS Custom for Oracle. Customize the database settings to support third-party features.',
      'C. Use DynamoDB for transactional Oracle workloads.',
      'D. Use Amazon Redshift as the primary OLTP database.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 450,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has a three-tier web application that is in a single server. The company wants to migrate the application to the AWS Cloud. The company also wants the application to align with the AWS Well-Architected Framework and to be consistent with AWS recommended best practices for security, scalability, and resiliency. Which combination of solutions will meet these requirements? (Choose three.)',
    answer: 'C. Create a VPC across two Availability Zones. Refactor the application to host the web tier, application tier, and database tier. Host each tier on its own private subnet with Auto Scaling groups for the web tier and application tier.',
    answerVariants: [
      'A. Keep one server and add larger instance sizes for resilience.',
      'B. Place all tiers in one public subnet and protect with NACLs only.',
      'C. Create a VPC across two Availability Zones. Refactor the application to host the web tier, application tier, and database tier. Host each tier on its own private subnet with Auto Scaling groups for the web tier and application tier.',
      'D. Use static website hosting for all tiers and remove databases.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 451,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is migrating its applications and databases to the AWS Cloud. The company will use Amazon Elastic Container Service (Amazon ECS), AWS Direct Connect, and Amazon RDS. Which activities will be managed by the company\'s operational team? (Choose three.)',
    answer: 'C. Configuration of additional software components on Amazon ECS for monitoring, patch management, log management, and host intrusion detection.',
    answerVariants: [
      'A. AWS manages all application-level monitoring agents inside your containers.',
      'B. AWS manages all Direct Connect router configuration in your data centers.',
      'C. Configuration of additional software components on Amazon ECS for monitoring, patch management, log management, and host intrusion detection.',
      'D. AWS is responsible for your database schema and application SQL tuning decisions.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 452,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company runs a Java-based job on an Amazon EC2 instance. The job runs every hour and takes 10 seconds to run. The job runs on a scheduled interval and consumes 1 GB of memory. The CPU utilization of the instance is low except for short surges during which the job uses the maximum CPU available. The company wants to optimize the costs to run the job. Which solution will meet these requirements?',
    answer: 'B. Copy the code into an AWS Lambda function that has 1 GB of memory. Create an Amazon EventBridge scheduled rule to run the code each hour.',
    answerVariants: [
      'A. Keep the EC2 instance running 24/7 and use cron to execute the job hourly.',
      'B. Copy the code into an AWS Lambda function that has 1 GB of memory. Create an Amazon EventBridge scheduled rule to run the code each hour.',
      'C. Run the job in AWS Batch with dedicated GPU instances.',
      'D. Use Step Functions with one-minute polling loops on EC2.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 453,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company wants to implement a backup strategy for Amazon EC2 data and multiple Amazon S3 buckets. Because of regulatory requirements, the company must retain backup files for a specific time period. The company must not alter the files for the duration of the retention period. Which solution will meet these requirements?',
    answer: 'D. Use AWS Backup to create a backup vault that has a vault lock in compliance mode. Create the required backup plan.',
    answerVariants: [
      'A. Copy snapshots manually to S3 and protect with bucket policy only.',
      'B. Use EBS snapshots without immutable retention settings.',
      'C. Enable S3 versioning and rely on MFA delete for all backup requirements.',
      'D. Use AWS Backup to create a backup vault that has a vault lock in compliance mode. Create the required backup plan.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 454,
    topicSlug: 'exam-preparation',
    question: 'A company has resources across multiple AWS Regions and accounts. A newly hired solutions architect discovers a previous employee did not provide details about the resources inventory. The solutions architect needs to build and map the relationship details of the various workloads across all accounts. Which solution will meet these requirements in the MOST operationally efficient way?',
    answer: 'C. Use Workload Discovery on AWS to generate architecture diagrams of the workloads.',
    answerVariants: [
      'A. Draw architecture diagrams manually in Visio and update monthly.',
      'B. Export only Cost Explorer reports to infer dependencies.',
      'C. Use Workload Discovery on AWS to generate architecture diagrams of the workloads.',
      'D. Use AWS Personal Health Dashboard for resource inventory mapping.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 455,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Organizations. The company wants to operate some of its AWS accounts with different budgets. The company wants to receive alerts and automatically prevent provisioning of additional resources on AWS accounts when the allocated budget threshold is met during a specific period. Which combination of solutions will meet these requirements? (Choose three.)',
    answer: 'B. Use AWS Budgets to create a budget. Set the budget amount under the Billing dashboards of the required AWS accounts.',
    answerVariants: [
      'A. Use CloudWatch logs to estimate budget usage manually.',
      'B. Use AWS Budgets to create a budget. Set the budget amount under the Billing dashboards of the required AWS accounts.',
      'C. Use one account-level IAM policy to deny all API calls all the time.',
      'D. Use Cost and Usage Reports only, without alerting or automation.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 456,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs applications on Amazon EC2 instances in one AWS Region. The company wants to back up the EC2 instances to a second Region. The company also wants to provision EC2 resources in the second Region and manage the EC2 instances centrally from one AWS account. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Create a backup plan by using AWS Backup. Configure cross-Region backup to the second Region for the EC2 instances.',
    answerVariants: [
      'A. Copy AMIs manually to the second Region every quarter.',
      'B. Use EBS snapshots in one Region only and rely on AZ resiliency.',
      'C. Create a backup plan by using AWS Backup. Configure cross-Region backup to the second Region for the EC2 instances.',
      'D. Use AWS Config to replicate EC2 volumes across Regions.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 457,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company that uses AWS is building an application to transfer data to a product manufacturer. The company has its own identity provider (IdP). The company wants the IdP to authenticate application users while the users use the application to transfer data. The company must use Applicability Statement 2 (AS2) protocol. Which solution will meet these requirements?',
    answer: 'C. Use AWS Transfer Family to transfer the data. Create an AWS Lambda function for IdP authentication.',
    answerVariants: [
      'A. Use Amazon S3 pre-signed URLs with basic auth for AS2 sessions.',
      'B. Build a custom AS2 server on one EC2 instance and local user accounts.',
      'C. Use AWS Transfer Family to transfer the data. Create an AWS Lambda function for IdP authentication.',
      'D. Use AWS AppSync subscriptions with federated identities for AS2 transfers.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 458,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A solutions architect is designing a RESTAPI in Amazon API Gateway for a cash payback service. The application requires 1 GB of memory and 2 GB of storage for its computation resources. The application will require that the data is in a relational format. Which additional combination ofAWS services will meet these requirements with the LEAST administrative effort? (Choose two.)',
    answer: 'B. AWS Lambda',
    answerVariants: [
      'A. Amazon EC2 Auto Scaling group with local SSD storage.',
      'B. AWS Lambda.',
      'C. Amazon EMR.',
      'D. AWS Glue Spark jobs.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 459,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Organizations to run workloads within multiple AWS accounts. A tagging policy adds department tags to AWS resources when the company creates tags. An accounting team needs to determine spending on Amazon EC2 consumption. The accounting team must determine which departments are responsible for the costs regardless ofAWS account. The accounting team has access to AWS Cost Explorer for all AWS accounts within the organization and needs to access all reports from Cost Explorer. Which solution meets these requirements in the MOST operationally efficient way?',
    answer: 'A. From the Organizations management account billing console, activate a user-defined cost allocation tag named department. Create one cost report in Cost Explorer grouping by tag name, and filter by EC2.',
    answerVariants: [
      'A. From the Organizations management account billing console, activate a user-defined cost allocation tag named department. Create one cost report in Cost Explorer grouping by tag name, and filter by EC2.',
      'B. Export CUR files to S3 and require manual spreadsheet mapping each month.',
      'C. Create separate payer accounts for each department to split EC2 costs.',
      'D. Use CloudTrail events only to estimate department EC2 spending.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 460,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company wants to securely exchange data between its software as a service (SaaS) application Salesforce account and Amazon S3. The company must encrypt the data at rest by using AWS Key Management Service (AWS KMS) customer managed keys (CMKs). The company must also encrypt the data in transit. The company has enabled API access for the Salesforce account.',
    answer: 'C. Create Amazon AppFlow flows to transfer the data securely from Salesforce to Amazon S3.',
    answerVariants: [
      'A. Use public S3 bucket uploads from Salesforce and rely on HTTPS only.',
      'B. Export data from Salesforce to local CSV files and upload weekly.',
      'C. Create Amazon AppFlow flows to transfer the data securely from Salesforce to Amazon S3.',
      'D. Use Amazon SES inbound email to receive encrypted Salesforce records.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 461,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is developing a mobile gaming app in a single AWS Region. The app runs on multiple Amazon EC2 instances in an Auto Scaling group. The company stores the app data in Amazon DynamoDB. The app communicates by using TCP traffic and UDP traffic between the users and the servers. The application will be used globally. The company wants to ensure the lowest possible latency for all users. Which solution will meet these requirements?',
    answer: 'B. Use AWS Global Accelerator to create an accelerator. Create a Network Load Balancer (NLB) behind an accelerator endpoint that uses Global Accelerator integration and listening on the TCP and UDP ports. Update the Auto Scaling group to register instances on the NLB.',
    answerVariants: [
      'A. Use an Application Load Balancer and CloudFront for TCP and UDP traffic.',
      'B. Use AWS Global Accelerator to create an accelerator. Create a Network Load Balancer (NLB) behind an accelerator endpoint that uses Global Accelerator integration and listening on the TCP and UDP ports. Update the Auto Scaling group to register instances on the NLB.',
      'C. Use Route 53 geolocation routing directly to EC2 public IP addresses.',
      'D. Use API Gateway edge endpoints and Lambda for all game socket traffic.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 462,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an application that processes customer orders. The company hosts the application on an Amazon EC2 instance that saves the orders to an Amazon Aurora database. Occasionally when traffic is high the workload does not process orders fast enough. What should a solutions architect do to write the orders reliably to the database as quickly as possible?',
    answer: 'B. Write orders to an Amazon Simple Queue Service (Amazon SQS) queue. Use EC2 instances in an Auto Scaling group behind an Application Load Balancer to read from the SQS queue and process orders into the database.',
    answerVariants: [
      'A. Increase Aurora storage and keep one EC2 instance writing synchronously.',
      'B. Write orders to an Amazon Simple Queue Service (Amazon SQS) queue. Use EC2 instances in an Auto Scaling group behind an Application Load Balancer to read from the SQS queue and process orders into the database.',
      'C. Store all orders in local disk first and copy them to Aurora every night.',
      'D. Use Amazon SNS only as an order datastore and remove Aurora writes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 463,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'An IoT company is releasing a mattress that has sensors to collect data about a user\'s sleep. The sensors will send data to an Amazon S3 bucket. The sensors collect approximately 2 MB of data every night for each mattress. The company must process and summarize the data for each mattress. The results need to be available as soon as possible. Data processing will require 1 GB of memory and will finish within 30 seconds. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Use AWS Lambda with a Python script',
    answerVariants: [
      'A. Use one always-on EC2 instance with cron jobs for nightly aggregation.',
      'B. Use AWS Batch with GPU compute for each 2 MB payload.',
      'C. Use AWS Lambda with a Python script.',
      'D. Use Amazon EMR clusters that run every 30 seconds.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 464,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts an online shopping application that stores all orders in an Amazon RDS for PostgreSQL Single-AZ DB instance. Management wants to eliminate single points of failure and has asked a solutions architect to recommend an approach to minimize database downtime without requiring any changes to the application code. Which solution meets these requirements?',
    answer: 'A. Convert the existing database instance to a Multi-AZ deployment by modifying the database instance and specifying the Multi-AZ option.',
    answerVariants: [
      'A. Convert the existing database instance to a Multi-AZ deployment by modifying the database instance and specifying the Multi-AZ option.',
      'B. Create one read replica in the same AZ and promote it during failures.',
      'C. Replace RDS PostgreSQL with DynamoDB without code changes.',
      'D. Schedule hourly snapshots and restore during outages.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 465,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is developing an application to support customer demands. The company wants to deploy the application on multiple Amazon EC2 Nitro-based instances within the same Availability Zone. The company also wants to give the application the ability to write to multiple block storage volumes in multiple EC2 Nitro-based instances simultaneously to achieve higher application availability. Which solution will meet these requirements?',
    answer: 'C. Use Provisioned IOPS SSD (io2) EBS volumes with Amazon Elastic Block Store (Amazon EBS) Multi-Attach',
    answerVariants: [
      'A. Use gp3 volumes on one instance with EBS-optimized disabled.',
      'B. Use EFS with SMB protocol and attach as block devices.',
      'C. Use Provisioned IOPS SSD (io2) EBS volumes with Amazon Elastic Block Store (Amazon EBS) Multi-Attach.',
      'D. Use S3 One Zone-IA mounted by all instances as block storage.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 466,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company designed a stateless two-tier application that uses Amazon EC2 in a single Availability Zone and an Amazon RDS Multi-AZ DB instance. New company management wants to ensure the application is highly available. What should a solutions architect do to meet this requirement?',
    answer: 'A. Configure the application to use Multi-AZ EC2 Auto Scaling and create an Application Load Balancer',
    answerVariants: [
      'A. Configure the application to use Multi-AZ EC2 Auto Scaling and create an Application Load Balancer.',
      'B. Keep one AZ and add larger EC2 instances.',
      'C. Replace RDS Multi-AZ with Single-AZ to simplify failover.',
      'D. Use Route 53 simple routing across instances in one subnet.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 467,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Organizations. A member account has purchased a Compute Savings Plan. Because of changes in the workloads inside the member account, the account no longer receives the full benefit of the Compute Savings Plan commitment. The company uses less than 50% of its purchased compute power.',
    answer: 'B. Turn on discount sharing from the Billing Preferences section of the account console in the company\'s Organizations management account.',
    answerVariants: [
      'A. Convert the Compute Savings Plan to Reserved Instances in each member account.',
      'B. Turn on discount sharing from the Billing Preferences section of the account console in the company\'s Organizations management account.',
      'C. Move all workloads to Spot Instances to consume plan commitment.',
      'D. Disable consolidated billing to isolate discount usage.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 468,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is developing a microservices application that will provide a search catalog for customers. The company must use REST APIs to present the frontend of the application to users. The REST APIs must access the backend services that the company hosts in containers in private VPC subnets. Which solution will meet these requirements?',
    answer: 'B. Design a REST API by using Amazon API Gateway. Host the application in Amazon Elastic Container Service (Amazon ECS) in a private subnet. Create a private VPC link for API Gateway to access Amazon ECS.',
    answerVariants: [
      'A. Expose ECS tasks directly with public IPs and bypass API Gateway.',
      'B. Design a REST API by using Amazon API Gateway. Host the application in Amazon Elastic Container Service (Amazon ECS) in a private subnet. Create a private VPC link for API Gateway to access Amazon ECS.',
      'C. Use CloudFront signed cookies to call private ECS tasks directly.',
      'D. Use Amazon S3 static website endpoints to proxy REST requests to ECS.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 469,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company stores raw collected data in an Amazon S3 bucket. The data is used for several types of analytics on behalf of the company\'s customers. The type of analytics requested determines the access pattern on the S3 objects. The company cannot predict or control the access pattern. The company wants to reduce its S3 costs. Which solution will meet these requirements?',
    answer: 'C. Use S3 Lifecycle rules to transition objects from S3 Standard to S3 Intelligent-Tiering',
    answerVariants: [
      'A. Keep all data in S3 Standard and use requester pays.',
      'B. Move all objects immediately to S3 Glacier Deep Archive.',
      'C. Use S3 Lifecycle rules to transition objects from S3 Standard to S3 Intelligent-Tiering.',
      'D. Store analytics data in EBS snapshots instead of S3.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 470,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has applications hosted on Amazon EC2 instances with IPv6 addresses. The applications must initiate communications with other external applications using the internet. However the company\'s security policy states that any external service cannot initiate a connection to the EC2 instances. What should a solutions architect recommend to resolve this issue?',
    answer: 'D. Create an egress-only internet gateway and make it the destination of the subnet\'s route table.',
    answerVariants: [
      'A. Attach a NAT gateway for IPv6 outbound-only traffic.',
      'B. Use an internet gateway and block inbound with security groups only.',
      'C. Use VPC peering to external applications on the internet.',
      'D. Create an egress-only internet gateway and make it the destination of the subnet\'s route table.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 471,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is creating an application that runs on containers in a VPC. The application stores and accesses data in an Amazon S3 bucket. During the development phase, the application will store and access 1 TB of data in Amazon S3 each day. The company wants to minimize costs and wants to prevent traffic from traversing the internet whenever possible. Which solution will meet these requirements?',
    answer: 'C. Create a gateway VPC endpoint for Amazon S3. Associate this endpoint with all route tables in the VPC.',
    answerVariants: [
      'A. Use a NAT gateway for all S3 traffic to minimize cost.',
      'B. Use an interface endpoint for S3 in each subnet only.',
      'C. Create a gateway VPC endpoint for Amazon S3. Associate this endpoint with all route tables in the VPC.',
      'D. Use public S3 endpoints with TLS and deny internet egress.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 472,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has a mobile chat application with a data store based in Amazon DynamoDB. Users would like new messages to be read with as little latency as possible. A solutions architect needs to design an optimal solution that requires minimal application changes. Which method should the solutions architect select?',
    answer: 'A. Configure Amazon DynamoDB Accelerator (DAX) for the new messages table. Update the code to use the DAX endpoint.',
    answerVariants: [
      'A. Configure Amazon DynamoDB Accelerator (DAX) for the new messages table. Update the code to use the DAX endpoint.',
      'B. Enable DynamoDB Streams and poll stream records for reads.',
      'C. Use S3 Select to retrieve latest messages from exports.',
      'D. Add CloudFront in front of DynamoDB endpoints.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 473,
    topicSlug: 'edge-and-global-routing',
    question: 'A company hosts a website on Amazon EC2 instances behind an Application Load Balancer (ALB). The website serves static content. Website traffic is increasing, and the company is concerned about a potential increase in cost.',
    answer: 'A. Create an Amazon CloudFront distribution to cache static files at edge locations',
    answerVariants: [
      'A. Create an Amazon CloudFront distribution to cache static files at edge locations.',
      'B. Increase ALB target group deregistration delay.',
      'C. Move static assets to EBS and mount to each instance.',
      'D. Use Route 53 failover records to reduce static-content costs.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 474,
    topicSlug: 'exam-preparation',
    question: 'A company has multiple VPCs across AWS Regions to support and run workloads that are isolated from workloads in other Regions. Because of a recent application launch requirement, the company\'s VPCs must communicate with all other VPCs across all Regions. Which solution will meet these requirements with the LEAST amount of administrative effort?',
    answer: 'C. Use AWS Transit Gateway to manage VPC communication in a single Region and Transit Gateway peering across Regions to manage VPC communications.',
    answerVariants: [
      'A. Create full mesh VPC peering between all VPCs across Regions.',
      'B. Use one shared VPN appliance in a single Region for all inter-VPC traffic.',
      'C. Use AWS Transit Gateway to manage VPC communication in a single Region and Transit Gateway peering across Regions to manage VPC communications.',
      'D. Route all VPC-to-VPC traffic over the public internet with NAT gateways.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 475,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company is designing a containerized application that will use Amazon Elastic Container Service (Amazon ECS). The application needs to access a shared file system that is highly durable and can recover data to another AWS Region with a recovery point objective (RPO) of 8 hours. The file system needs to provide a mount target m each Availability Zone within a Region.',
    answer: 'A. Use Amazon EFS for the shared file system and AWS Backup to replicate to another Region on a schedule that satisfies the 8-hour RPO.',
    answerVariants: [
      'A. Use Amazon EFS for the shared file system and AWS Backup to replicate to another Region on a schedule that satisfies the 8-hour RPO.',
      'B. Use EBS io2 volumes and copy snapshots every 24 hours.',
      'C. Use instance store volumes with custom replication scripts.',
      'D. Use S3 Standard only and mount it directly as POSIX file system.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 476,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is expecting rapid growth in the near future. A solutions architect needs to configure existing users and grant permissions to new users on AWS. The solutions architect has decided to create IAM groups. The solutions architect will add the new users to IAM groups based on department. Which additional action is the MOST secure way to grant permissions to the new users?',
    answer: 'C. Create an IAM policy that grants least privilege permission. Attach the policy to the IAM groups',
    answerVariants: [
      'A. Attach AdministratorAccess to all IAM groups to simplify onboarding.',
      'B. Create one IAM user per department and share credentials.',
      'C. Create an IAM policy that grants least privilege permission. Attach the policy to the IAM groups.',
      'D. Use resource-based policies only and no IAM group permissions.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 477,
    topicSlug: 'identity-access-and-governance',
    question: 'IAM',
    answer: 'B. Assign users to IAM groups with least-privilege policies and enforce MFA for interactive access.',
    answerVariants: [
      'A. Create long-lived access keys for all users and rotate annually.',
      'B. Assign users to IAM groups with least-privilege policies and enforce MFA for interactive access.',
      'C. Use root account credentials for shared administrative tasks.',
      'D. Disable IAM groups and grant direct inline admin policies to each user.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 478,
    topicSlug: 'identity-access-and-governance',
    question: 'A law firm needs to share information with the public. The information includes hundreds of files that must be publicly readable. Modifications or deletions of the files by anyone before a designated future date are prohibited. Which solution will meet these requirements in the MOST secure way?',
    answer: 'B. Create a new Amazon S3 bucket with S3 Versioning enabled. Use S3 Object Lock with a retention period in accordance with the designated date. Configure the S3 bucket for static website hosting. Set an S3 bucket policy to allow read-only access to the objects.',
    answerVariants: [
      'A. Use one EC2 file server and publish files through an ALB.',
      'B. Create a new Amazon S3 bucket with S3 Versioning enabled. Use S3 Object Lock with a retention period in accordance with the designated date. Configure the S3 bucket for static website hosting. Set an S3 bucket policy to allow read-only access to the objects.',
      'C. Use S3 Standard only with lifecycle transitions and no retention lock.',
      'D. Use Amazon EFS with public mount targets and read-only NFS exports.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 479,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is making a prototype of the infrastructure for its new website by manually provisioning the necessary infrastructure. This infrastructure includes an Auto Scaling group, an Application Load Balancer and an Amazon RDS database. After the configuration has been thoroughly validated, the company wants the capability to immediately deploy the infrastructure for development and production use in two Availability Zones in an automated fashion. What should a solutions architect recommend to meet these requirements?',
    answer: 'B. Define the infrastructure as a template by using the prototype infrastructure as a guide. Deploy the infrastructure with AWS CloudFormation.',
    answerVariants: [
      'A. Snapshot each resource manually and clone it for production.',
      'B. Define the infrastructure as a template by using the prototype infrastructure as a guide. Deploy the infrastructure with AWS CloudFormation.',
      'C. Use AWS Systems Manager Run Command to create resources at startup.',
      'D. Use Terraform Cloud only for networking and manual console setup for databases.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 480,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A business application is hosted on Amazon EC2 and uses Amazon S3 for encrypted object storage. The chief information security officer has directed that no application traffic between the two services should traverse the public internet. Which capability should the solutions architect use to meet the compliance requirements?',
    answer: 'B. VPC endpoint',
    answerVariants: [
      'A. Internet gateway with restrictive NACLs.',
      'B. VPC endpoint.',
      'C. NAT instance with TLS inspection.',
      'D. AWS Global Accelerator for private S3 routing.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 481,
    topicSlug: 'database-performance-and-caching',
    question: 'A company hosts a three-tier web application in the AWS Cloud. A Multi-AZAmazon RDS for MySQL server forms the database layer Amazon ElastiCache forms the cache layer. The company wants a caching strategy that adds or updates data in the cache when a customer adds an item to the database. The data in the cache must always match the data in the database. Which solution will meet these requirements?',
    answer: 'B. Implement the write-through caching strategy',
    answerVariants: [
      'A. Implement cache-aside so writes go only to database first.',
      'B. Implement the write-through caching strategy.',
      'C. Implement lazy loading with cache TTL of 24 hours.',
      'D. Disable cache updates and refresh all cache entries nightly.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 482,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company wants to migrate 100 GB of historical data from an on-premises location to an Amazon S3 bucket. The company has a 100 megabits per second (Mbps) internet connection on premises. The company needs to encrypt the data in transit to the S3 bucket. The company will store new data directly in Amazon S3. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use AWS DataSync to migrate the data from the on-premises location to an S3 bucket',
    answerVariants: [
      'A. Use Snowball Edge for 100 GB and schedule device shipping.',
      'B. Use AWS DataSync to migrate the data from the on-premises location to an S3 bucket.',
      'C. Use S3 Transfer Acceleration without any migration service.',
      'D. Use Storage Gateway Tape Gateway for one-time migration.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 483,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company containerized a Windows job that runs on .NET 6 Framework under a Windows container. The company wants to run this job in the AWS Cloud. The job runs every 10 minutes. The job\'s runtime varies between 1 minute and 3 minutes. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Use Amazon Elastic Container Service (Amazon ECS) on AWS Fargate to run the job. Create a scheduled task based on the container image of the job to run every 10 minutes.',
    answerVariants: [
      'A. Run always-on EC2 Windows instances with cron every 10 minutes.',
      'B. Use Lambda for Windows containers with variable runtime control.',
      'C. Use Amazon Elastic Container Service (Amazon ECS) on AWS Fargate to run the job. Create a scheduled task based on the container image of the job to run every 10 minutes.',
      'D. Use EKS managed node groups with dedicated hosts for each job.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 484,
    topicSlug: 'identity-access-and-governance',
    question: 'A company wants to move from many standalone AWS accounts to a consolidated, multi-account architecture. The company plans to create many new AWS accounts for different business units. The company needs to authenticate access to these AWS accounts by using a centralized corporate directory service. Which combination of actions should a solutions architect recommend to meet these requirements? (Choose two.)',
    answer: 'A. Create a new organization in AWS Organizations with all features turned on. Create the new AWS accounts in the organization.',
    answerVariants: [
      'A. Create a new organization in AWS Organizations with all features turned on. Create the new AWS accounts in the organization.',
      'B. Keep standalone accounts and share IAM users across them.',
      'C. Use one AWS account and segment business units by tags only.',
      'D. Use Route 53 resolver rules for centralized account authentication.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 485,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company is looking for a solution that can store video archives in AWS from old news footage. The company needs to minimize costs and will rarely need to restore these files. When the files are needed, they must be available in a maximum of five minutes. What is the MOST cost-effective solution?',
    answer: 'A. Store the video archives in Amazon S3 Glacier and use Expedited retrievals.',
    answerVariants: [
      'A. Store the video archives in Amazon S3 Glacier and use Expedited retrievals.',
      'B. Store all archives in S3 Standard and archive quarterly.',
      'C. Store files in EFS Infrequent Access and replicate cross-Region.',
      'D. Store files in S3 Intelligent-Tiering frequent access tier only.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 486,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is building a three-tier application on AWS. The presentation tier will serve a static website The logic tier is a containerized application. This application will store data in a relational database. The company wants to simplify deployment and to reduce operational costs. Which solution will meet these requirements?',
    answer: 'A. Use Amazon S3 to host static content. Use Amazon Elastic Container Service (Amazon ECS) with AWS Fargate for compute power. Use a managed Amazon RDS cluster for the database.',
    answerVariants: [
      'A. Use Amazon S3 to host static content. Use Amazon Elastic Container Service (Amazon ECS) with AWS Fargate for compute power. Use a managed Amazon RDS cluster for the database.',
      'B. Host all tiers on one EC2 instance with local MySQL.',
      'C. Use Lambda for static site hosting and EC2 for relational database.',
      'D. Use Elastic Beanstalk single-instance environment for all tiers.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 487,
    topicSlug: 'storage-performance-patterns',
    question: 'A company seeks a storage solution for its application. The solution must be highly available and scalable. The solution also must function as a file system be mountable by multiple Linux instances in AWS and on premises through native protocols, and have no minimum size requirements. The company has set up a Site-to-Site VPN for access from its on-premises network to its VPC. Which storage solution meets these requirements?',
    answer: 'C. Amazon Elastic File System (Amazon EFS) with multiple mount targets',
    answerVariants: [
      'A. Amazon FSx for Lustre with one mount target and minimum 10 TB.',
      'B. Amazon S3 with POSIX file locking enabled.',
      'C. Amazon Elastic File System (Amazon EFS) with multiple mount targets.',
      'D. Amazon EBS gp3 volumes shared through Multi-Attach to on-premises hosts.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 488,
    topicSlug: 'identity-access-and-governance',
    question: 'A 4-year-old media company is using the AWS Organizations all features feature set to organize its AWS accounts. According to the company\'s finance team, the billing information on the member accounts must not be accessible to anyone, including the root user of the member accounts. Which solution will meet these requirements?',
    answer: 'C. Create a service control policy (SCP) to deny access to the billing information. Attach the SCP to the root organizational unit (OU).',
    answerVariants: [
      'A. Remove IAM users from member accounts and use root only.',
      'B. Use IAM permission boundaries in each account without Organizations controls.',
      'C. Create a service control policy (SCP) to deny access to the billing information. Attach the SCP to the root organizational unit (OU).',
      'D. Disable consolidated billing and manage invoices separately.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 489,
    topicSlug: 'event-driven-and-messaging',
    question: 'An ecommerce company runs an application in the AWS Cloud that is integrated with an on-premises warehouse solution. The company uses Amazon Simple Notification Service (Amazon SNS) to send order messages to an on-premises HTTPS endpoint so the warehouse application can process the orders. The local data center team has detected that some of the order messages were not received.',
    answer: 'A. Configure an Amazon SQS dead-letter queue for the SNS subscription to capture undelivered messages for up to 14 days and analysis.',
    answerVariants: [
      'A. Configure an Amazon SQS dead-letter queue for the SNS subscription to capture undelivered messages for up to 14 days and analysis.',
      'B. Increase SNS message size limits and retry window to 30 days.',
      'C. Replace SNS with Kinesis Data Streams and poll from the warehouse endpoint.',
      'D. Write failed HTTPS deliveries to DynamoDB streams automatically.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 490,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A gaming company uses Amazon DynamoDB to store user information such as geographic location, player data, and leaderboards. The company needs to configure continuous backups to an Amazon S3 bucket with a minimal amount of coding. The backups must not affect availability of the application and must not affect the read capacity units (RCUs) that are defined for the table. Which solution meets these requirements?',
    answer: 'B. Export the data directly from DynamoDB to Amazon S3 with continuous backups. Turn on point-in-time recovery for the table.',
    answerVariants: [
      'A. Use Lambda to scan the table every minute and upload JSON to S3.',
      'B. Export the data directly from DynamoDB to Amazon S3 with continuous backups. Turn on point-in-time recovery for the table.',
      'C. Use DynamoDB Streams and Kinesis Data Firehose only for backups.',
      'D. Use AWS Backup snapshots hourly and disable PITR.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 491,
    topicSlug: 'compute-cost-optimization',
    question: 'A solutions architect is designing an asynchronous application to process credit card data validation requests for a bank. The application must be secure and be able to process each request at least once. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Use Amazon SQS to queue validation requests and process them with AWS Lambda using idempotency controls for at-least-once processing.',
    answerVariants: [
      'A. Use API Gateway synchronous calls to a single EC2 instance.',
      'B. Use SNS fanout only and rely on email confirmations for completion.',
      'C. Use Amazon SQS to queue validation requests and process them with AWS Lambda using idempotency controls for at-least-once processing.',
      'D. Use AWS Batch jobs on dedicated hosts for each request.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 492,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has multiple AWS accounts for development work. Some staff consistently use oversized Amazon EC2 instances, which causes the company to exceed the yearly budget for the development accounts. The company wants to centrally restrict the creation of AWS resources in these accounts. Which solution will meet these requirements with the LEAST development effort?',
    answer: 'B. Use AWS Organizations to organize the accounts into organizational units (OUs). Define and attach a service control policy (SCP) to control the usage of EC2 instance types.',
    answerVariants: [
      'A. Use IAM policies in each account manually and audit quarterly.',
      'B. Use AWS Organizations to organize the accounts into organizational units (OUs). Define and attach a service control policy (SCP) to control the usage of EC2 instance types.',
      'C. Use trusted advisor checks and notify users about oversized instances.',
      'D. Use budget alerts only without preventive controls.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 493,
    topicSlug: 'exam-preparation',
    question: 'A company wants to use artificial intelligence (AI) to determine the quality of its customer service calls. The company currently manages calls in four different languages, including English. The company will offer new languages in the future. The company does not have the resources to regularly maintain machine learning (ML) models. The company needs to create written sentiment analysis reports from the customer service call recordings. The customer service call recording text must be translated into English. Which combination of steps will meet these requirements? (Choose three.)',
    answer: 'D. Use Amazon Transcribe to convert the audio recordings in any language into text.',
    answerVariants: [
      'A. Build and maintain custom speech models on EC2 for each language.',
      'B. Use AWS Polly to transcribe calls and detect sentiment directly.',
      'C. Use Comprehend Medical for all call-center domains and translations.',
      'D. Use Amazon Transcribe to convert the audio recordings in any language into text.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 494,
    topicSlug: 'compute-selection-and-scaling',
    question: 'D. The request to terminate the EC2 instance does not originate from the CIDR blocks 192.0.2.0/24 or 203.0.113.0/24.',
    answer: 'D. The request to terminate the EC2 instance does not originate from the CIDR blocks 192.0.2.0/24 or 203.0.113.0/24.',
    answerVariants: [
      'A. The request uses MFA but is made from an approved CIDR block.',
      'B. The request is signed by an IAM role that has terminate permissions.',
      'C. The request includes a required tag for environment = dev.',
      'D. The request to terminate the EC2 instance does not originate from the CIDR blocks 192.0.2.0/24 or 203.0.113.0/24.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 495,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is conducting an internal audit. The company wants to ensure that the data in an Amazon S3 bucket that is associated with the company\'s AWS Lake Formation data lake does not contain sensitive customer or employee data. The company wants to discover personally identifiable information (PII) or financial information, including passport numbers and credit card numbers. Which solution will meet these requirements?',
    answer: 'C. Configure Amazon Macie to run a data discovery job that uses managed identifiers for the required data types.',
    answerVariants: [
      'A. Use AWS Config conformance packs to inspect object content for PII.',
      'B. Use GuardDuty findings to classify S3 documents by sensitivity.',
      'C. Configure Amazon Macie to run a data discovery job that uses managed identifiers for the required data types.',
      'D. Use S3 Inventory reports to detect passport and credit card numbers.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 496,
    topicSlug: 'storage-performance-patterns',
    question: 'A company uses on-premises servers to host its applications. The company is running out of storage capacity. The applications use both block storage and NFS storage. The company needs a high-performing solution that supports local caching without re-architecting its existing applications. Which combination of actions should a solutions architect take to meet these requirements? (Choose two.)',
    answer: 'B. Deploy an AWS Storage Gateway file gateway to replace NFS storage.',
    answerVariants: [
      'A. Replace both block and NFS storage with S3 Standard and rewrite applications.',
      'B. Deploy an AWS Storage Gateway file gateway to replace NFS storage.',
      'C. Use AWS Backup only to provide local caching and file shares.',
      'D. Use EFS mount targets on premises without network connectivity changes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 497,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has a service that reads and writes large amounts of data from an Amazon S3 bucket in the same AWS Region. The service is deployed on Amazon EC2 instances within the private subnet of a VPC. The service communicates with Amazon S3 over a NAT gateway in the public subnet. However, the company wants a solution that will reduce the data output costs. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Provision a VPC gateway endpoint. Configure the route table for the private subnet to use the gateway endpoint as the route for all S3 traffic.',
    answerVariants: [
      'A. Add more NAT gateways in each AZ to reduce data transfer charges.',
      'B. Use an interface endpoint for S3 to replace all route table updates.',
      'C. Provision a VPC gateway endpoint. Configure the route table for the private subnet to use the gateway endpoint as the route for all S3 traffic.',
      'D. Move EC2 instances to public subnets and access S3 directly.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 498,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company uses Amazon S3 to store high-resolution pictures in an S3 bucket. To minimize application changes, the company stores the pictures as the latest version of an S3 object. The company needs to retain only the two most recent versions of the pictures. The company wants to reduce costs. The company has identified the S3 bucket as a large expense. Which solution will reduce the S3 costs with the LEAST operational overhead?',
    answer: 'A. Use S3 Lifecycle to delete expired object versions and retain the two most recent versions.',
    answerVariants: [
      'A. Use S3 Lifecycle to delete expired object versions and retain the two most recent versions.',
      'B. Disable versioning and overwrite objects in place forever.',
      'C. Transition all noncurrent versions to S3 Glacier Deep Archive with no expiration.',
      'D. Replicate all versions to another Region and clean up manually.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 499,
    topicSlug: 'network-performance-and-hybrid',
    question: 'A company needs to minimize the cost of its 1 Gbps AWS Direct Connect connection. The company\'s average connection utilization is less than 10%. A solutions architect must recommend a solution that will reduce the cost without compromising security. Which solution will meet these requirements?',
    answer: 'D. Contact an AWS Direct Connect Partner to order a 200 Mbps hosted connection for an existing AWS account.',
    answerVariants: [
      'A. Keep the 1 Gbps dedicated connection and lower utilization alarms.',
      'B. Replace Direct Connect with internet VPN over one consumer ISP.',
      'C. Move all traffic to NAT gateways and remove private connectivity.',
      'D. Contact an AWS Direct Connect Partner to order a 200 Mbps hosted connection for an existing AWS account.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 500,
    topicSlug: 'storage-performance-patterns',
    question: 'A company has multiple Windows file servers on premises. The company wants to migrate and consolidate its files into an Amazon FSx for Windows File Server file system. File permissions must be preserved to ensure that access rights do not change. Which solutions will meet these requirements? (Choose two.)',
    answer: 'A. Deploy AWS DataSync agents on premises. Schedule DataSync tasks to transfer the data to the FSx for Windows File Server file system.',
    answerVariants: [
      'A. Deploy AWS DataSync agents on premises. Schedule DataSync tasks to transfer the data to the FSx for Windows File Server file system.',
      'B. Use S3 multipart uploads and copy files manually to FSx later.',
      'C. Use AWS Storage Gateway volume gateway for SMB ACL preservation only.',
      'D. Use Amazon EFS as an intermediate target and robocopy without metadata options.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 501,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company wants to ingest customer payment data into the company\'s data lake in Amazon S3. The company receives payment data every minute on average. The company wants to analyze the payment data in real time. Then the company wants to ingest the data into the data lake. Which solution will meet these requirements with the MOST operational efficiency?',
    answer: 'C. Use Amazon Kinesis Data Firehose to ingest data. Use Amazon Kinesis Data Analytics to analyze the data in real time.',
    answerVariants: [
      'A. Use AWS Glue crawlers every hour and batch load results to S3.',
      'B. Stream events to Amazon SQS and run a nightly EMR job.',
      'C. Use Amazon Kinesis Data Firehose to ingest data. Use Amazon Kinesis Data Analytics to analyze the data in real time.',
      'D. Send data to Amazon SNS and subscribe Amazon S3 directly.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 502,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a website that uses a content management system (CMS) on Amazon EC2. The CMS runs on a single EC2 instance and uses an Amazon Aurora MySQL Multi-AZ DB instance for the data tier. Website images are stored on an Amazon Elastic Block Store (Amazon EBS) volume that is mounted inside the EC2 instance. Which combination of actions should a solutions architect take to improve the performance and resilience of the website? (Choose two.)',
    answer: 'C. Move the website images onto an Amazon Elastic File System (Amazon EFS) file system that is mounted on every EC2 instance.',
    answerVariants: [
      'A. Keep images on one EBS volume and increase its size.',
      'B. Store images in instance store volumes on each web server.',
      'C. Move the website images onto an Amazon Elastic File System (Amazon EFS) file system that is mounted on every EC2 instance.',
      'D. Keep images in Aurora as BLOBs to improve durability.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 503,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs an infrastructure monitoring service. The company is building a new feature that will enable the service to monitor data in customer AWS accounts. The new feature will call AWS APIs in customer accounts to describe Amazon EC2 instances and read Amazon CloudWatch metrics. What should the company do to obtain access to customer accounts in the MOST secure way?',
    answer: 'A. Ensure that the customers create an IAM role in their account with read-only EC2 and CloudWatch permissions and a trust policy to the company\'s account.',
    answerVariants: [
      'A. Ensure that the customers create an IAM role in their account with read-only EC2 and CloudWatch permissions and a trust policy to the company\'s account.',
      'B. Ask customers to share root account credentials through a secure channel.',
      'C. Ask customers to create IAM users and send long-lived access keys.',
      'D. Use one central IAM user in the company account for all customer accounts.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 504,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company needs to connect several VPCs in the us-east-1 Region that span hundreds of AWS accounts. The company\'s networking team has its own AWS account to manage the cloud network. What is the MOST operationally efficient solution to connect the VPCs?',
    answer: 'C. Create an AWS Transit Gateway in the networking team\'s AWS account. Configure static routes from each VPC.',
    answerVariants: [
      'A. Create full-mesh VPC peering between all accounts and VPCs.',
      'B. Use one Site-to-Site VPN per VPC to a central EC2 router.',
      'C. Create an AWS Transit Gateway in the networking team\'s AWS account. Configure static routes from each VPC.',
      'D. Expose each VPC through an internet-facing Network Load Balancer.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 505,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has Amazon EC2 instances that run nightly batch jobs to process data. The EC2 instances run in an Auto Scaling group that uses On-Demand billing. If a job fails on one instance, another instance will reprocess the job. The batch jobs run between 12:00 AM and 06:00 AM local time every day. Which solution will provide EC2 instances to meet these requirements MOST cost-effectively?',
    answer: 'C. Create a new launch template for the Auto Scaling group. Set the instances to Spot Instances. Set a policy to scale out based on CPU usage.',
    answerVariants: [
      'A. Keep On-Demand Instances and purchase Dedicated Hosts.',
      'B. Replace the Auto Scaling group with one large Reserved Instance.',
      'C. Create a new launch template for the Auto Scaling group. Set the instances to Spot Instances. Set a policy to scale out based on CPU usage.',
      'D. Move the workload to AWS Lambda with no retry strategy.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 506,
    topicSlug: 'storage-performance-patterns',
    question: 'A social media company is building a feature for its website. The feature will give users the ability to upload photos. The company expects significant increases in demand during large events and must ensure that the website can handle the upload traffic from users. Which solution meets these requirements with the MOST scalability?',
    answer: 'C. Generate Amazon S3 presigned URLs in the application. Upload files directly from the user\'s browser into an S3 bucket.',
    answerVariants: [
      'A. Proxy all uploads through one EC2 instance in a public subnet.',
      'B. Store files first in EBS and copy to S3 by cron job.',
      'C. Generate Amazon S3 presigned URLs in the application. Upload files directly from the user\'s browser into an S3 bucket.',
      'D. Use CloudFront signed cookies to write directly to EBS.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 507,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a web application for travel ticketing. The application is based on a database that runs in a single data center in North America. The company wants to expand the application to serve a global user base. The company needs to deploy the application to multiple AWS Regions. Average latency must be less than 1 second on updates to the reservation database. The company wants to have separate deployments of its web platform across multiple Regions. However, the company must maintain a single primary reservation database that is globally consistent. Which solution should a solutions architect recommend to meet these requirements?',
    answer: 'A. Convert the application to use Amazon DynamoDB. Use a global table for the center reservation table. Use the correct Regional endpoint in each Regional deployment.',
    answerVariants: [
      'A. Convert the application to use Amazon DynamoDB. Use a global table for the center reservation table. Use the correct Regional endpoint in each Regional deployment.',
      'B. Keep one primary database on premises and route all regions to it over VPN.',
      'C. Replicate nightly exports of reservations between Regions in S3.',
      'D. Use Route 53 weighted routing with separate independent databases.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 508,
    topicSlug: 'compute-selection-and-scaling',
    question: 'Topic 1',
    answer: 'A. Use AWS Backup with a backup policy in AWS Organizations to automate scheduled AMI and snapshot backups across accounts and Regions.',
    answerVariants: [
      'A. Use AWS Backup with a backup policy in AWS Organizations to automate scheduled AMI and snapshot backups across accounts and Regions.',
      'B. Create AMIs manually each month from the console.',
      'C. Use AWS Config snapshots as the sole backup mechanism.',
      'D. Copy EBS volumes to S3 with custom scripts on each instance.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 509,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company operates a two-tier application for image processing. The application uses two Availability Zones, each with one public subnet and one private subnet. An Application Load Balancer (ALB) for the web tier uses the public subnets. Amazon EC2 instances for the application tier use the private subnets. Users report that the application is running more slowly than expected. A security audit of the web server log files shows that the application is receiving millions of illegitimate requests from a small number of IP addresses. A solutions architect needs to resolve the immediate performance problem while the company investigates a more permanent solution. What should the solutions architect recommend to meet this requirement?',
    answer: 'B. Modify the network ACL for the web tier subnets. Add an inbound deny rule for the IP addresses that are consuming resources.',
    answerVariants: [
      'A. Increase ALB idle timeout to absorb malicious traffic spikes.',
      'B. Modify the network ACL for the web tier subnets. Add an inbound deny rule for the IP addresses that are consuming resources.',
      'C. Move the application tier to public subnets for faster filtering.',
      'D. Disable Auto Scaling to reduce resource churn during attacks.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 510,
    topicSlug: 'network-security-controls',
    question: 'A global marketing company has applications that run in the ap-southeast-2 Region and the eu-west-1 Region. Applications that run in a VPC in eu-west-1 need to communicate securely with databases that run in a VPC in ap-southeast-2. Which network design will meet these requirements?',
    answer: 'C. Configure a VPC peering connection between the ap-southeast-2 VPC and the eu-west-1 VPC. Update the subnet route tables. Create an inbound rule in the ap-southeast-2 database security group that allows traffic from the eu-west-1 application server IP addresses.',
    answerVariants: [
      'A. Use CloudFront origin failover between the two VPCs.',
      'B. Use one internet gateway and public IPs for database access.',
      'C. Configure a VPC peering connection between the ap-southeast-2 VPC and the eu-west-1 VPC. Update the subnet route tables. Create an inbound rule in the ap-southeast-2 database security group that allows traffic from the eu-west-1 application server IP addresses.',
      'D. Use S3 Cross-Region Replication as a transport layer for SQL traffic.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 511,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is developing software that uses a PostgreSQL database schema. The company needs to configure multiple development environments and databases for the company\'s developers. On average, each development environment is used for half of the 8-hour workday. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Configure each development environment with its own Amazon Aurora On-Demand PostgreSQL-Compatible database',
    answerVariants: [
      'A. Provision one large provisioned Aurora cluster shared by all developers.',
      'B. Run self-managed PostgreSQL on always-on EC2 instances per developer.',
      'C. Configure each development environment with its own Amazon Aurora On-Demand PostgreSQL-Compatible database',
      'D. Use Amazon Redshift for each development environment database.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 512,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Organizations with resources tagged by account. The company also uses AWS Backup to back up its AWS infrastructure resources. The company needs to back up all AWS resources. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use AWS Config to identify all untagged resources. Tag the identified resources programmatically. Use tags in the backup plan.',
    answerVariants: [
      'A. Use AWS Config to identify all untagged resources. Tag the identified resources programmatically. Use tags in the backup plan.',
      'B. Back up resources manually each month and track exclusions in a spreadsheet.',
      'C. Create separate backup plans per account without organization tagging standards.',
      'D. Use CloudTrail logs only to infer which resources need backup.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 513,
    topicSlug: 'storage-performance-patterns',
    question: 'A social media company wants to allow its users to upload images in an application that is hosted in the AWS Cloud. The company needs a solution that automatically resizes the images so that the images can be displayed on multiple device types. The application experiences unpredictable traffic patterns throughout the day. The company is seeking a highly available solution that maximizes scalability. What should a solutions architect do to meet these requirements?',
    answer: 'A. Create a static website hosted in Amazon S3 that invokes AWS Lambda functions to resize the images and store the images in an Amazon S3 bucket.',
    answerVariants: [
      'A. Create a static website hosted in Amazon S3 that invokes AWS Lambda functions to resize the images and store the images in an Amazon S3 bucket.',
      'B. Run image resizing on one EC2 instance with a local file cache.',
      'C. Use EBS snapshots to generate resized thumbnails asynchronously.',
      'D. Use AWS Batch with fixed workers for each image upload.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 514,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is running a microservices application on Amazon EC2 instances. The company wants to migrate the application to an Amazon Elastic Kubernetes Service (Amazon EKS) cluster for scalability. The company must configure the Amazon EKS control plane with endpoint private access set to true and endpoint public access set to false to maintain security compliance. The company must also put the data plane in private subnets. However, the company has received error notifications because the node cannot join the cluster. Which solution will allow the node to join the cluster?',
    answer: 'B. Create interface VPC endpoints to allow nodes to access the control plane.',
    answerVariants: [
      'A. Enable public endpoint access and whitelist all node subnet CIDRs.',
      'B. Create interface VPC endpoints to allow nodes to access the control plane.',
      'C. Place worker nodes in public subnets and add internet gateways.',
      'D. Use VPC peering to a separate cluster that has public access enabled.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 515,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is migrating an on-premises application to AWS. The company wants to use Amazon Redshift as a solution. Which use cases are suitable for Amazon Redshift in this scenario? (Choose three.)',
    answer: 'A. Use Amazon Redshift for large-scale analytics and data warehousing workloads, not for OLTP transaction processing.',
    answerVariants: [
      'A. Use Amazon Redshift for large-scale analytics and data warehousing workloads, not for OLTP transaction processing.',
      'B. Use Amazon Redshift as the primary OLTP engine for row-level transactions.',
      'C. Use Amazon Redshift for in-memory caching of API session state.',
      'D. Use Amazon Redshift as a replacement for Amazon S3 object archival.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 516,
    topicSlug: 'edge-and-global-routing',
    question: 'A company provides an API interface to customers so the customers can retrieve their financial information. he company expects a larger number of requests during peak usage times of the year. The company requires the API to respond consistently with low latency to ensure customer satisfaction. The company needs to provide a compute host for the API. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use Amazon API Gateway and AWS Lambda functions with provisioned concurrency.',
    answerVariants: [
      'A. Run API servers on one EC2 instance with scheduled scale-up.',
      'B. Use Amazon API Gateway and AWS Lambda functions with provisioned concurrency.',
      'C. Use Amazon SQS with polling clients for synchronous API calls.',
      'D. Use AWS Batch jobs behind an ALB for request handling.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 517,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company wants to send all AWS Systems Manager Session Manager logs to an Amazon S3 bucket for archival purposes. Which solution will meet this requirement with the MOST operational efficiency?',
    answer: 'A. Enable S3 logging in the Systems Manager console. Choose an S3 bucket to send the session data to.',
    answerVariants: [
      'A. Enable S3 logging in the Systems Manager console. Choose an S3 bucket to send the session data to.',
      'B. Forward Session Manager logs to CloudFront standard logs.',
      'C. Export logs manually from CloudWatch each week and upload to S3.',
      'D. Install a custom agent on every instance to copy shell history.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 518,
    topicSlug: 'database-performance-and-caching',
    question: 'An application uses an Amazon RDS MySQL DB instance. The RDS database is becoming low on disk space. A solutions architect wants to increase the disk space without downtime. Which solution meets these requirements with the LEAST amount of effort?',
    answer: 'A. Enable storage autoscaling in RDS',
    answerVariants: [
      'A. Enable storage autoscaling in RDS',
      'B. Restart the DB instance with a larger instance class every week.',
      'C. Convert the database to DynamoDB to gain unlimited storage.',
      'D. Delete old tables manually to avoid volume scaling.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 519,
    topicSlug: 'exam-preparation',
    question: 'A consulting company provides professional services to customers worldwide. The company provides solutions and tools for customers to expedite gathering and analyzing data on AWS. The company needs to centrally manage and deploy a common set of solutions and tools for customers to use for self-service purposes. Which solution will meet these requirements?',
    answer: 'B. Create AWS Service Catalog products for the customers.',
    answerVariants: [
      'A. Share CloudFormation templates by email and ask customers to deploy manually.',
      'B. Create AWS Service Catalog products for the customers.',
      'C. Provide one shared admin account that all customers can use.',
      'D. Publish AMIs only and require customers to complete post-deployment setup.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 520,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is designing a new web application that will run on Amazon EC2 Instances. The application will use Amazon DynamoDB for backend data storage. The application traffic will be unpredictable. The company expects that the application read and write throughput to the database will be moderate to high. The company needs to scale in response to application traffic. Which DynamoDB table configuration will meet these requirements MOST cost-effectively?',
    answer: 'B. Configure DynamoDB in on-demand mode by using the DynamoDB Standard table class.',
    answerVariants: [
      'A. Configure provisioned capacity with fixed RCU/WCU and no auto scaling.',
      'B. Configure DynamoDB in on-demand mode by using the DynamoDB Standard table class.',
      'C. Use DynamoDB Standard-IA for heavy read/write transactional traffic.',
      'D. Use one global secondary index as the primary scaling mechanism.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 521,
    topicSlug: 'identity-access-and-governance',
    question: 'A retail company has several businesses. The IT team for each business manages its own AWS account. Each team account is part of an organization in AWS Organizations. Each team monitors its product inventory levels in an Amazon DynamoDB table in the team\'s own AWS account. The company is deploying a central inventory reporting application into a shared AWS account. The application must be able to read items from all the teams\' DynamoDB tables. Which authentication option will meet these requirements MOST securely?',
    answer: 'C. In every business account, create an IAM role named BU_ROLE with a policy that gives the role access to the DynamoDB table and a trust policy to trust a specific role in the inventory application account. In the inventory account, create a role named APP_ROLE that allows access to the STS AssumeRole API operation. Configure the application to use APP_ROLE and assume the crossaccount role BU_ROLE to read the DynamoDB table.',
    answerVariants: [
      'A. Share root credentials from each business account with the central app.',
      'B. Create one IAM user per business account and store all keys centrally.',
      'C. In every business account, create an IAM role named BU_ROLE with a policy that gives the role access to the DynamoDB table and a trust policy to trust a specific role in the inventory application account. In the inventory account, create a role named APP_ROLE that allows access to the STS AssumeRole API operation. Configure the application to use APP_ROLE and assume the crossaccount role BU_ROLE to read the DynamoDB table.',
      'D. Use DynamoDB resource policies that allow all principals in the organization.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 522,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs container applications by using Amazon Elastic Kubernetes Service (Amazon EKS). The company\'s workload is not consistent throughout the day. The company wants Amazon EKS to scale in and out according to the workload. Which combination of steps will meet these requirements with the LEAST operational overhead? (Choose two.)',
    answer: 'B. Use the Kubernetes Metrics Server for Horizontal Pod Autoscaling.',
    answerVariants: [
      'A. Disable autoscaling and size node groups for peak usage.',
      'B. Use the Kubernetes Metrics Server for Horizontal Pod Autoscaling.',
      'C. Scale only worker nodes manually once per week.',
      'D. Replace EKS with fixed-size EC2 Auto Scaling groups only.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 523,
    topicSlug: 'edge-and-global-routing',
    question: 'A company runs a microservice-based serverless web application. The application must be able to retrieve data from multiple Amazon DynamoDB tables A solutions architect needs to give the application the ability to retrieve the data with no impact on the baseline performance of the application. Which solution will meet these requirements in the MOST operationally efficient way?',
    answer: 'B. Amazon CloudFront with Lambda@Edge functions',
    answerVariants: [
      'A. Query all DynamoDB tables synchronously in a single Lambda function.',
      'B. Amazon CloudFront with Lambda@Edge functions',
      'C. Use Route 53 latency-based routing with no caching layer.',
      'D. Move all data into one large S3 object and read per request.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 524,
    topicSlug: 'identity-access-and-governance',
    question: 'A company wants to analyze and troubleshoot Access Denied errors and Unauthorized errors that are related to IAM permissions. The company has AWS CloudTrail turned on. Which solution will meet these requirements with the LEAST effort?',
    answer: 'C. Search CloudTrail logs with Amazon Athena queries to identify the errors.',
    answerVariants: [
      'A. Enable VPC Flow Logs and inspect network deny entries only.',
      'B. Enable GuardDuty and use findings as IAM troubleshooting records.',
      'C. Search CloudTrail logs with Amazon Athena queries to identify the errors.',
      'D. Use AWS Trusted Advisor to list all unauthorized API calls.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 525,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to add its existing AWS usage cost to its operation cost dashboard. A solutions architect needs to recommend a solution that will give the company access to its usage cost programmatically. The company must be able to access cost data for the current year and forecast costs for the next 12 months. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Access usage cost-related data by using the AWS Cost Explorer API with pagination.',
    answerVariants: [
      'A. Access usage cost-related data by using the AWS Cost Explorer API with pagination.',
      'B. Parse monthly PDF bills from the console for dashboard updates.',
      'C. Pull only CloudTrail logs and estimate costs from API counts.',
      'D. Use AWS Budgets alerts without any programmatic API access.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 526,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect is reviewing the resilience of an application. The solutions architect notices that a database administrator recently failed over the application\'s Amazon Aurora PostgreSQL database writer instance as part of a scaling exercise. The failover resulted in 3 minutes of downtime for the application. Which solution will reduce the downtime for scaling exercises with the LEAST operational overhead?',
    answer: 'D. Set up an Amazon RDS proxy for the database. Update the application to use the proxy endpoint.',
    answerVariants: [
      'A. Increase DB instance class and keep direct app connections.',
      'B. Force manual retries in the application after each failover event.',
      'C. Use DNS TTL of 1 second on database endpoints.',
      'D. Set up an Amazon RDS proxy for the database. Update the application to use the proxy endpoint.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 527,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a regional subscription-based streaming service that runs in a single AWS Region. The architecture consists of web servers and application servers on Amazon EC2 instances. The EC2 instances are in Auto Scaling groups behind Elastic Load Balancers. The architecture includes an Amazon Aurora global database cluster that extends across multiple Availability Zones. The company wants to expand globally and to ensure that its application has minimal downtime. Which solution will provide the MOST fault tolerance?',
    answer: 'D. Deploy the web tier and the application tier to a second Region. Use an Amazon Aurora global database to deploy the database in the primary Region and the second Region. Use Amazon Route 53 health checks with a failover routing policy to the second Region. Promote the secondary to primary as needed.',
    answerVariants: [
      'A. Keep single-Region compute and add more instances in that Region.',
      'B. Use CloudFront only, without multi-Region backend deployments.',
      'C. Configure two Regions but use manual DNS cutover only during incidents.',
      'D. Deploy the web tier and the application tier to a second Region. Use an Amazon Aurora global database to deploy the database in the primary Region and the second Region. Use Amazon Route 53 health checks with a failover routing policy to the second Region. Promote the secondary to primary as needed.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 528,
    topicSlug: 'exam-preparation',
    question: 'Question content not provided in source file.',
    answer: 'B. Use AWS Resource Access Manager (AWS RAM) and centrally managed infrastructure patterns so teams can consume shared resources securely.',
    answerVariants: [
      'A. Create a single shared root account for all teams to reduce setup time.',
      'B. Use AWS Resource Access Manager (AWS RAM) and centrally managed infrastructure patterns so teams can consume shared resources securely.',
      'C. Ask each team to duplicate all infrastructure manually in separate accounts.',
      'D. Use only account-level IAM users and email distribution lists for access.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 529,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is migrating its workloads to AWS. The company has transactional and sensitive data in its databases. The company wants to use AWS Cloud solutions to increase security and reduce operational overhead for the databases. Which solution will meet these requirements?',
    answer: 'B. Migrate the databases to Amazon RDS Configure encryption at rest.',
    answerVariants: [
      'A. Keep self-managed databases on EC2 and disable encryption for performance.',
      'B. Migrate the databases to Amazon RDS Configure encryption at rest.',
      'C. Store database passwords in source code and rotate quarterly.',
      'D. Use S3 object encryption only and keep database volumes unencrypted.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 530,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has an online gaming application that has TCP and UDP multiplayer gaming capabilities. The company uses Amazon Route 53 to point the application traffic to multiple Network Load Balancers (NLBs) in different AWS Regions. The company needs to improve application performance and decrease latency for the online game in preparation for user growth. Which solution will meet these requirements?',
    answer: 'C. Add AWS Global Accelerator in front of the NLBs. Configure a Global Accelerator endpoint to use the correct listener ports.',
    answerVariants: [
      'A. Use Route 53 geolocation routing only with existing NLB endpoints.',
      'B. Use CloudFront to accelerate both TCP and UDP game traffic.',
      'C. Add AWS Global Accelerator in front of the NLBs. Configure a Global Accelerator endpoint to use the correct listener ports.',
      'D. Replace NLBs with ALBs and enable sticky sessions globally.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 531,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company needs to integrate with a third-party data feed. The data feed sends a webhook to notify an external service when new data is ready for consumption. A developer wrote an AWS Lambda function to retrieve data when the company receives a webhook callback. The developer must make the Lambda function available for the third party to call. Which solution will meet these requirements with the MOST operational efficiency?',
    answer: 'A. Create a function URL for the Lambda function. Provide the Lambda function URL to the third party for the webhook.',
    answerVariants: [
      'A. Create a function URL for the Lambda function. Provide the Lambda function URL to the third party for the webhook.',
      'B. Run the webhook receiver on a private Lambda invoked only through EventBridge.',
      'C. Publish the Lambda ARN and let the third party invoke it directly over STS.',
      'D. Put the Lambda function behind a private NLB with no public endpoint.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 532,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a workload in an AWS Region. Customers connect to and access the workload by using an Amazon API Gateway REST API. The company uses Amazon Route 53 as its DNS provider. The company wants to provide individual and secure URLs for all customers. Which combination of steps will meet these requirements with the MOST operational efficiency? (Choose three.)',
    answer: 'A. Register the required domain in a registrar. Create a wildcard custom domain name in a Route 53 hosted zone and record in the zone that points to the API Gateway endpoint.',
    answerVariants: [
      'A. Register the required domain in a registrar. Create a wildcard custom domain name in a Route 53 hosted zone and record in the zone that points to the API Gateway endpoint.',
      'B. Use one API Gateway execute-api hostname and append customer IDs in query strings.',
      'C. Provision one dedicated EC2 reverse proxy per customer for URL isolation.',
      'D. Use Route 53 private hosted zones for public customer endpoints.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 533,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company stores data in Amazon S3. According to regulations, the data must not contain personally identifiable information (PII). The company recently discovered that S3 buckets have some objects that contain PII. The company needs to automatically detect PII in S3 buckets and to notify the company\'s security team. Which solution will meet these requirements?',
    answer: 'A. Use Amazon Macie. Create an Amazon EventBridge rule to filter the SensitiveData event type from Macie findings and to send an Amazon Simple Notification Service (Amazon SNS) notification to the security team.',
    answerVariants: [
      'A. Use Amazon Macie. Create an Amazon EventBridge rule to filter the SensitiveData event type from Macie findings and to send an Amazon Simple Notification Service (Amazon SNS) notification to the security team.',
      'B. Use AWS Config managed rules to inspect object contents for PII patterns.',
      'C. Enable S3 server access logging and parse logs for credit card numbers.',
      'D. Trigger CloudTrail Insights and notify security on read spikes.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 534,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to build a logging solution for its multiple AWS accounts. The company currently stores the logs from all accounts in a centralized account. The company has created an Amazon S3 bucket in the centralized account to store the VPC flow logs and AWS CloudTrail logs. All logs must be highly available for 30 days for frequent analysis, retained for an additional 60 days for backup purposes, and deleted 90 days after creation. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'B. Transition objects to the S3 Standard-Infrequent Access (S3 Standard-IA) storage class 30 days after creation. Move all objects to the S3 Glacier Flexible Retrieval storage class after 90 days. Write an expiration action that directs Amazon S3 to delete objects after 90 days.',
    answerVariants: [
      'A. Keep all logs in S3 Standard for 90 days and then delete.',
      'B. Transition objects to the S3 Standard-Infrequent Access (S3 Standard-IA) storage class 30 days after creation. Move all objects to the S3 Glacier Flexible Retrieval storage class after 90 days. Write an expiration action that directs Amazon S3 to delete objects after 90 days.',
      'C. Move all logs to S3 Glacier Deep Archive on day 1.',
      'D. Export logs to EFS and delete from S3 after 30 days.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 535,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is building an Amazon Elastic Kubernetes Service (Amazon EKS) cluster for its workloads. All secrets that are stored in Amazon EKS must be encrypted in the Kubernetes etcd key-value store. Which solution will meet these requirements?',
    answer: 'B. Create a new AWS Key Management Service (AWS KMS) key. Enable Amazon EKS KMS secrets encryption on the Amazon EKS cluster.',
    answerVariants: [
      'A. Store Kubernetes secrets in plaintext and rely on private subnets.',
      'B. Create a new AWS Key Management Service (AWS KMS) key. Enable Amazon EKS KMS secrets encryption on the Amazon EKS cluster.',
      'C. Encrypt only container image layers with ECR KMS encryption.',
      'D. Use AWS Secrets Manager only, without enabling etcd encryption.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 536,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to provide data scientists with near real-time read-only access to the company\'s production Amazon RDS for PostgreSQL database. The database is currently configured as a Single-AZ database. The data scientists use complex queries that will not affect the production database. The company needs a solution that is highly available. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Change the setup from a Single-AZ to a Multi-AZ instance deployment. Provide two additional read replicas for the data scientists.',
    answerVariants: [
      'A. Keep Single-AZ and offload queries to exports in S3.',
      'B. Move analysts to the production writer endpoint with connection limits.',
      'C. Change the setup from a Single-AZ to a Multi-AZ instance deployment. Provide two additional read replicas for the data scientists.',
      'D. Migrate to Redshift and decommission PostgreSQL immediately.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 537,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a three-tier web application in the AWS Cloud that operates across three Availability Zones. The application architecture has an Application Load Balancer, an Amazon EC2 web server that hosts user session states, and a MySQL database that runs on an EC2 instance. The company expects sudden increases in application traffic. The company wants to be able to scale to meet future application capacity demands and to ensure high availability across all three Availability Zones. Which solution will meet these requirements?',
    answer: 'A. Migrate the MySQL database to Amazon RDS for MySQL with a Multi-AZ DB cluster deployment. Use Amazon ElastiCache for Redis with high availability to store session data and to cache reads. Migrate the web server to an Auto Scaling group that is in three Availability Zones.',
    answerVariants: [
      'A. Migrate the MySQL database to Amazon RDS for MySQL with a Multi-AZ DB cluster deployment. Use Amazon ElastiCache for Redis with high availability to store session data and to cache reads. Migrate the web server to an Auto Scaling group that is in three Availability Zones.',
      'B. Keep sessions in instance memory and add larger EC2 instances.',
      'C. Use one database EC2 instance with EBS Multi-Attach for HA.',
      'D. Use CloudFront cache only and keep backend architecture unchanged.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 538,
    topicSlug: 'event-driven-and-messaging',
    question: 'A global video streaming company uses Amazon CloudFront as a content distribution network (CDN). The company wants to roll out content in a phased manner across multiple countries. The company needs to ensure that viewers who are outside the countries to which the company rolls out content are not able to view the content. Which solution will meet these requirements?',
    answer: 'A. Add geographic restrictions to the content in CloudFront by using an allow list. Set up a custom error message.',
    answerVariants: [
      'A. Add geographic restrictions to the content in CloudFront by using an allow list. Set up a custom error message.',
      'B. Use signed URLs only; they automatically enforce country-level blocks.',
      'C. Block countries by using Route 53 geolocation routing for CloudFront.',
      'D. Use WAF IP sets only and map all country IP ranges manually.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 539,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to use the AWS Cloud to improve its on-premises disaster recovery (DR) configuration. The company\'s core production business application uses Microsoft SQL Server Standard, which runs on a virtual machine (VM). The application has a recovery point objective (RPO) of 30 seconds or fewer and a recovery time objective (RTO) of 60 minutes. The DR solution needs to minimize costs wherever possible. Which solution will meet these requirements?',
    answer: 'C. Use AWS Elastic Disaster Recovery to replicate the SQL Server VM continuously to AWS and fail over when needed to meet low RPO and moderate RTO.',
    answerVariants: [
      'A. Back up SQL Server once daily to S3 and restore manually during outages.',
      'B. Use AWS Backup weekly snapshots and perform manual VM rebuild in AWS.',
      'C. Use AWS Elastic Disaster Recovery to replicate the SQL Server VM continuously to AWS and fail over when needed to meet low RPO and moderate RTO.',
      'D. Use Storage Gateway volume snapshots with 4-hour replication intervals.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 540,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has an on-premises server that uses an Oracle database to process and store customer information. The company wants to use an AWS database service to achieve higher availability and to improve application performance. The company also wants to offload reporting from its primary database system. Which solution will meet these requirements in the MOST operationally efficient way?',
    answer: 'D. Use Amazon RDS deployed in a Multi-AZ instance deployment to create an Amazon Aurora database. Direct the reporting functions to the reader instances.',
    answerVariants: [
      'A. Lift and shift Oracle to one EC2 instance with EBS io2 volumes.',
      'B. Use DynamoDB for all relational reporting and transactional queries.',
      'C. Use RDS Single-AZ and run reporting on the primary instance only.',
      'D. Use Amazon RDS deployed in a Multi-AZ instance deployment to create an Amazon Aurora database. Direct the reporting functions to the reader instances.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 541,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to build a web application on AWS. Client access requests to the website are not predictable and can be idle for a long time. Only customers who have paid a subscription fee can have the ability to sign in and use the web application. Which combination of steps will meet these requirements MOST cost-effectively? (Choose three.)',
    answer: 'A. Create an AWS Lambda function to retrieve user information from Amazon DynamoDB. Create an Amazon API Gateway endpoint to accept RESTful APIs. Send the API calls to the Lambda function.',
    answerVariants: [
      'A. Create an AWS Lambda function to retrieve user information from Amazon DynamoDB. Create an Amazon API Gateway endpoint to accept RESTful APIs. Send the API calls to the Lambda function.',
      'B. Use always-on EC2 web servers and a fixed-size relational database cluster.',
      'C. Run the entire application on ECS with long-lived session state on instance disks.',
      'D. Use S3 static hosting with direct DynamoDB access from browsers without auth.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 542,
    topicSlug: 'edge-and-global-routing',
    question: 'A media company uses an Amazon CloudFront distribution to deliver content over the internet. The company wants only premium customers to have access to the media streams and file content. The company stores all content in an Amazon S3 bucket. The company also delivers content on demand to customers for a specific purpose, such as movie rentals or music downloads. Which solution will meet these requirements?',
    answer: 'B. Generate and provide CloudFront signed URLs to premium customers.',
    answerVariants: [
      'A. Make the S3 bucket public and filter users at the application layer only.',
      'B. Generate and provide CloudFront signed URLs to premium customers.',
      'C. Use CloudFront geo restrictions to identify paying customers.',
      'D. Use private Route 53 zones so only premium users can resolve DNS.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 543,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs Amazon EC2 instances in multiple AWS accounts that are individually bled. The company recently purchased a Savings Pian. Because of changes in the company\'s business requirements, the company has decommissioned a large number of EC2 instances. The company wants to use its Savings Plan discounts on its other AWS accounts. Which combination of steps will meet these requirements? (Choose two.)',
    answer: 'A. Turn on discount sharing in the management account and keep linked accounts under consolidated billing so unused Savings Plan commitment can apply to other accounts.',
    answerVariants: [
      'A. Turn on discount sharing in the management account and keep linked accounts under consolidated billing so unused Savings Plan commitment can apply to other accounts.',
      'B. Move each account to separate payer accounts to isolate discounts.',
      'C. Convert Savings Plans to Reserved Instances immediately in each account.',
      'D. Purchase dedicated hosts for all remaining workloads.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 544,
    topicSlug: 'edge-and-global-routing',
    question: 'A retail company uses a regional Amazon API Gateway API for its public REST APIs. The API Gateway endpoint is a custom domain name that points to an Amazon Route 53 alias record. A solutions architect needs to create a solution that has minimal effects on customers and minimal data loss to release the new version of APIs. Which solution will meet these requirements?',
    answer: 'A. Create a canary release deployment stage for API Gateway. Deploy the latest API version. Point an appropriate percentage of traffic to the canary stage. After API verification, promote the canary stage to the production stage.',
    answerVariants: [
      'A. Create a canary release deployment stage for API Gateway. Deploy the latest API version. Point an appropriate percentage of traffic to the canary stage. After API verification, promote the canary stage to the production stage.',
      'B. Create a second API and switch all traffic immediately via DNS.',
      'C. Replace the API with a new regional endpoint and deprecate the old one instantly.',
      'D. Use CloudFront origin groups to route API requests between versions.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 545,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to direct its users to a backup static error page if the company\'s primary website is unavailable. The primary website\'s DNS records are hosted in Amazon Route 53. The domain is pointing to an Application Load Balancer (ALB). The company needs a solution that minimizes changes and infrastructure overhead. Which solution will meet these requirements?',
    answer: 'B. Set up a Route 53 active-passive failover configuration. Direct traffic to a static error page that is hosted in an Amazon S3 bucket when Route 53 health checks determine that the ALB endpoint is unhealthy.',
    answerVariants: [
      'A. Create weighted records to split traffic between ALB and static error page.',
      'B. Set up a Route 53 active-passive failover configuration. Direct traffic to a static error page that is hosted in an Amazon S3 bucket when Route 53 health checks determine that the ALB endpoint is unhealthy.',
      'C. Use only ALB fixed-response rules to serve the backup page globally.',
      'D. Put the error page on EC2 in the same Auto Scaling group as the app.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 546,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A recent analysis of a company\'s IT expenses highlights the need to reduce backup costs. The company\'s chief information officer wants to simplify the on-premises backup infrastructure and reduce costs by eliminating the use of physical backup tapes. The company must preserve the existing investment in the on-premises backup applications and workflows. What should a solutions architect recommend?',
    answer: 'D. Set up AWS Storage Gateway to connect with the backup applications using the iSCSI-virtual tape library (VTL) interface.',
    answerVariants: [
      'A. Replace all backups with manual uploads to S3 from on-premises servers.',
      'B. Use AWS DataSync for tape emulation and long-term archive retention.',
      'C. Migrate all backup software to new cloud-native tools immediately.',
      'D. Set up AWS Storage Gateway to connect with the backup applications using the iSCSI-virtual tape library (VTL) interface.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 547,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has data collection sensors at different locations. The data collection sensors stream a high volume of data to the company. The company wants to design a platform on AWS to ingest and process high-volume streaming data. The solution must be scalable and support data collection in near real time. The company must store the data in Amazon S3 for future reporting. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use Amazon Kinesis Data Firehose to deliver streaming data to Amazon S3.',
    answerVariants: [
      'A. Use Amazon Kinesis Data Firehose to deliver streaming data to Amazon S3.',
      'B. Use Amazon MQ and poll from on-premises consumers every hour.',
      'C. Use SFTP uploads from each sensor to EC2 before S3 ingestion.',
      'D. Use SNS topic delivery directly to S3 for ordered streaming records.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 548,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has separate AWS accounts for its finance, data analytics, and development departments. Because of costs and security concerns, the company wants to control which services each AWS account can use. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Create organization units (OUs) for each department in AWS Organizations. Attach service control policies (SCPs) to the OUs.',
    answerVariants: [
      'A. Apply IAM permissions boundaries manually in each account for each team.',
      'B. Create organization units (OUs) for each department in AWS Organizations. Attach service control policies (SCPs) to the OUs.',
      'C. Use one shared root account and control service access with naming conventions.',
      'D. Create account-level deny policies on each role in every account.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 549,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has created a multi-tier application for its ecommerce website. The website uses an Application Load Balancer that resides in the public subnets, a web tier in the public subnets, and a MySQL cluster hosted on Amazon EC2 instances in the private subnets. The MySQL database needs to retrieve product catalog and pricing information that is hosted on the internet by a third-party provider. A solutions architect must devise a strategy that maximizes security without increasing operational overhead. What should the solutions architect do to meet these requirements?',
    answer: 'B. Deploy a NAT gateway in the public subnets. Modify the private subnet route table to direct all internet-bound traffic to the NAT gateway.',
    answerVariants: [
      'A. Add an internet gateway to the private subnets and allow egress directly.',
      'B. Deploy a NAT gateway in the public subnets. Modify the private subnet route table to direct all internet-bound traffic to the NAT gateway.',
      'C. Use VPC peering to the third-party provider internet endpoint.',
      'D. Move the MySQL instances to public subnets and secure with security groups.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 550,
    topicSlug: 'identity-access-and-governance',
    question: 'A company is using AWS Key Management Service (AWS KMS) keys to encrypt AWS Lambda environment variables. A solutions architect needs to ensure that the required permissions are in place to decrypt and use the environment variables. Which steps must the solutions architect take to implement the correct permissions? (Choose two.)',
    answer: 'B. Add AWS KMS permissions in the Lambda execution role.',
    answerVariants: [
      'A. Add KMS permissions to the developer IAM users who deploy Lambda.',
      'B. Add AWS KMS permissions in the Lambda execution role.',
      'C. Store decrypted environment variables in Amazon S3 for runtime access.',
      'D. Use an inline policy on API Gateway to decrypt Lambda variables.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 551,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company has a financial application that produces reports. The reports average 50 KB in size and are stored in Amazon S3. The reports are frequently accessed during the first week after production and must be stored for several years. The reports must be retrievable within 6 hours. Which solution meets these requirements MOST cost-effectively?',
    answer: 'A. Use S3 Standard. Use an S3 Lifecycle rule to transition the reports to S3 Glacier after 7 days.',
    answerVariants: [
      'A. Use S3 Standard. Use an S3 Lifecycle rule to transition the reports to S3 Glacier after 7 days.',
      'B. Store reports in S3 One Zone-IA and expire after 30 days.',
      'C. Put reports directly in S3 Glacier Deep Archive on day 1.',
      'D. Store reports in EFS and snapshot monthly for retention.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 552,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company needs to optimize the cost of its Amazon EC2 instances. The company also needs to change the type and family of its EC2 instances every 2-3 months. What should the company do to meet these requirements?',
    answer: 'B. Purchase a No Upfront Compute Savings Plan for a 1-year term.',
    answerVariants: [
      'A. Purchase All Upfront Standard Reserved Instances for a 3-year term.',
      'B. Purchase a No Upfront Compute Savings Plan for a 1-year term.',
      'C. Use Spot Instances only and disable all baseline On-Demand capacity.',
      'D. Use Dedicated Hosts with yearly host reservations.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 553,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A solutions architect needs to review a company\'s Amazon S3 buckets to discover personally identifiable information (PII). The company stores the PII data in the us-east-1 Region and us-west-2 Region. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Configure Amazon Macie in each Region. Create a job to analyze the data that is in Amazon S3.',
    answerVariants: [
      'A. Configure Amazon Macie in each Region. Create a job to analyze the data that is in Amazon S3.',
      'B. Enable GuardDuty in one Region and scan S3 objects for PII there only.',
      'C. Use AWS Config rules to detect passport numbers in object contents.',
      'D. Enable S3 Inventory and parse report metadata for sensitive fields.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 554,
    topicSlug: 'database-performance-and-caching',
    question: 'A company\'s SAP application has a backend SQL Server database in an on-premises environment. The company wants to migrate its on-premises application and database server to AWS. The company needs an instance type that meets the high demands of its SAP database. On-premises performance data shows that both the SAP application and the database have high memory utilization. Which solution will meet these requirements?',
    answer: 'C. Use the memory optimized instance family for both the application and the database.',
    answerVariants: [
      'A. Use compute-optimized instances for the database and storage-optimized for app.',
      'B. Use general purpose instances for both tiers with burst credits.',
      'C. Use the memory optimized instance family for both the application and the database.',
      'D. Use GPU instances for the database to improve transaction throughput.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 555,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company runs an application in a VPC with public and private subnets. The VPC extends across multiple Availability Zones. The application runs on Amazon EC2 instances in private subnets. The application uses an Amazon Simple Queue Service (Amazon SQS) queue.',
    answer: 'A. Create an interface VPC endpoint for Amazon SQS and restrict access with endpoint policies and security controls.',
    answerVariants: [
      'A. Create an interface VPC endpoint for Amazon SQS and restrict access with endpoint policies and security controls.',
      'B. Route SQS traffic through a NAT gateway and rely on TLS only.',
      'C. Expose the SQS queue through an internet-facing API proxy.',
      'D. Connect EC2 instances to SQS by creating a VPC peering connection.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 556,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect is using an AWS CloudFormation template to deploy a three-tier web application. The web application consists of a web tier and an application tier that stores and retrieves user data in Amazon DynamoDB tables. The web and application tiers are hosted on Amazon EC2 instances, and the database tier is not publicly accessible. The application EC2 instances need to access the DynamoDB tables without exposing API credentials in the template. What should the solutions architect do to meet these requirements?',
    answer: 'B. Create an IAM role that has the required permissions to read and write from the DynamoDB tables. Add the role to the EC2 instance profile, and associate the instance profile with the application instances.',
    answerVariants: [
      'A. Store DynamoDB access keys in CloudFormation parameters and pass to user data.',
      'B. Create an IAM role that has the required permissions to read and write from the DynamoDB tables. Add the role to the EC2 instance profile, and associate the instance profile with the application instances.',
      'C. Use Systems Manager Parameter Store plaintext values for API credentials.',
      'D. Attach full DynamoDB access policy to the web tier instance profile.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 557,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect manages an analytics application. The application stores large amounts of semistructured data in an Amazon S3 bucket. The solutions architect wants to use parallel data processing to process the data more quickly. The solutions architect also wants to use information that is stored in an Amazon Redshift database to enrich the data. Which solution will meet these requirements?',
    answer: 'B. Use Amazon EMR to process the S3 data. Use Amazon EMR with the Amazon Redshift data to enrich the S3 data.',
    answerVariants: [
      'A. Use AWS Glue crawlers only and query raw data with Athena for enrichment.',
      'B. Use Amazon EMR to process the S3 data. Use Amazon EMR with the Amazon Redshift data to enrich the S3 data.',
      'C. Export S3 data to RDS and run SQL joins there for parallel processing.',
      'D. Use Lambda functions to process all files serially and enrich from Redshift.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 558,
    topicSlug: 'compute-cost-optimization',
    question: 'A company has two VPCs that are located in the us-west-2 Region within the same AWS account. The company needs to allow network traffic between these VPCs. Approximately 500 GB of data transfer will occur between the VPCs each month. What is the MOST cost-effective solution to connect these VPCs?',
    answer: 'C. Set up a VPC peering connection between the VPCs. Update the route tables of each VPC to use the VPC peering connection for inter-VPC communication.',
    answerVariants: [
      'A. Connect both VPCs through NAT gateways and public internet routes.',
      'B. Use AWS Transit Gateway for two VPCs in the same account with low traffic.',
      'C. Set up a VPC peering connection between the VPCs. Update the route tables of each VPC to use the VPC peering connection for inter-VPC communication.',
      'D. Use Site-to-Site VPN between the VPCs through customer gateways.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 559,
    topicSlug: 'identity-access-and-governance',
    question: '559Topic 1',
    answer: 'D. Activate cost allocation tags and use AWS Cost Explorer grouped by tag across linked accounts and Regions for product-line visibility.',
    answerVariants: [
      'A. Use CloudTrail and build custom chargeback from API call counts.',
      'B. Use AWS Budgets only with one budget per account and no tags.',
      'C. Export CUR and manually map resources to product lines in spreadsheets.',
      'D. Activate cost allocation tags and use AWS Cost Explorer grouped by tag across linked accounts and Regions for product-line visibility.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 560,
    topicSlug: 'identity-access-and-governance',
    question: 'A company\'s solutions architect is designing an AWS multi-account solution that uses AWS Organizations. The solutions architect has organized the company\'s accounts into organizational units (OUs). The solutions architect needs a solution that will identify any changes to the OU hierarchy. The solution also needs to notify the company\'s operations team of any changes. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Provision the AWS accounts by using AWS Control Tower. Use account drift notifications to identify the changes to the OU hierarchy.',
    answerVariants: [
      'A. Provision the AWS accounts by using AWS Control Tower. Use account drift notifications to identify the changes to the OU hierarchy.',
      'B. Use CloudTrail event history manually to check OU changes daily.',
      'C. Use Trusted Advisor checks to detect Organizations hierarchy drift.',
      'D. Create Lambda cron jobs that scrape the console for OU changes.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 561,
    topicSlug: 'edge-and-global-routing',
    question: 'A company\'s website handles millions of requests each day, and the number of requests continues to increase. A solutions architect needs to improve the response time of the web application. The solutions architect determines that the application needs to decrease latency when retrieving product details from the Amazon DynamoDB table. Which solution will meet these requirements with the LEAST amount of operational overhead?',
    answer: 'A. Set up a DynamoDB Accelerator (DAX) cluster. Route all read requests through DAX.',
    answerVariants: [
      'A. Set up a DynamoDB Accelerator (DAX) cluster. Route all read requests through DAX.',
      'B. Add CloudFront in front of the DynamoDB API endpoint.',
      'C. Use DynamoDB Streams to reduce read latency for product lookups.',
      'D. Increase EC2 instance size and keep direct reads to DynamoDB.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 562,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect needs to ensure that API calls to Amazon DynamoDB from Amazon EC2 instances in a VPC do not travel across the internet. Which combination of steps should the solutions architect take to meet this requirement? (Choose two.)',
    answer: 'A. Create a route table entry for the endpoint.',
    answerVariants: [
      'A. Create a route table entry for the endpoint.',
      'B. Add an internet gateway route and enforce TLS for DynamoDB calls.',
      'C. Use a NAT gateway route for private subnet DynamoDB traffic.',
      'D. Configure Direct Connect as the default route for DynamoDB API calls.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 563,
    topicSlug: 'compute-selection-and-scaling',
    question: 'clusters and workloads from a central location. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use Amazon EKS Connector to register and connect all Kubernetes clusters.',
    answerVariants: [
      'A. Use one EKS cluster only and migrate all external clusters immediately.',
      'B. Use Amazon EKS Connector to register and connect all Kubernetes clusters.',
      'C. Use AWS Systems Manager Fleet Manager for Kubernetes control-plane access.',
      'D. Use CloudFormation StackSets to poll and manage all clusters directly.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 564,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is building an ecommerce application and needs to store sensitive customer information. The company needs to give customers the ability to complete purchase transactions on the website. The company also needs to ensure that sensitive customer data is protected, even from database administrators. Which solution meets these requirements?',
    answer: 'B. Store sensitive data in Amazon RDS for MySQL. Use AWS Key Management Service (AWS KMS) client-side encryption to encrypt the data.',
    answerVariants: [
      'A. Store data in plain text in RDS and rely on subnet isolation.',
      'B. Store sensitive data in Amazon RDS for MySQL. Use AWS Key Management Service (AWS KMS) client-side encryption to encrypt the data.',
      'C. Encrypt only backups and keep active table data unencrypted.',
      'D. Use IAM database authentication as the only data-protection mechanism.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 565,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has an on-premises MySQL database that handles transactional data. The company is migrating the database to the AWS Cloud. The migrated database must maintain compatibility with the company\'s applications that use the database. The migrated database also must scale automatically during periods of increased demand. Which migration solution will meet these requirements?',
    answer: 'C. Use AWS Database Migration Service (AWS DMS) to migrate the database to Amazon Aurora. Turn on Aurora Auto Scaling.',
    answerVariants: [
      'A. Migrate MySQL to DynamoDB and rewrite application data access patterns.',
      'B. Lift and shift MySQL to one EC2 instance with manual scaling.',
      'C. Use AWS Database Migration Service (AWS DMS) to migrate the database to Amazon Aurora. Turn on Aurora Auto Scaling.',
      'D. Export/import MySQL data nightly to Amazon RDS Single-AZ.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 566,
    topicSlug: 'storage-performance-patterns',
    question: 'A company runs multiple Amazon EC2 Linux instances in a VPC across two Availability Zones. The instances host applications that use a hierarchical directory structure. The applications need to read and write rapidly and concurrently to shared storage. What should a solutions architect do to meet these requirements?',
    answer: 'B. Create an Amazon Elastic File System (Amazon EFS) file system. Mount the EFS file system from each EC2 instance.',
    answerVariants: [
      'A. Use one gp3 EBS volume and attach to all instances across AZs.',
      'B. Create an Amazon Elastic File System (Amazon EFS) file system. Mount the EFS file system from each EC2 instance.',
      'C. Use S3 and mount as POSIX file system from each instance.',
      'D. Use instance store volumes and replicate directories by rsync cron.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 567,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect is designing a workload that will store hourly energy consumption by business tenants in a building. The sensors will feed a database through HTTP requests that will add up usage for each tenant. The solutions architect must use managed services when possible. The workload will receive more features in the future as the solutions architect adds independent components. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use Amazon API Gateway with AWS Lambda functions to receive the data from the sensors, process the data, and store the data in an Amazon DynamoDB table.',
    answerVariants: [
      'A. Use Amazon API Gateway with AWS Lambda functions to receive the data from the sensors, process the data, and store the data in an Amazon DynamoDB table.',
      'B. Use EC2 web servers with a self-managed PostgreSQL database.',
      'C. Use Amazon MQ with consumer EC2 instances and local SQLite aggregation.',
      'D. Use S3 event notifications and periodic Athena inserts into DynamoDB.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 568,
    topicSlug: 'edge-and-global-routing',
    question: 'A solutions architect is designing the storage architecture for a new web application used for storing and viewing engineering drawings. All application components will be deployed on the AWS infrastructure. The application design must support caching to minimize the amount of time that users wait for the engineering drawings to load. The application must be able to store petabytes of data. Which combination of storage and caching should the solutions architect use?',
    answer: 'A. Amazon S3 with Amazon CloudFront',
    answerVariants: [
      'A. Amazon S3 with Amazon CloudFront',
      'B. Amazon EFS with Route 53 latency routing',
      'C. Amazon FSx for Windows with Global Accelerator',
      'D. Amazon EBS gp3 volumes behind an Application Load Balancer'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 569,
    topicSlug: 'event-driven-and-messaging',
    question: 'An Amazon EventBridge rule targets a third-party API. The third-party API has not received any incoming traffic. A solutions architect needs to determine whether the rule conditions are being met and if the rule\'s target is being invoked. Which solution will meet these requirements? s',
    answer: 'C. Enable Amazon EventBridge rule metrics and configure a dead-letter queue (DLQ) for failed target invocations to verify matches and delivery attempts.',
    answerVariants: [
      'A. Check VPC Flow Logs for third-party API traffic and infer rule matches.',
      'B. Enable CloudTrail Insights and search for EventBridge service anomalies.',
      'C. Enable Amazon EventBridge rule metrics and configure a dead-letter queue (DLQ) for failed target invocations to verify matches and delivery attempts.',
      'D. Recreate the rule every hour and compare invocation counts manually.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 570,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company has a large workload that runs every Friday evening. The workload runs on Amazon EC2 instances that are in two Availability Zones in the us-east-1 Region. Normally, the company must run no more than two instances at all times. However, the company wants to scale up to six instances each Friday to handle a regularly repeating increased workload. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Create an Auto Scaling group that has a scheduled action.',
    answerVariants: [
      'A. Use dynamic scaling only and wait for Friday load to trigger scaling.',
      'B. Create an Auto Scaling group that has a scheduled action.',
      'C. Use predictive scaling with no baseline minimum capacity.',
      'D. Increase instance size and keep desired capacity fixed at 2.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 571,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is creating a REST API. The company has strict requirements for the use of TLS. The company requires TLSv1.3 on the API endpoints. The company also requires a specific public third-party certificate authority (CA) to sign the TLS certificate. Which solution will meet these requirements?',
    answer: 'A. Use a local machine to create a certificate that is signed by the third-party CA. Import the certificate into AWS Certificate Manager (ACM). Create an HTTP API in Amazon API Gateway with a custom domain. Configure the custom domain to use the certificate.',
    answerVariants: [
      'A. Use a local machine to create a certificate that is signed by the third-party CA. Import the certificate into AWS Certificate Manager (ACM). Create an HTTP API in Amazon API Gateway with a custom domain. Configure the custom domain to use the certificate.',
      'B. Use an ACM-issued public certificate and force TLSv1.2 for compatibility.',
      'C. Use a self-signed certificate in API Gateway and pin the cert in clients.',
      'D. Use CloudFront with default cert and terminate TLS at Lambda.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 572,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs an application on AWS. The application receives inconsistent amounts of usage. The application uses AWS Direct Connect to connect to an on-premises MySQL-compatible database. The on-premises database consistently uses a minimum of 2 GiB of memory. The company wants to migrate the on-premises database to a managed AWS service. The company wants to use auto scaling capabilities to manage unexpected workload increases. Which solution will meet these requirements with the LEAST administrative overhead?',
    answer: 'C. Provision an Amazon Aurora Serverless v2 database with a minimum capacity of 1 Aurora capacity unit (ACU).',
    answerVariants: [
      'A. Use RDS MySQL with provisioned IOPS and manual vertical scaling only.',
      'B. Use one EC2-hosted MySQL instance behind Direct Connect for consistency.',
      'C. Provision an Amazon Aurora Serverless v2 database with a minimum capacity of 1 Aurora capacity unit (ACU).',
      'D. Use DynamoDB on-demand and migrate relational schema as-is.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 573,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to use an event-driven programming model with AWS Lambda. The company wants to reduce startup latency for Lambda functions that run on Java 11. The company does not have strict latency requirements for the applications. The company wants to reduce cold starts and outlier latencies when a function scales up. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'D. Configure Lambda SnapStart.',
    answerVariants: [
      'A. Enable Provisioned Concurrency for all functions 24/7.',
      'B. Increase Lambda memory to maximum and disable retries.',
      'C. Move Java workloads to ECS Fargate to avoid cold starts.',
      'D. Configure Lambda SnapStart.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 574,
    topicSlug: 'database-performance-and-caching',
    question: 'A financial services company launched a new application that uses an Amazon RDS for MySQL database. The company uses the application to track stock market trends. The company needs to operate the application for only 2 hours at the end of each week. The company needs to optimize the cost of running the database. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'A. Migrate the existing RDS for MySQL database to an Aurora Serverless v2 MySQL database cluster.',
    answerVariants: [
      'A. Migrate the existing RDS for MySQL database to an Aurora Serverless v2 MySQL database cluster.',
      'B. Keep RDS provisioned instance always running and stop during weekdays.',
      'C. Use DynamoDB on-demand with SQL compatibility mode.',
      'D. Move database to EC2 and hibernate instance between runs.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 575,
    topicSlug: 'database-performance-and-caching',
    question: 'A company deploys its applications on Amazon Elastic Kubernetes Service (Amazon EKS) behind an Application Load Balancer in an AWS Region. The application needs to store data in a PostgreSQL database engine. The company wants the data in the database to be highly available. The company also needs increased capacity for read workloads. Which solution will meet these requirements with the MOST operational efficiency?',
    answer: 'C. Create an Amazon RDS database with Multi-AZ DB cluster deployment.',
    answerVariants: [
      'A. Use RDS Single-AZ PostgreSQL with one read replica in same AZ.',
      'B. Use self-managed PostgreSQL on EKS stateful sets with EBS volumes.',
      'C. Create an Amazon RDS database with Multi-AZ DB cluster deployment.',
      'D. Use Aurora Serverless v2 without reader endpoints for read scaling.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 576,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is building a RESTful serverless web application on AWS by using Amazon API Gateway and AWS Lambda. The users of this web application will be geographically distributed, and the company wants to reduce the latency of API requests to these users. Which type of endpoint should a solutions architect use to meet these requirements?',
    answer: 'D. Edge-optimized endpoint',
    answerVariants: [
      'A. Private endpoint',
      'B. Regional endpoint with no global edge cache',
      'C. VPC endpoint',
      'D. Edge-optimized endpoint'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 577,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses an Amazon CloudFront distribution to serve content pages for its website. The company needs to ensure that clients use a TLS certificate when accessing the company\'s website. The company wants to automate the creation and renewal of the TLS certificates. Which solution will meet these requirements with the MOST operational efficiency?',
    answer: 'C. Use AWS Certificate Manager (ACM) to create a certificate. Use DNS validation for the domain.',
    answerVariants: [
      'A. Create self-signed certificates on EC2 and upload manually each year.',
      'B. Use imported certificates only and renew with external scripts.',
      'C. Use AWS Certificate Manager (ACM) to create a certificate. Use DNS validation for the domain.',
      'D. Use IAM server certificates for CloudFront-managed TLS termination.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 578,
    topicSlug: 'database-performance-and-caching',
    question: 'A company deployed a serverless application that uses Amazon DynamoDB as a database layer. The application has experienced a large increase in users. The company wants to improve database response time from milliseconds to microseconds and to cache requests to the database. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Use DynamoDB Accelerator (DAX).',
    answerVariants: [
      'A. Use DynamoDB Accelerator (DAX).',
      'B. Add CloudWatch Contributor Insights to improve query latency.',
      'C. Use S3 Transfer Acceleration for DynamoDB requests.',
      'D. Increase Lambda timeout to reduce database latency.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 579,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs an application that uses Amazon RDS for PostgreSQL. The application receives traffic only on weekdays during business hours. The company wants to optimize costs and reduce operational overhead based on this usage. Which solution will meet these requirements?',
    answer: 'A. Use the Instance Scheduler on AWS to configure start and stop schedules.',
    answerVariants: [
      'A. Use the Instance Scheduler on AWS to configure start and stop schedules.',
      'B. Manually stop and start RDS instances each weekday in console.',
      'C. Use Lambda cron with root credentials embedded in environment variables.',
      'D. Use Auto Scaling for RDS to reduce weekday database runtime cost.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 580,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses locally attached storage to run a latency-sensitive application on premises. The company is using a lift and shift method to move the application to the AWS Cloud. The company does not want to change the application architecture. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'D. Host the application on an Amazon EC2 instance. Use an Amazon Elastic Block Store (Amazon EBS) GP3 volume to run the application.',
    answerVariants: [
      'A. Host the app on AWS Lambda with Amazon S3 as block storage.',
      'B. Use EFS Standard-IA for low-latency local block I/O workload.',
      'C. Use Amazon FSx for Lustre with ephemeral caching for transactional I/O.',
      'D. Host the application on an Amazon EC2 instance. Use an Amazon Elastic Block Store (Amazon EBS) GP3 volume to run the application.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 581,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs a stateful production application on Amazon EC2 instances. The application requires at least two EC2 instances to always be running.',
    answer: 'A. Configure the Auto Scaling group across multiple Availability Zones with a minimum capacity of 2 instances and health checks for automatic replacement.',
    answerVariants: [
      'A. Configure the Auto Scaling group across multiple Availability Zones with a minimum capacity of 2 instances and health checks for automatic replacement.',
      'B. Use one large EC2 instance and keep nightly AMI backups for failover.',
      'C. Run two instances in one Availability Zone with no health checks.',
      'D. Replace Auto Scaling with a fixed instance fleet managed manually.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 582,
    topicSlug: 'edge-and-global-routing',
    question: 'An ecommerce company uses Amazon Route 53 as its DNS provider. The company hosts its website on premises and in the AWS Cloud. The company\'s on-premises data center is near the us-west-1 Region. The company uses the eu-central-1 Region to host the website. The company wants to minimize load time for the website as much as possible. Which solution will meet these requirements?',
    answer: 'A. Set up a geolocation routing policy. Send the traffic that is near us-west-1 to the on-premises data center. Send the traffic that is near eu-central-1 to eu-central-1.',
    answerVariants: [
      'A. Set up a geolocation routing policy. Send the traffic that is near us-west-1 to the on-premises data center. Send the traffic that is near eu-central-1 to eu-central-1.',
      'B. Use simple routing to send all users to eu-central-1 only.',
      'C. Use weighted routing with equal weights for on-premises and eu-central-1.',
      'D. Use failover routing with eu-central-1 as primary for all users.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 583,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has 5 PB of archived data on physical tapes. The company needs to preserve the data on the tapes for another 10 years for compliance purposes. The company wants to migrate to AWS in the next 6 months. The data center that stores the tapes has a 1 Gbps uplink internet connectivity. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Order multiple AWS Snowball devices that have Tape Gateway. Copy the physical tapes to virtual tapes in Snowball. Ship the Snowball devices to AWS. Create a lifecycle policy to move the tapes to Amazon S3 Glacier Deep Archive.',
    answerVariants: [
      'A. Upload all data over the 1 Gbps link by using DataSync in 6 months.',
      'B. Use one Snowball Edge device serially for all 5 PB of data.',
      'C. Order multiple AWS Snowball devices that have Tape Gateway. Copy the physical tapes to virtual tapes in Snowball. Ship the Snowball devices to AWS. Create a lifecycle policy to move the tapes to Amazon S3 Glacier Deep Archive.',
      'D. Migrate tapes to EFS and archive snapshots to S3 Standard-IA.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 584,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company is deploying an application that processes large quantities of data in parallel. The company plans to use Amazon EC2 instances for the workload. The network architecture must be configurable to prevent groups of nodes from sharing the same underlying hardware. Which networking solution meets these requirements?',
    answer: 'A. Run the EC2 instances in a spread placement group.',
    answerVariants: [
      'A. Run the EC2 instances in a spread placement group.',
      'B. Run all EC2 instances in one cluster placement group only.',
      'C. Use dedicated hosts and disable placement groups.',
      'D. Use partition placement groups to maximize same-host colocation.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 585,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A solutions architect is designing a disaster recovery (DR) strategy to provide Amazon EC2 capacity in a failover AWS Region. Business requirements state that the DR strategy must meet capacity in the failover Region. Which solution will meet these requirements?',
    answer: 'D. Purchase a Capacity Reservation in the failover Region.',
    answerVariants: [
      'A. Use Spot Instances in the failover Region for guaranteed capacity.',
      'B. Purchase Savings Plans to guarantee EC2 capacity during failover.',
      'C. Keep AMIs only and launch capacity on demand during disasters.',
      'D. Purchase a Capacity Reservation in the failover Region.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 586,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has five organizational units (OUs) as part of its organization in AWS Organizations. Each OU correlates to the five businesses that the company owns. The company\'s research and development (R&D) business is separating from the company and will need its own organization. A solutions architect creates a separate new management account for this purpose. What should the solutions architect do next in the new management account?',
    answer: 'B. Invite the R&D AWS account to be part of the new organization after the R&D AWS account has left the prior organization.',
    answerVariants: [
      'A. Move the R&D OU directly from the old organization to the new one.',
      'B. Invite the R&D AWS account to be part of the new organization after the R&D AWS account has left the prior organization.',
      'C. Share the old management account root user with the new organization.',
      'D. Clone the old organization and selectively import OUs.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 587,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company is designing a solution to capture customer activity in different web applications to process analytics and make predictions. Customer activity in the web applications is unpredictable and can increase suddenly. The company requires a solution that integrates with other web applications. The solution must include an authorization step for security purposes. Which solution will meet these requirements?',
    answer: 'C. Configure an Amazon API Gateway endpoint in front of an Amazon Kinesis Data Firehose that stores the information that the company receives in an Amazon S3 bucket. Use an API Gateway Lambda authorizer to resolve authorization.',
    answerVariants: [
      'A. Use Amazon SQS queue URLs directly from all web apps without auth checks.',
      'B. Use EventBridge custom buses with no API authorization layer.',
      'C. Configure an Amazon API Gateway endpoint in front of an Amazon Kinesis Data Firehose that stores the information that the company receives in an Amazon S3 bucket. Use an API Gateway Lambda authorizer to resolve authorization.',
      'D. Use CloudFront logs as the ingestion mechanism for all customer activities.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 588,
    topicSlug: 'database-performance-and-caching',
    question: 'An ecommerce company wants a disaster recovery solution for its Amazon RDS DB instances that run Microsoft SQL Server Enterprise Edition. The company\'s current recovery point objective (RPO) and recovery time objective (RTO) are 24 hours. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'D. Copy automatic snapshots to another Region every 24 hours.',
    answerVariants: [
      'A. Use synchronous cross-Region SQL replication for Enterprise Edition.',
      'B. Use daily exports to S3 and manual restore scripts in DR Region.',
      'C. Use Multi-AZ only in the same Region for DR requirements.',
      'D. Copy automatic snapshots to another Region every 24 hours.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 589,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a web application on Amazon EC2 instances in an Auto Scaling group behind an Application Load Balancer that has sticky sessions enabled. The web server currently hosts the user session state. The company wants to ensure high availability and avoid user session state loss in the event of a web server outage. Which solution will meet these requirements?',
    answer: 'B. Use Amazon ElastiCache for Redis to store the session state. Update the application to use ElastiCache for Redis to store the session state.',
    answerVariants: [
      'A. Keep sticky sessions and store session state only in web server memory.',
      'B. Use Amazon ElastiCache for Redis to store the session state. Update the application to use ElastiCache for Redis to store the session state.',
      'C. Write session state to local EBS volume on each instance.',
      'D. Enable ALB cross-zone load balancing to preserve session state.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 590,
    topicSlug: 'database-performance-and-caching',
    question: 'A company migrated a MySQL database from the company\'s on-premises data center to an Amazon RDS for MySQL DB instance. The company sized the RDS DB instance to meet the company\'s average daily workload. Once a month, the database performs slowly when the company runs queries for a report. The company wants to have the ability to run reports and maintain the performance of the daily workloads. Which solution will meet these requirements?',
    answer: 'A. Create a read replica of the database. Direct the queries to the read replica.',
    answerVariants: [
      'A. Create a read replica of the database. Direct the queries to the read replica.',
      'B. Increase primary DB instance size only during report windows manually.',
      'C. Use snapshot restore every month to run reports on a new DB.',
      'D. Use RDS Proxy to accelerate heavy read report queries.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 591,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company runs a container application by using Amazon Elastic Kubernetes Service (Amazon EKS). The application includes microservices that manage customers and place orders. The company needs to route incoming requests to the appropriate microservices. Which solution will meet this requirement MOST cost-effectively?',
    answer: 'B. Use the AWS Load Balancer Controller to provision an Application Load Balancer.',
    answerVariants: [
      'A. Use NodePort services only and expose worker node public IPs.',
      'B. Use the AWS Load Balancer Controller to provision an Application Load Balancer.',
      'C. Use API Gateway HTTP APIs directly to pod IP addresses.',
      'D. Use one NLB with TCP passthrough and path-based routing.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 592,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses AWS and sells access to copyrighted images. The company\'s global customer base needs to be able to access these images quickly. The company must deny access to users from specific countries. The company wants to minimize costs as much as possible. Which solution will meet these requirements?',
    answer: 'D. Use Amazon S3 to store the images. Use Amazon CloudFront to distribute the images with geographic restrictions. Provide a signed URL for each customer to access the data in CloudFront.',
    answerVariants: [
      'A. Store images in EFS and block countries by security groups.',
      'B. Use S3 public objects and rely on application checks for access control.',
      'C. Use Route 53 geolocation only and expose S3 bucket publicly.',
      'D. Use Amazon S3 to store the images. Use Amazon CloudFront to distribute the images with geographic restrictions. Provide a signed URL for each customer to access the data in CloudFront.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 593,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect is designing a highly available Amazon ElastiCache for Redis based solution. The solutions architect needs to ensure that failures do not result in performance degradation or loss of data locally and within an AWS Region. The solution needs to provide high availability at the node level and at the Region level. Which solution will meet these requirements?',
    answer: 'A. Use Multi-AZ Redis replication groups with shards that contain multiple nodes.',
    answerVariants: [
      'A. Use Multi-AZ Redis replication groups with shards that contain multiple nodes.',
      'B. Use one Redis node per shard with no replicas for consistency.',
      'C. Use Redis cluster mode disabled and daily snapshots only.',
      'D. Use Memcached nodes across AZs to preserve durable data.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 594,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company plans to migrate to AWS and use Amazon EC2 On-Demand Instances for its application. During the migration testing phase, a technical team observes that the application takes a long time to launch and load memory to become fully productive. Which solution will reduce the launch time of the application during the next testing phase?',
    answer: 'C. Launch the EC2 On-Demand Instances with hibernation turned on. Configure EC2 Auto Scaling warm pools during the next testing phase.',
    answerVariants: [
      'A. Use Spot Instances and accept interruption for faster startup.',
      'B. Use larger EBS volumes to reduce boot time for all instances.',
      'C. Launch the EC2 On-Demand Instances with hibernation turned on. Configure EC2 Auto Scaling warm pools during the next testing phase.',
      'D. Use dedicated hosts with placement groups to reduce launch latency.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 595,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company\'s applications run on Amazon EC2 instances in Auto Scaling groups. The company notices that its applications experience sudden traffic increases on random days of the week. The company wants to maintain application performance during sudden traffic increases. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Use dynamic scaling to change the size of the Auto Scaling group.',
    answerVariants: [
      'A. Use scheduled scaling based on a fixed weekly pattern only.',
      'B. Keep desired capacity fixed and scale instance types manually.',
      'C. Use dynamic scaling to change the size of the Auto Scaling group.',
      'D. Use only predictive scaling and disable dynamic policies.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 596,
    topicSlug: 'database-performance-and-caching',
    question: 'An ecommerce application uses a PostgreSQL database that runs on an Amazon EC2 instance. During a monthly sales event, database usage increases and causes database connection issues for the application. The traffic is unpredictable for subsequent monthly sales events, which impacts the sales forecast. The company needs to maintain performance when there is an unpredictable increase in traffic. Which solution resolves this issue in the MOST cost-effective way?',
    answer: 'A. Migrate the PostgreSQL database to Amazon Aurora Serverless v2.',
    answerVariants: [
      'A. Migrate the PostgreSQL database to Amazon Aurora Serverless v2.',
      'B. Keep PostgreSQL on EC2 and add larger instances before each event.',
      'C. Migrate to RDS Single-AZ with manual read replicas for bursts.',
      'D. Use DynamoDB global tables for relational PostgreSQL workloads.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 597,
    topicSlug: 'edge-and-global-routing',
    question: 'A company hosts an internal serverless application on AWS by using Amazon API Gateway and AWS Lambda. The company\'s employees report issues with high latency when they begin using the application each day. The company wants to reduce latency. Which solution will meet these requirements?',
    answer: 'B. Set up a scheduled scaling to increase Lambda provisioned concurrency before employees begin to use the application each day.',
    answerVariants: [
      'A. Increase Lambda memory and timeout globally for all functions.',
      'B. Set up a scheduled scaling to increase Lambda provisioned concurrency before employees begin to use the application each day.',
      'C. Move API Gateway to Regional endpoint with no concurrency settings.',
      'D. Disable cold starts by keeping one invoker Lambda in a loop.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 598,
    topicSlug: 'storage-performance-patterns',
    question: 'A research company uses on-premises devices to generate data for analysis. The company wants to use the AWS Cloud to analyze the data. The devices generate .csv files and support writing the data to an SMB file share. Company analysts must be able to use SQL commands to query the data. The analysts will run queries periodically throughout the day. Which combination of steps will meet these requirements MOST cost-effectively? (Choose three.)',
    answer: 'A. Deploy an AWS Storage Gateway on premises in Amazon S3 File Gateway mode.',
    answerVariants: [
      'A. Deploy an AWS Storage Gateway on premises in Amazon S3 File Gateway mode.',
      'B. Use AWS Snowball Edge daily to move each new CSV batch.',
      'C. Use EBS Direct APIs from on-premises SMB devices.',
      'D. Use one EC2 instance as SMB server and sync files nightly to S3.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 599,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to use Amazon Elastic Container Service (Amazon ECS) clusters and Amazon RDS DB instances to build and run a payment processing application. The company will run the application in its on-premises data center for compliance purposes.',
    answer: 'B. Deploy AWS Outposts with ECS and RDS on Outposts so the workload runs on premises while using consistent AWS APIs and operations.',
    answerVariants: [
      'A. Deploy ECS and RDS in one AWS Region and connect over VPN for compliance.',
      'B. Deploy AWS Outposts with ECS and RDS on Outposts so the workload runs on premises while using consistent AWS APIs and operations.',
      'C. Use EKS Anywhere and self-managed PostgreSQL without AWS control plane services.',
      'D. Use Local Zones for all compute and keep database in on-premises DC.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 600,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is planning to migrate a TCP-based application into the company\'s VPC. The application is publicly accessible on a nonstandard TCP port through a hardware appliance in the company\'s data center. This public endpoint can process up to 3 million requests per second with low latency. The company requires the same level of performance for the new public endpoint in AWS. What should a solutions architect recommend to meet this requirement?',
    answer: 'A. Deploy a Network Load Balancer (NLB). Configure the NLB to be publicly accessible over the TCP port that the application requires.',
    answerVariants: [
      'A. Deploy a Network Load Balancer (NLB). Configure the NLB to be publicly accessible over the TCP port that the application requires.',
      'B. Deploy an Application Load Balancer with HTTP listeners and path routing.',
      'C. Use API Gateway REST API to proxy TCP traffic at scale.',
      'D. Use CloudFront with custom origin over nonstandard TCP ports.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 601,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs its critical database on an Amazon RDS for PostgreSQL DB instance. The company wants to migrate to Amazon Aurora PostgreSQL with minimal downtime and data loss. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Create an Aurora read replica of the RDS for PostgreSQL DB instance. Promote the Aurora read replicate to a new Aurora PostgreSQL DB cluster.',
    answerVariants: [
      'A. Export the database to S3 and import into a new Aurora cluster during maintenance.',
      'B. Create an Aurora read replica of the RDS for PostgreSQL DB instance. Promote the Aurora read replicate to a new Aurora PostgreSQL DB cluster.',
      'C. Use DMS full-load migration only and cut over without replication.',
      'D. Restore an RDS snapshot into Aurora and replay application transactions manually.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 602,
    topicSlug: 'storage-performance-patterns',
    question: 'A company\'s infrastructure consists of hundreds of Amazon EC2 instances that use Amazon Elastic Block Store (Amazon EBS) storage. A solutions architect must ensure that every EC2 instance can be recovered after a disaster. What should the solutions architect do to meet this requirement with the LEAST amount of effort?',
    answer: 'C. Use AWS Backup to set up a backup plan for the entire group of EC2 instances. Use the AWS Backup API or the AWS CLI to speed up the restore process for multiple EC2 instances.',
    answerVariants: [
      'A. Create manual AMIs for each instance once per quarter.',
      'B. Run custom scripts on each instance to copy EBS blocks to S3.',
      'C. Use AWS Backup to set up a backup plan for the entire group of EC2 instances. Use the AWS Backup API or the AWS CLI to speed up the restore process for multiple EC2 instances.',
      'D. Enable instance hibernation for all EC2 instances as a disaster recovery strategy.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 603,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company recently migrated to the AWS Cloud. The company wants a serverless solution for large-scale parallel on-demand processing of a semistructured dataset. The data consists of logs, media files, sales transactions, and IoT sensor data that is stored in Amazon S3. The company wants the solution to process thousands of items in the dataset in parallel. Which solution will meet these requirements with the MOST operational efficiency?',
    answer: 'B. Use the AWS Step Functions Map state in Distributed mode to process the data in parallel.',
    answerVariants: [
      'A. Use a single long-running Lambda function to process all S3 objects sequentially.',
      'B. Use the AWS Step Functions Map state in Distributed mode to process the data in parallel.',
      'C. Use Amazon EMR with one core node and run one Spark executor.',
      'D. Use AWS Glue Studio visual jobs triggered manually for each file.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 604,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company will migrate 10 PB of data to Amazon S3 in 6 weeks. The current data center has a 500 Mbps uplink to the internet. Other on-premises applications share the uplink. The company can use 80% of the internet bandwidth for this one-time migration task. Which solution will meet these requirements?',
    answer: 'D. Order multiple AWS Snowball devices. Copy the data to the devices. Send the devices to AWS to copy the data to Amazon S3.',
    answerVariants: [
      'A. Use S3 Transfer Acceleration over the existing internet uplink for all 10 PB.',
      'B. Use DataSync over VPN and throttle other applications during migration.',
      'C. Establish one 1 Gbps Direct Connect and run continuous copy jobs.',
      'D. Order multiple AWS Snowball devices. Copy the data to the devices. Send the devices to AWS to copy the data to Amazon S3.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 605,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has several on-premises Internet Small Computer Systems Interface (ISCSI) network storage servers. The company wants to reduce the number of these servers by moving to the AWS Cloud. A solutions architect must provide low-latency access to frequently used data and reduce the dependency on on-premises servers with a minimal number of infrastructure changes. Which solution will meet these requirements?',
    answer: 'D. Deploy an AWS Storage Gateway volume gateway that is configured with cached volumes.',
    answerVariants: [
      'A. Deploy Amazon FSx for Lustre directly in the data center over VPN.',
      'B. Replace all on-premises storage with S3 static website endpoints.',
      'C. Use EBS Multi-Attach volumes from on-premises iSCSI hosts.',
      'D. Deploy an AWS Storage Gateway volume gateway that is configured with cached volumes.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 606,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A solutions architect is designing an application that will allow business users to upload objects to Amazon S3. The solution needs to maximize object durability. Objects also must be readily available at any time and for any length of time. Users will access objects frequently within the first 30 days after the objects are uploaded, but users are much less likely to access objects that are older than 30 days. Which solution meets these requirements MOST cost-effectively?',
    answer: 'B. Store all the objects in S3 Standard with an S3 Lifecycle rule to transition the objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 30 days.',
    answerVariants: [
      'A. Store all objects in S3 One Zone-IA from day 1 to minimize cost.',
      'B. Store all the objects in S3 Standard with an S3 Lifecycle rule to transition the objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 30 days.',
      'C. Store all objects in S3 Glacier Flexible Retrieval and restore on demand.',
      'D. Store all objects in EFS and archive to Glacier once per year.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 607,
    topicSlug: 'database-performance-and-caching',
    question: 'A company has migrated a two-tier application from its on-premises data center to the AWS Cloud. The data tier is a Multi-AZ deployment of Amazon RDS for Oracle with 12 TB of General Purpose SSD Amazon Elastic Block Store (Amazon EBS) storage. The application is designed to process and store documents in the database as binary large objects (blobs) with an average document size of 6 MB. The database size has grown over time, reducing the performance and increasing the cost of storage. The company must improve the database performance and needs a solution that is highly available and resilient. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Create an Amazon S3 bucket. Update the application to store documents in the S3 bucket. Store the object metadata in the existing database.',
    answerVariants: [
      'A. Increase RDS storage to io2 and continue storing all blobs in Oracle.',
      'B. Move blobs to ElastiCache Redis to reduce RDS IOPS pressure.',
      'C. Create an Amazon S3 bucket. Update the application to store documents in the S3 bucket. Store the object metadata in the existing database.',
      'D. Use EFS for blobs and keep full binary copies in RDS for resilience.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 608,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company has an application that serves clients that are deployed in more than 20.000 retail storefront locations around the world. The application consists of backend web services that are exposed over HTTPS on port 443. The application is hosted on Amazon EC2 instances behind an Application Load Balancer (ALB). The retail locations communicate with the web application over the public internet. The company allows each retail location to register the IP address that the retail location has been allocated by its local ISP. The company\'s security team recommends to increase the security of the application endpoint by restricting access to only the IP addresses registered by the retail locations. What should a solutions architect do to meet these requirements?',
    answer: 'B. Configure AWS WAF on the ALB and use an IP set that allows only the registered storefront public IP addresses.',
    answerVariants: [
      'A. Replace the ALB with API Gateway and enforce IAM authentication for storefronts.',
      'B. Configure AWS WAF on the ALB and use an IP set that allows only the registered storefront public IP addresses.',
      'C. Add NACL allow rules on private subnets for all storefront IP addresses.',
      'D. Use CloudFront signed cookies so only known storefronts can connect.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 609,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is building a data analysis platform on AWS by using AWS Lake Formation. The platform will ingest data from different sources such as Amazon S3 and Amazon RDS. The company needs a secure solution to prevent access to portions of the data that contain sensitive information. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Create data filters to implement row-level security and cell-level security.',
    answerVariants: [
      'A. Use separate S3 buckets for sensitive rows and manage copies by cron.',
      'B. Create data filters to implement row-level security and cell-level security.',
      'C. Encrypt only selected columns and share a single decryption key globally.',
      'D. Use IAM user policies per analyst and deny all Lake Formation permissions.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 610,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company deploys Amazon EC2 instances that run in a VPC. The EC2 instances load source data into Amazon S3 buckets so that the data can be processed in the future. According to compliance laws, the data must not be transmitted over the public internet. Servers in the company\'s on-premises data center will consume the output from an application that runs on the EC2 instances. Which solution will meet these requirements?',
    answer: 'B. Deploy a gateway VPC endpoint for Amazon S3. Set up an AWS Direct Connect connection between the on-premises network and the VPC.',
    answerVariants: [
      'A. Use a NAT gateway for S3 access and Site-to-Site VPN for on-premises output.',
      'B. Deploy a gateway VPC endpoint for Amazon S3. Set up an AWS Direct Connect connection between the on-premises network and the VPC.',
      'C. Use internet gateway routes for EC2 and enforce TLS 1.3 only.',
      'D. Use interface VPC endpoint for S3 and public internet for on-premises output.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 611,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company has an application with a REST-based interface that allows data to be received in near-real time from a third-party vendor. Once received, the application processes and stores the data for further analysis. The application is running on Amazon EC2 instances. The third-party vendor has received many 503 Service Unavailable Errors when sending data to the application. When the data volume spikes, the compute capacity reaches its maximum limit and the application is unable to process all requests. Which design should a solutions architect recommend to provide a more scalable solution?',
    answer: 'A. Use Amazon Kinesis Data Streams to ingest the data. Process the data using AWS Lambda functions.',
    answerVariants: [
      'A. Use Amazon Kinesis Data Streams to ingest the data. Process the data using AWS Lambda functions.',
      'B. Add more EC2 instances and keep synchronous writes from the vendor.',
      'C. Use SNS HTTP subscriptions directly to EC2 instances without buffering.',
      'D. Use S3 multipart uploads from vendor API and batch process daily.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 612,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has an application that runs on Amazon EC2 instances in a private subnet. The application needs to process sensitive information from an Amazon S3 bucket. The application must not use the internet to connect to the S3 bucket. Which solution will meet these requirements?',
    answer: 'D. Configure a VPC endpoint. Update the S3 bucket policy to allow access from the VPC endpoint. Update the application to use the new VPC endpoint.',
    answerVariants: [
      'A. Attach an internet gateway to the private subnet and use S3 public endpoints.',
      'B. Use a NAT instance and restrict outbound traffic to S3 IP ranges.',
      'C. Configure an AWS PrivateLink endpoint service for S3 in the VPC.',
      'D. Configure a VPC endpoint. Update the S3 bucket policy to allow access from the VPC endpoint. Update the application to use the new VPC endpoint.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 613,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company uses Amazon Elastic Kubernetes Service (Amazon EKS) to run a container application. The EKS cluster stores sensitive information in the Kubernetes secrets object. The company wants to ensure that the information is encrypted. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Enable secrets encryption in the EKS cluster by using AWS Key Management Service (AWS KMS).',
    answerVariants: [
      'A. Store all Kubernetes secrets in plain text and encrypt EBS volumes only.',
      'B. Enable secrets encryption in the EKS cluster by using AWS Key Management Service (AWS KMS).',
      'C. Encrypt only container images in ECR and keep etcd unencrypted.',
      'D. Use IAM Roles for Service Accounts as a replacement for secret encryption.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 614,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is designing a new multi-tier web application that consists of the following components:  Web and application servers that run on Amazon EC2 instances as part of Auto Scaling groups  An Amazon RDS DB instance for data storage',
    answer: 'A. Create a separate security group for the application servers and allow inbound traffic only from the web-tier security group.',
    answerVariants: [
      'A. Create a separate security group for the application servers and allow inbound traffic only from the web-tier security group.',
      'B. Place web and application servers in the same security group for low latency.',
      'C. Use network ACLs only and allow all ephemeral ports from all subnets.',
      'D. Expose application servers to the internet and enforce access in app logic.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 615,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs a critical, customer-facing application on Amazon Elastic Kubernetes Service (Amazon EKS). The application has a microservices architecture. The company needs to implement a solution that collects, aggregates, and summarizes metrics and logs from the application in a centralized location. Which solution meets these requirements?',
    answer: 'D. Configure Amazon CloudWatch Container Insights in the existing EKS cluster. View the metrics and logs in the CloudWatch console.',
    answerVariants: [
      'A. Install a third-party agent on one worker node and forward logs manually.',
      'B. Use VPC Flow Logs to summarize microservice application logs.',
      'C. Send all metrics to S3 and query weekly with Athena.',
      'D. Configure Amazon CloudWatch Container Insights in the existing EKS cluster. View the metrics and logs in the CloudWatch console.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 616,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has deployed its newest product on AWS. The product runs in an Auto Scaling group behind a Network Load Balancer. The company stores the product\'s objects in an Amazon S3 bucket. The company recently experienced malicious attacks against its systems. The company needs a solution that continuously monitors for malicious activity in the AWS account, workloads, and access patterns to the S3 bucket. The solution must also report suspicious activity and display the information on a dashboard. Which solution will meet these requirements?',
    answer: 'C. Configure Amazon GuardDuty to monitor and report findings to AWS Security Hub.',
    answerVariants: [
      'A. Use AWS Config to detect malicious S3 object access patterns in real time.',
      'B. Enable CloudWatch alarms on CPU usage and send to Security Hub.',
      'C. Configure Amazon GuardDuty to monitor and report findings to AWS Security Hub.',
      'D. Use Trusted Advisor security checks to continuously monitor S3 threats.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 617,
    topicSlug: 'storage-performance-patterns',
    question: 'A company wants to migrate an on-premises data center to AWS. The data center hosts a storage server that stores data in an NFS-based file system. The storage server holds 200 GB of data. The company needs to migrate the data without interruption to existing services. Multiple resources in AWS must be able to access the data by using the NFS protocol. Which combination of steps will meet these requirements MOST cost-effectively? (Choose two.)',
    answer: 'B. Create an Amazon Elastic File System (Amazon EFS) file system.',
    answerVariants: [
      'A. Use one EBS gp3 volume shared across all EC2 instances and AZs.',
      'B. Create an Amazon Elastic File System (Amazon EFS) file system.',
      'C. Use S3 with NFS mounts from Linux instances using native protocols.',
      'D. Use FSx for Windows File Server for Linux NFS clients only.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 618,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company wants to use Amazon FSx for Windows File Server for its Amazon EC2 instances that have an SMB file share mounted as a volume in the us-east-1 Region. The company has a recovery point objective (RPO) of 5 minutes for planned system maintenance or unplanned service disruptions. The company needs to replicate the file system to the us-west-2 Region. The replicated data must not be deleted by any user for 5 years. Which solution will meet these requirements?',
    answer: 'C. Create an FSx for Windows File Server file system in us-east-1 that has a Multi-AZ deployment type. Use AWS Backup to create a daily backup plan that includes a backup rule that copies the backup to us-west-2. Configure AWS Backup Vault Lock in compliance mode for a target vault in us-west-2. Configure a minimum duration of 5 years.',
    answerVariants: [
      'A. Use FSx Single-AZ and copy data weekly to S3 Glacier Deep Archive.',
      'B. Use EFS replication to us-west-2 and enforce retention with object lock.',
      'C. Create an FSx for Windows File Server file system in us-east-1 that has a Multi-AZ deployment type. Use AWS Backup to create a daily backup plan that includes a backup rule that copies the backup to us-west-2. Configure AWS Backup Vault Lock in compliance mode for a target vault in us-west-2. Configure a minimum duration of 5 years.',
      'D. Use Storage Gateway file gateway and copy SMB data hourly to another Region.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 619,
    topicSlug: 'identity-access-and-governance',
    question: 'A solutions architect is designing a security solution for a company that wants to provide developers with individual AWS accounts through AWS Organizations, while also maintaining standard security controls. Because the individual developers will have AWS account root user-level access to their own accounts, the solutions architect wants to ensure that the mandatory AWS CloudTrail configuration that is applied to new developer accounts is not modified. Which action meets these requirements?',
    answer: 'C. Create a service control policy (SCP) that prohibits changes to CloudTrail, and attach it the developer accounts.',
    answerVariants: [
      'A. Create IAM policies in each developer account denying CloudTrail actions.',
      'B. Use CloudTrail Lake alerts to revert unauthorized trail modifications.',
      'C. Create a service control policy (SCP) that prohibits changes to CloudTrail, and attach it the developer accounts.',
      'D. Enable AWS Config managed rules to notify when CloudTrail changes occur.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 620,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is planning to deploy a business-critical application in the AWS Cloud. The application requires durable storage with consistent, low-latency performance. Which type of storage should a solutions architect recommend to meet these requirements?',
    answer: 'C. Provisioned IOPS SSD Amazon Elastic Block Store (Amazon EBS) volume',
    answerVariants: [
      'A. Amazon S3 Standard with multipart access for low-latency random I/O.',
      'B. Amazon EFS Standard for single-instance low-latency block storage.',
      'C. Provisioned IOPS SSD Amazon Elastic Block Store (Amazon EBS) volume',
      'D. Amazon S3 Glacier Instant Retrieval for durable, consistent low-latency I/O.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 621,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'An online photo-sharing company stores its photos in an Amazon S3 bucket that exists in the us-west-1 Region. The company needs to store a copy of all new photos in the us-east-1 Region. Which solution will meet this requirement with the LEAST operational effort?',
    answer: 'A. Create a second S3 bucket in us-east-1. Use S3 Cross-Region Replication to copy photos from the existing S3 bucket to the second S3 bucket.',
    answerVariants: [
      'A. Create a second S3 bucket in us-east-1. Use S3 Cross-Region Replication to copy photos from the existing S3 bucket to the second S3 bucket.',
      'B. Configure Multi-Region Access Points without creating a second bucket.',
      'C. Run a nightly DataSync task from us-west-1 to us-east-1.',
      'D. Enable S3 versioning and rely on automatic cross-Region durability.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 622,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is creating a new web application for its subscribers. The application will consist of a static single page and a persistent database layer. The application will have millions of users for 4 hours in the morning, but the application will have only a few thousand users during the rest of the day. The company\'s data architects have requested the ability to rapidly evolve their schema. Which solutions will meet these requirements and provide the MOST scalability? (Choose two.)',
    answer: 'C. Deploy Amazon DynamoDB as the database solution. Ensure that DynamoDB auto scaling is enabled.',
    answerVariants: [
      'A. Use Amazon RDS provisioned for morning peak and keep capacity all day.',
      'B. Use ElastiCache as the primary datastore and persist snapshots hourly.',
      'C. Deploy Amazon DynamoDB as the database solution. Ensure that DynamoDB auto scaling is enabled.',
      'D. Use one EC2-hosted MySQL database and scale vertically each morning.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 623,
    topicSlug: 'network-security-controls',
    question: 'A company uses Amazon API Gateway to manage its REST APIs that third-party service providers access. The company must protect the REST APIs from SQL injection and cross-site scripting attacks. What is the MOST operationally efficient solution that meets these requirements?',
    answer: 'B. Configure AWS WAF.',
    answerVariants: [
      'A. Configure AWS Shield Advanced only for SQL injection and XSS filtering.',
      'B. Configure AWS WAF.',
      'C. Add API Gateway usage plans and throttle all requests uniformly.',
      'D. Use NACL deny rules for SQL keywords in packet payloads.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 624,
    topicSlug: 'identity-access-and-governance',
    question: 'A company wants to provide users with access to AWS resources. The company has 1,500 users and manages their access to on-premises resources through Active Directory user groups on the corporate network. However, the company does not want users to have to maintain another identity to access the resources. A solutions architect must manage user access to the AWS resources while preserving access to the on-premises resources. What should the solutions architect do to meet these requirements?',
    answer: 'D. Configure Security Assertion Markup Language (SAML) 2.0-based federation. Create roles with the appropriate policies attached. Map the roles to the Active Directory groups.',
    answerVariants: [
      'A. Create IAM users for all employees and synchronize passwords nightly.',
      'B. Use Cognito user pools and migrate all on-premises identities manually.',
      'C. Use IAM Identity Center with local users only and disable AD integration.',
      'D. Configure Security Assertion Markup Language (SAML) 2.0-based federation. Create roles with the appropriate policies attached. Map the roles to the Active Directory groups.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 625,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is hosting a website behind multiple Application Load Balancers. The company has different distribution rights for its content around the world. A solutions architect needs to ensure that users are served the correct content without violating distribution rights. Which configuration should the solutions architect choose to meet these requirements?',
    answer: 'C. Configure Amazon Route 53 with a geolocation policy',
    answerVariants: [
      'A. Configure Route 53 simple routing across all Application Load Balancers.',
      'B. Configure CloudFront cache behaviors by user-agent for content rights.',
      'C. Configure Amazon Route 53 with a geolocation policy',
      'D. Configure Route 53 weighted routing and manually tune region weights.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 626,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company stores its data on premises. The amount of data is growing beyond the company\'s available capacity. The company wants to migrate its data from the on-premises location to an Amazon S3 bucket. The company needs a solution that will automatically validate the integrity of the data after the transfer. Which solution will meet these requirements?',
    answer: 'B. Deploy an AWS DataSync agent on premises. Configure the DataSync agent to perform the online data transfer to an S3 bucket.',
    answerVariants: [
      'A. Use AWS Snowball Edge and manually validate checksums after each shipment.',
      'B. Deploy an AWS DataSync agent on premises. Configure the DataSync agent to perform the online data transfer to an S3 bucket.',
      'C. Use S3 Transfer Acceleration and run md5 checks with custom scripts only.',
      'D. Mount S3 via Storage Gateway file gateway and copy files with rsync.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 627,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to migrate two DNS servers to AWS. The servers host a total of approximately 200 zones and receive 1 million requests each day on average. The company wants to maximize availability while minimizing the operational overhead that is related to the management of the two servers. What should a solutions architect recommend to meet these requirements?',
    answer: 'A. Create 200 new hosted zones in the Amazon Route 53 console. Import zone files.',
    answerVariants: [
      'A. Create 200 new hosted zones in the Amazon Route 53 console. Import zone files.',
      'B. Run two self-managed BIND servers on EC2 in different AZs.',
      'C. Use one private hosted zone and share it publicly with all registrars.',
      'D. Use CloudFront distributions as authoritative DNS for all zones.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 628,
    topicSlug: 'identity-access-and-governance',
    question: 'A global company runs its applications in multiple AWS accounts in AWS Organizations. The company\'s applications use multipart uploads to upload data to multiple Amazon S3 buckets across AWS Regions. The company wants to report on incomplete multipart uploads for cost compliance purposes. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Configure S3 Storage Lens to report the incomplete multipart upload object count.',
    answerVariants: [
      'A. Use CloudTrail Lake queries to count incomplete multipart upload parts.',
      'B. Use Cost Explorer tags to infer multipart upload incompletion rates.',
      'C. Configure S3 Storage Lens to report the incomplete multipart upload object count.',
      'D. Use AWS Config managed rules for multipart upload age thresholds.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 629,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a production database on Amazon RDS for MySQL. The company wants to upgrade the database version for security compliance reasons. Because the database contains critical data, the company wants a quick solution to upgrade and test functionality without losing any data. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'D. Use Amazon RDS Blue/Green Deployments to deploy and test production changes.',
    answerVariants: [
      'A. Upgrade the production instance in place and test immediately after reboot.',
      'B. Restore a snapshot to a test DB and manually replay production writes.',
      'C. Create a read replica and promote it for version testing without switchover.',
      'D. Use Amazon RDS Blue/Green Deployments to deploy and test production changes.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 630,
    topicSlug: 'event-driven-and-messaging',
    question: 'A solutions architect is creating a data processing job that runs once daily and can take up to 2 hours to complete. If the job is interrupted, it has to restart from the beginning. How should the solutions architect address this issue in the MOST cost-effective manner?',
    answer: 'C. Use an Amazon Elastic Container Service (Amazon ECS) Fargate task triggered by an Amazon EventBridge scheduled event.',
    answerVariants: [
      'A. Use one EC2 instance with cron and restart on interruption.',
      'B. Use Lambda with a 15-minute timeout and chain invocations.',
      'C. Use an Amazon Elastic Container Service (Amazon ECS) Fargate task triggered by an Amazon EventBridge scheduled event.',
      'D. Use AWS Batch on Spot only with no retry behavior.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 631,
    topicSlug: 'database-performance-and-caching',
    question: 'A social media company wants to store its database of user profiles, relationships, and interactions in the AWS Cloud. The company needs an application to monitor any changes in the database. The application needs to analyze the relationships between the data entities and to provide recommendations to users. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use Amazon Neptune to store the information. Use Neptune Streams to process changes in the database.',
    answerVariants: [
      'A. Use Amazon RDS MySQL with triggers and polling for relationship analysis.',
      'B. Use Amazon Neptune to store the information. Use Neptune Streams to process changes in the database.',
      'C. Use DynamoDB global tables and scan all items for graph traversals.',
      'D. Use OpenSearch Service as the primary graph database and CDC source.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 632,
    topicSlug: 'storage-performance-patterns',
    question: 'A company is creating a new application that will store a large amount of data. The data will be analyzed hourly and will be modified by several Amazon EC2 Linux instances that are deployed across multiple Availability Zones. The needed amount of storage space will continue to grow for the next 6 months. Which storage solution should a solutions architect recommend to meet these requirements?',
    answer: 'C. Store the data in an Amazon Elastic File System (Amazon EFS) file system. Mount the file system on the application instances.',
    answerVariants: [
      'A. Use one EBS io2 volume and attach it to all EC2 instances.',
      'B. Store data in S3 Standard and mount directly as POSIX file system.',
      'C. Store the data in an Amazon Elastic File System (Amazon EFS) file system. Mount the file system on the application instances.',
      'D. Use instance store NVMe and replicate data hourly between instances.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 633,
    topicSlug: 'database-performance-and-caching',
    question: 'A company manages an application that stores data on an Amazon RDS for PostgreSQL Multi-AZ DB instance. Increases in traffic are causing performance problems. The company determines that database queries are the primary reason for the slow performance. What should a solutions architect do to improve the application\'s performance?',
    answer: 'C. Create a read replica from the source DB instance. Serve read traffic from the read replica.',
    answerVariants: [
      'A. Switch the primary DB to Single-AZ to reduce replication overhead.',
      'B. Increase max_connections and direct all traffic to the writer endpoint.',
      'C. Create a read replica from the source DB instance. Serve read traffic from the read replica.',
      'D. Use snapshots for read queries and restore daily for analytics.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 634,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company collects 10 GB of telemetry data daily from various machines. The company stores the data in an Amazon S3 bucket in a source data account. The company has hired several consulting agencies to use this data for analysis. Each agency needs read access to the data for its analysts. The company must share the data from the source data account by choosing a solution that maximizes security and operational efficiency. Which solution will meet these requirements?',
    answer: 'C. Configure cross-account access for the S3 bucket to the accounts that the agencies own.',
    answerVariants: [
      'A. Share one IAM user with all agencies and rotate access keys quarterly.',
      'B. Copy data into each agency account daily by custom Lambda jobs.',
      'C. Configure cross-account access for the S3 bucket to the accounts that the agencies own.',
      'D. Enable S3 public access and require agency IP allow lists.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 635,
    topicSlug: 'storage-performance-patterns',
    question: 'A company uses Amazon FSx for NetApp ONTAP in its primary AWS Region for CIFS and NFS file shares. Applications that run on Amazon EC2 instances access the file shares. The company needs a storage disaster recovery (DR) solution in a secondary Region. The data that is replicated in the secondary Region needs to be accessed by using the same protocols as the primary Region. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'C. Create an FSx for ONTAP instance in the secondary Region. Use NetApp SnapMirror to replicate data from the primary Region to the secondary Region.',
    answerVariants: [
      'A. Use EFS replication and expose SMB access through EC2 SMB gateways.',
      'B. Use DataSync one-way replication from ONTAP to S3 and restore on demand.',
      'C. Create an FSx for ONTAP instance in the secondary Region. Use NetApp SnapMirror to replicate data from the primary Region to the secondary Region.',
      'D. Use FSx for Lustre in secondary Region and mount with SMB/NFS simultaneously.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 636,
    topicSlug: 'event-driven-and-messaging',
    question: 'A development team is creating an event-based application that uses AWS Lambda functions. Events will be generated when files are added to an Amazon S3 bucket. The development team currently has Amazon Simple Notification Service (Amazon SNS) configured as the event target from Amazon S3. What should a solutions architect do to process the events from Amazon S3 in a scalable way?',
    answer: 'C. Create an SNS subscription that sends the event to Amazon Simple Queue Service (Amazon SQS). Configure the SQS queue to trigger a Lambda function.',
    answerVariants: [
      'A. Trigger Lambda directly from S3 and remove SNS to reduce components.',
      'B. Use SNS email subscriptions and parse messages into Lambda.',
      'C. Create an SNS subscription that sends the event to Amazon Simple Queue Service (Amazon SQS). Configure the SQS queue to trigger a Lambda function.',
      'D. Use CloudWatch Events polling the bucket for new objects every minute.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 637,
    topicSlug: 'database-performance-and-caching',
    question: 'A solutions architect is designing a new service behind Amazon API Gateway. The request patterns for the service will be unpredictable and can change suddenly from 0 requests to over 500 per second. The total size of the data that needs to be persisted in a backend database is currently less than 1 GB with unpredictable future growth. Data can be queried using simple key-value requests. Which combination ofAWS services would meet these requirements? (Choose two.)',
    answer: 'B. AWS Lambda',
    answerVariants: [
      'A. Amazon EMR',
      'B. AWS Lambda',
      'C. Amazon RDS for Oracle',
      'D. Amazon EC2 Auto Scaling with fixed capacity'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 638,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company collects and shares research data with the company\'s employees all over the world. The company wants to collect and store the data in an Amazon S3 bucket and process the data in the AWS Cloud. The company will share the data with the company\'s employees. The company needs a secure solution in the AWS Cloud that minimizes operational overhead. Which solution will meet these requirements?',
    answer: 'A. Store and process the dataset in Amazon S3 by using bucket policies, IAM roles, and serverless analytics services for controlled employee access.',
    answerVariants: [
      'A. Store and process the dataset in Amazon S3 by using bucket policies, IAM roles, and serverless analytics services for controlled employee access.',
      'B. Copy data to EC2 instance storage in each Region and share via SMB.',
      'C. Publish all data to a public CloudFront distribution with signed cookies.',
      'D. Use on-premises NAS as the source of truth and sync weekly to S3.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 639,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is building a new furniture inventory application. The company has deployed the application on a fleet ofAmazon EC2 instances across multiple Availability Zones. The EC2 instances run behind an Application Load Balancer (ALB) in their VPC.',
    answer: 'A. Enable the Application Load Balancer least outstanding requests routing algorithm to improve request distribution across targets.',
    answerVariants: [
      'A. Enable the Application Load Balancer least outstanding requests routing algorithm to improve request distribution across targets.',
      'B. Disable cross-zone load balancing and pin each client to one AZ.',
      'C. Use sticky sessions at ALB to spread traffic equally by cookie.',
      'D. Replace ALB with Route 53 weighted records to EC2 instance IPs.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 640,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has an application workflow that uses an AWS Lambda function to download and decrypt files from Amazon S3. These files are encrypted using AWS Key Management Service (AWS KMS) keys. A solutions architect needs to design a solution that will ensure the required permissions are set correctly. Which combination of actions accomplish this? (Choose two.)',
    answer: 'B. Grant the decrypt permission for the Lambda IAM role in the KMS key\'s policy',
    answerVariants: [
      'A. Grant decrypt permission only to the developer IAM user.',
      'B. Grant the decrypt permission for the Lambda IAM role in the KMS key\'s policy',
      'C. Put KMS key material in Lambda environment variables and decrypt locally.',
      'D. Add a bucket policy to S3 to allow kms:Decrypt for all principals.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 641,
    topicSlug: 'identity-access-and-governance',
    question: 'A company wants to monitor its AWS costs for financial review. The cloud operations team is designing an architecture in the AWS Organizations management account to query AWS Cost and Usage Reports for all member accounts. The team must run this query once a month and provide a detailed analysis of the bill. Which solution is the MOST scalable and cost-effective way to meet these requirements?',
    answer: 'B. Enable Cost and Usage Reports in the management account. Deliver the reports to Amazon S3. Use Amazon Athena for analysis.',
    answerVariants: [
      'A. Export monthly billing PDFs and process them by manual spreadsheet analysis.',
      'B. Enable Cost and Usage Reports in the management account. Deliver the reports to Amazon S3. Use Amazon Athena for analysis.',
      'C. Use CloudTrail management events to infer service-level billing details.',
      'D. Use Trusted Advisor cost checks as the primary monthly bill query source.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 642,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company wants to run a gaming application on Amazon EC2 instances that are part of an Auto Scaling group in the AWS Cloud. The application will transmit data by using UDP packets. The company wants to ensure that the application can scale out and in as traffic increases and decreases. What should a solutions architect do to meet these requirements?',
    answer: 'A. Attach a Network Load Balancer to the Auto Scaling group.',
    answerVariants: [
      'A. Attach a Network Load Balancer to the Auto Scaling group.',
      'B. Attach an Application Load Balancer to process UDP packets.',
      'C. Use Gateway Load Balancer with HTTP health checks for game traffic.',
      'D. Use CloudFront to proxy UDP packets to EC2 instances.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 643,
    topicSlug: 'storage-performance-patterns',
    question: 'A company runs several websites on AWS for its different brands. Each website generates tens of gigabytes of web traffic logs each day. A solutions architect needs to design a scalable solution to give the company\'s developers the ability to analyze traffic patterns across all the company\'s websites. This analysis by the developers will occur on demand once a week over the course of several months. The solution must support queries with standard SQL. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'A. Store the logs in Amazon S3. Use Amazon Athena for analysis.',
    answerVariants: [
      'A. Store the logs in Amazon S3. Use Amazon Athena for analysis.',
      'B. Store logs in EBS and run RDS SQL queries once each week.',
      'C. Store logs in DynamoDB and build custom parsers for full-text search.',
      'D. Use OpenSearch hot storage for all logs for several months continuously.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 644,
    topicSlug: 'storage-performance-patterns',
    question: 'An international company has a subdomain for each country that the company operates in. The subdomains are formatted as example.com, country1.example.com, and country2.example.com. The company\'s workloads are behind an Application Load Balancer. The company wants to encrypt the website data that is in transit. Which combination of steps will meet these requirements? (Choose two.)',
    answer: 'A. Use the AWS Certificate Manager (ACM) console to request a public certificate for the apex top domain example.com and a wildcard certificate for *.example.com.',
    answerVariants: [
      'A. Use the AWS Certificate Manager (ACM) console to request a public certificate for the apex top domain example.com and a wildcard certificate for *.example.com.',
      'B. Create one self-signed certificate on each ALB and rotate every year.',
      'C. Use IAM server certificates with CloudFront only for all subdomains.',
      'D. Use private ACM certificates and expose endpoints publicly over HTTPS.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 645,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is required to use cryptographic keys in its on-premises key manager. The key manager is outside of the AWS Cloud because of regulatory and compliance requirements. The company wants to manage encryption and decryption by using cryptographic keys that are retained outside of the AWS Cloud and that support a variety of external key managers from different vendors. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'B. Use an AWS Key Management Service (AWS KMS) external key store backed by an external key manager.',
    answerVariants: [
      'A. Use AWS CloudHSM only and migrate all keys fully into AWS-managed HSMs.',
      'B. Use an AWS Key Management Service (AWS KMS) external key store backed by an external key manager.',
      'C. Use customer managed KMS keys with imported key material and local rotation scripts.',
      'D. Use Secrets Manager and store third-party key manager credentials there.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 646,
    topicSlug: 'edge-and-global-routing',
    question: 'solutions architect needs to host a high performance computing (HPC) workload in the AWS Cloud. The workload will run on hundreds of Amazon EC2 instances and will require parallel access to a shared file system to enable distributed processing of large datasets. Datasets will be accessed across multiple instances simultaneously. The workload requires access latency within 1 ms. After processing has completed, engineers will need access to the dataset for manual postprocessing. Which solution will meet these requirements?',
    answer: 'C. Use Amazon FSx for Lustre as a shared file system. Link the file system to an Amazon S3 bucket for postprocessing.',
    answerVariants: [
      'A. Use Amazon EFS Standard for sub-millisecond HPC parallel I/O.',
      'B. Use EBS io2 Multi-Attach across hundreds of instances in multiple AZs.',
      'C. Use Amazon FSx for Lustre as a shared file system. Link the file system to an Amazon S3 bucket for postprocessing.',
      'D. Use S3 Standard with Transfer Acceleration for low-latency POSIX access.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 647,
    topicSlug: 'edge-and-global-routing',
    question: 'A gaming company is building an application with Voice over IP capabilities. The application will serve traffic to users across the world. The application needs to be highly available with an automated failover across AWS Regions. The company wants to minimize the latency of users without relying on IP address caching on user devices. What should a solutions architect do to meet these requirements?',
    answer: 'A. Use AWS Global Accelerator with health checks.',
    answerVariants: [
      'A. Use AWS Global Accelerator with health checks.',
      'B. Use Route 53 weighted records and rely on client DNS cache behavior.',
      'C. Use CloudFront only and route RTP/VoIP traffic through HTTP endpoints.',
      'D. Use one NLB in a single Region with cross-zone load balancing.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 648,
    topicSlug: 'edge-and-global-routing',
    question: 'A weather forecasting company needs to process hundreds of gigabytes of data with sub-millisecond latency. The company has a high performance computing (HPC) environment in its data center and wants to expand its forecasting capabilities.',
    answer: 'B. Use Amazon FSx for Lustre to provide shared, high-throughput, low-latency storage for thousands of HPC instances.',
    answerVariants: [
      'A. Use Amazon EFS One Zone to minimize latency for HPC workloads.',
      'B. Use Amazon FSx for Lustre to provide shared, high-throughput, low-latency storage for thousands of HPC instances.',
      'C. Use Amazon S3 Standard and mount it directly as POSIX scratch storage.',
      'D. Use FSx for Windows File Server for Linux HPC parallel I/O processing.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 649,
    topicSlug: 'monitoring-detection-and-response',
    question: 'An ecommerce company runs a PostgreSQL database on premises. The database stores data by using high IOPS Amazon Elastic Block Store (Amazon EBS) block storage. The daily peak I/O transactions per second do not exceed 15,000 IOPS. The company wants to migrate the database to Amazon RDS for PostgreSQL and provision disk IOPS performance independent of disk storage capacity. Which solution will meet these requirements MOST cost-effectively?',
    answer: 'C. Configure the General Purpose SSD (gp3) EBS volume storage type and provision 15,000 IOPS.',
    answerVariants: [
      'A. Configure magnetic storage and overprovision storage for higher throughput.',
      'B. Configure gp2 volumes and rely on burst credits for peak IOPS.',
      'C. Configure the General Purpose SSD (gp3) EBS volume storage type and provision 15,000 IOPS.',
      'D. Configure io1 with maximum IOPS and 10x required storage for safety.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 650,
    topicSlug: 'database-performance-and-caching',
    question: 'A company wants to migrate its on-premises Microsoft SQL Server Enterprise edition database to AWS. The company\'s online application uses the database to process transactions. The data analysis team uses the same production database to run reports for analytical processing. The company wants to reduce operational overhead by moving to managed services wherever possible. Which solution will meet these requirements with the LEAST operational overhead?',
    answer: 'A. Migrate to Amazon RDS for Microsoft SQL Server. Use read replicas for reporting purposes',
    answerVariants: [
      'A. Migrate to Amazon RDS for Microsoft SQL Server. Use read replicas for reporting purposes',
      'B. Migrate to EC2 self-managed SQL Server and run reports on the same instance.',
      'C. Migrate to DynamoDB and rewrite transactional/reporting queries immediately.',
      'D. Migrate to Aurora MySQL and use DMS full load only for cutover.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 651,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company stores a large volume of image files in an Amazon S3 bucket. The images need to be readily available for the first 180 days. The images are infrequently accessed for the next 180 days. After 360 days, the images need to be archived but must be available instantly upon request. After 5 years, only auditors can access the images. The auditors must be able to retrieve the images within 12 hours. The images cannot be lost during this process. C) Transition the objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 180 days, S3 Glacier Instant Retrieval after 360 days, and S3 Glacier Deep Archive after 5 years. Explanation: S3 Standard-IA (instead of One Zone-IA) ensures high durability across multiple AZs for infrequent access. Glacier Instant Retrieval meets the "instant availability" requirement after 360 days, while Glacier Deep Archive is cost-effective for audits after 5 years. (Option A/B use less durable One Zone-IA, and Option D uses slower Glacier Flexible Retrieval, which violates the "instant" requirement.) Answer: C) Configure the General Purpose SSD (gp3) EBS volume storage type and provision 15,000 IOPS. gp3 allows independent provisioning of IOPS (unlike gp2) and is more cost-effective than io1 for 15,000 IOPS. Magnetic volumes (Option D) are outdated and cannot meet the performance requirement.',
    answer: 'C. Transition the objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 180 days, S3 Glacier Instant Retrieval after 360 days, and S3 Glacier Deep Archive after 5 years.',
    answerVariants: [
      'A. Transition to S3 One Zone-IA after 180 days, then Glacier Flexible Retrieval after 360 days.',
      'B. Keep all data in S3 Standard for 5 years and restrict access with bucket policy.',
      'C. Transition the objects to S3 Standard-Infrequent Access (S3 Standard-IA) after 180 days, S3 Glacier Instant Retrieval after 360 days, and S3 Glacier Deep Archive after 5 years.',
      'D. Transition directly to S3 Glacier Flexible Retrieval at 360 days for instant retrieval.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 652,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has a large data workload that runs for 6 hours each day. The company cannot lose any data while the process is running. A solutions architect is designing an Amazon EMR cluster con guration to support this critical data workload. Which solution will meet these requirements MOST cost-effectively? Answer: B) Configure a transient cluster with primary/core nodes on On-Demand Instances and task nodes on Spot Instances. Transient clusters are cost-effective for short workloads. Spot Instances reduce costs for non-critical task nodes. Long-running clusters (Options A/D) are unnecessary for a 6-hour workload.',
    answer: 'B. Configure a transient cluster with primary/core nodes on On-Demand Instances and task nodes on Spot Instances.',
    answerVariants: [
      'A. Configure a long-running EMR cluster on On-Demand Instances only.',
      'B. Configure a transient cluster with primary/core nodes on On-Demand Instances and task nodes on Spot Instances.',
      'C. Run all EMR nodes on Spot Instances to minimize cost for critical workload.',
      'D. Use a persistent EMR cluster with one master node and no core nodes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 653,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company maintains an Amazon RDS database that maps users to cost centers. The company has accounts in an organization in AWS Organizations. The company needs a solution that will tag all resources that are created in a speci c AWS account in the organization. The solution must tag each resource with the cost center ID of the user who created the resource. Which solution will meet these requirements? Answer: B) Create a Lambda function triggered by EventBridge (via CloudTrail) to tag resources based on the RDS cost center DB. EventBridge + Lambda automates real-time tagging without manual intervention. SCPs (Option A) cannot dynamically tag resources, and scheduled rules (Option C) are not event-driven.',
    answer: 'B. Create a Lambda function triggered by EventBridge (via CloudTrail) to tag resources by looking up the creator\'s cost center in the RDS mapping database.',
    answerVariants: [
      'A. Use an SCP to enforce dynamic cost-center tags based on IAM usernames.',
      'B. Create a Lambda function triggered by EventBridge (via CloudTrail) to tag resources by looking up the creator\'s cost center in the RDS mapping database.',
      'C. Run a daily batch script that scans untagged resources and applies default tags.',
      'D. Require users to supply cost-center tags manually during resource creation.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 654,
    topicSlug: 'edge-and-global-routing',
    question: 'A company recently migrated its web application to the AWS Cloud. The company uses an Amazon EC2 instance to run multiple processes to host the application. The processes include an Apache web server that serves static content. The Apache web server makes requests to a PHP application that uses a local Redis server for user sessions. The company wants to redesign the architecture to be highly available and to use AWS managed solutions. Which solution will meet these requirements? Answer: D) Use CloudFront + S3 for static content, ALB + ECS Fargate for PHP, and Multi-AZ ElastiCache for Redis. Fully managed services (ECS, ElastiCache) ensure high availability. CloudFront improves static content delivery. Elastic Beanstalk (Option A) lacks decoupling, and Lambda (Option B) is unsuitable for PHP sessions.',
    answer: 'D. Use CloudFront with S3 for static content, run PHP application containers on ECS Fargate behind an ALB, and use Multi-AZ ElastiCache for Redis sessions.',
    answerVariants: [
      'A. Use one EC2 instance running Apache, PHP, and local Redis with EBS backups.',
      'B. Use Lambda for PHP stateful sessions and DynamoDB for static assets.',
      'C. Use Elastic Beanstalk single-instance deployment with local Redis caching.',
      'D. Use CloudFront with S3 for static content, run PHP application containers on ECS Fargate behind an ALB, and use Multi-AZ ElastiCache for Redis sessions.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 655,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs a web application on Amazon EC2 instances in an Auto Scaling group that has a target group. The company designed the application to work with session a nity (sticky sessions) for a better user experience. The application must be available publicly over the internet as an endpoint. A WAF must be applied to the endpoint for additional security. Session a nity (sticky sessions) must be con gured on the endpoint. Which combination of steps will meet these requirements? (Choose two.) Answers: C) Create a public ALB + E) Associate a WAF web ACL with the endpoint. ALB supports sticky sessions (unlike NLB/GWLB). WAF provides security. Elastic IPs (Option D) are not scalable.',
    answer: 'C. Create a public Application Load Balancer and configure sticky sessions on the ALB.',
    answerVariants: [
      'A. Create a public Network Load Balancer and enable sticky sessions with WAF rules.',
      'B. Create a Gateway Load Balancer and attach AWS WAF for HTTP stickiness.',
      'C. Create a public Application Load Balancer and configure sticky sessions on the ALB.',
      'D. Use Route 53 latency records directly to EC2 instances with session affinity.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 656,
    topicSlug: 'storage-performance-patterns',
    question: 'A company runs a website that stores images of historical events. Website users need the ability to search and view images based on the year that the event in the image occurred. On average, users request each image only once or twice a year. The company wants a highly available solution to store and deliver the images to users. Which solution will meet these requirements MOST cost-effectively? Answer: D) Store images in S3 Standard-IA and deliver via static website. Standard-IA is cost-effective for rarely accessed images. Static websites simplify delivery. EBS/EFS (Options A/B) are expensive and lack S3\'s durability.',
    answer: 'D. Store images in S3 Standard-Infrequent Access and serve them through a highly available web delivery layer.',
    answerVariants: [
      'A. Store images in EBS gp3 volumes attached to an Auto Scaling fleet.',
      'B. Store images in EFS with provisioned throughput for occasional access.',
      'C. Store images in S3 Glacier Deep Archive and restore objects for each request.',
      'D. Store images in S3 Standard-Infrequent Access and serve them through a highly available web delivery layer.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 657,
    topicSlug: 'identity-access-and-governance',
    question: 'A company has multiple AWS accounts in an organization in AWS Organizations that different business units use. The company has multiple o ces around the world. The company needs to update security group rules to allow new o ce CIDR ranges or to remove old CIDR ranges across the organization. The company wants to centralize the management of security group rules to minimize the administrative overhead that updating CIDR ranges requires. Which solution will meet these requirements MOST cost-effectively? Answer: B) Create a shared prefix list via AWS RAM and reference it in security groups. Prefix lists centralize CIDR management. AWS RAM enables cross-account sharing. Firewall Manager (Option D) is overkill for CIDR updates.',
    answer: 'B. Create and share a managed prefix list by using AWS RAM, and reference the prefix list in security group rules across accounts.',
    answerVariants: [
      'A. Update each account\'s security groups manually whenever CIDR ranges change.',
      'B. Create and share a managed prefix list by using AWS RAM, and reference the prefix list in security group rules across accounts.',
      'C. Use Route 53 Resolver rules to enforce CIDR updates in all security groups.',
      'D. Use AWS Firewall Manager policies only for static CIDR allow lists.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 658,
    topicSlug: 'edge-and-global-routing',
    question: 'A company uses an on-premises network-attached storage (NAS) system to provide le shares to its high performance computing (HPC) workloads. The company wants to migrate its latency-sensitive HPC workloads and its storage to the AWS Cloud. The company must be able to provide NFS and SMB multi-protocol access from the le system. Which solution will meet these requirements with the LEAST latency? (Choose two.) Answers: A) Deploy compute-optimized EC2 in a cluster placement group + E) Use FSx for NetApp ONTAP. Cluster placement minimizes latency. FSx for ONTAP supports multi-protocol (NFS/SMB) access. Lustre (Option C) lacks SMB support.',
    answer: 'A. Use compute-optimized EC2 instances in a cluster placement group and use Amazon FSx for NetApp ONTAP to provide NFS and SMB access.',
    answerVariants: [
      'A. Use compute-optimized EC2 instances in a cluster placement group and use Amazon FSx for NetApp ONTAP to provide NFS and SMB access.',
      'B. Use Amazon EFS with NFS and SMB dual-protocol support for lowest latency.',
      'C. Use FSx for Lustre for SMB and NFS multi-protocol support.',
      'D. Use S3 with DataSync gateways to provide simultaneous SMB and NFS access.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 659,
    topicSlug: 'edge-and-global-routing',
    question: 'A company is relocating its data center and wants to securely transfer 50 TB of data to AWS within 2 weeks. The existing data center has a Site-to- Site VPN connection to AWS that is 90% utilized. Which AWS service should a solutions architect use to meet these requirements? Answer: C) Use AWS Snowball Edge Storage Optimized. Snowball Edge is ideal for large offline transfers (50 TB in 2 weeks) without VPN bottlenecks. DataSync (Option A) is for online transfers; Direct Connect (Option B) is too slow.',
    answer: 'C. Use AWS Snowball Edge Storage Optimized devices to transfer the 50 TB dataset.',
    answerVariants: [
      'A. Use AWS DataSync over the existing VPN at 90% utilization.',
      'B. Provision a new Direct Connect connection and wait for installation.',
      'C. Use AWS Snowball Edge Storage Optimized devices to transfer the 50 TB dataset.',
      'D. Use S3 Transfer Acceleration from the data center over public internet.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 660,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company hosts an application on Amazon EC2 On-Demand Instances in an Auto Scaling group. Application peak hours occur at the same time each day. Application users report slow application performance at the start of peak hours. The application performs normally 2-3 hours after peak hours begin. The company wants to ensure that the application works properly at the start of peak hours. Which solution will meet these requirements? Answer: D) Configure scheduled scaling to launch instances before peak hours. Proactively scales instances to handle predictable traffic spikes. Dynamic scaling (Options B/C) reacts too slowly for known peaks.',
    answer: 'D. Configure scheduled scaling to launch EC2 instances before peak hours begin.',
    answerVariants: [
      'A. Use dynamic target tracking scaling and wait for CPU alarms at peak start.',
      'B. Use step scaling based on ELB request count without pre-scaling actions.',
      'C. Increase desired capacity permanently to peak size all day.',
      'D. Configure scheduled scaling to launch EC2 instances before peak hours begin.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 661,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs applications on AWS that connect to the company\'s Amazon RDS database. The applications scale on weekends and at peak times of the year. The company wants to scale the database more effectively for its applications that connect to the database. Which solution will meet these requirements with the LEAST operational overhead? Answer: B) Use Amazon RDS Proxy for connection pooling. RDS Proxy manages scaling connections with minimal code changes. DynamoDB (Option A) is incompatible with RDS.',
    answer: 'B. Use Amazon RDS Proxy for connection pooling.',
    answerVariants: [
      'A. Use DynamoDB Accelerator (DAX) in front of the RDS database.',
      'B. Use Amazon RDS Proxy for connection pooling.',
      'C. Increase DB instance size only during weekend scale windows.',
      'D. Use ElastiCache Memcached for write transaction buffering.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 662,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses AWS Cost Explorer to monitor its AWS costs. The company notices that Amazon Elastic Block Store (Amazon EBS) storage and snapshot costs increase every month. However, the company does not purchase additional EBS storage every month. The company wants to optimize monthly costs for its current storage usage. Which solution will meet these requirements with the LEAST operational overhead Answer: D) Delete nonessential snapshots + use Data Lifecycle Manager. Automates snapshot retention per policy, reducing costs. Manual resizing (Options A/B) adds overhead.',
    answer: 'D. Delete nonessential snapshots and use Data Lifecycle Manager to automate snapshot retention.',
    answerVariants: [
      'A. Increase EBS volume size to reduce snapshot frequency and cost.',
      'B. Convert all gp3 volumes to magnetic storage to reduce backup bills.',
      'C. Disable snapshots and rely on instance-store backups only.',
      'D. Delete nonessential snapshots and use Data Lifecycle Manager to automate snapshot retention.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 663,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company is developing a new application on AWS. The application consists of an Amazon Elastic Container Service (Amazon ECS) cluster, an Amazon S3 bucket that contains assets for the application, and an Amazon RDS for MySQL database that contains the dataset for the application. The dataset contains sensitive information. The company wants to ensure that only the ECS cluster can access the data in the RDS for MySQL database and the data in the S3 bucket. Which solution will meet these requirements? Answer: C) Restrict S3/RDS access via VPC endpoints + security groups. VPC endpoints keep traffic private. Security groups limit access to ECS subnets. KMS (Options A/B) doesn\'t restrict network access.',
    answer: 'C. Restrict S3 and RDS access by using VPC endpoints and security groups so only ECS tasks can connect.',
    answerVariants: [
      'A. Encrypt data with KMS and allow all VPC resources network access.',
      'B. Place ECS, S3, and RDS in public subnets and enforce IAM only.',
      'C. Restrict S3 and RDS access by using VPC endpoints and security groups so only ECS tasks can connect.',
      'D. Use Secrets Manager rotation to block all non-ECS network paths.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 664,
    topicSlug: 'edge-and-global-routing',
    question: 'A company has a web application that runs on premises. The application experiences latency issues during peak hours. The latency issues occur twice each month. At the start of a latency issue, the application\'s CPU utilization immediately increases to 10 times its normal amount. The company wants to migrate the application to AWS to improve latency. The company also wants to scale the application automatically when application demand increases. The company will use AWS Elastic Beanstalk for application deployment. Which solution will meet these requirements? Answer: A) Use Elastic Beanstalk with burstable instances (unlimited mode) + request-based scaling. Burstable instances handle CPU spikes cost-effectively. Request-based scaling matches demand. Compute-optimized instances (Option B) are overprovisioned for intermittent spikes.',
    answer: 'A. Use Elastic Beanstalk with burstable instances in unlimited mode and request-based scaling policies.',
    answerVariants: [
      'A. Use Elastic Beanstalk with burstable instances in unlimited mode and request-based scaling policies.',
      'B. Use compute-optimized fixed-size instances without Auto Scaling.',
      'C. Use one large memory-optimized instance and scale manually on incident.',
      'D. Use spot-only environments for all web application traffic.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 665,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company has customers located across the world. The company wants to use automation to secure its systems and network infrastructure. The company\'s security team must be able to track and audit all incremental changes to the infrastructure. Which solution will meet these requirements? Answer: B) Use AWS CloudFormation + AWS Config. CloudFormation automates infrastructure; Config tracks changes for auditing. Service Catalog (Options C/D) is for governance, not change tracking.',
    answer: 'B. Use AWS CloudFormation for infrastructure automation and AWS Config for change tracking and audit.',
    answerVariants: [
      'A. Use AWS Service Catalog portfolios only with no configuration tracking.',
      'B. Use AWS CloudFormation for infrastructure automation and AWS Config for change tracking and audit.',
      'C. Use manual CLI scripts and retain shell history for audit evidence.',
      'D. Use Security Hub only to track all infrastructure configuration changes.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 666,
    topicSlug: 'database-performance-and-caching',
    question: 'A startup company is hosting a website for its customers on an Amazon EC2 instance. The website consists of a stateless Python application and a MySQL database. The website serves only a small amount of tra c. The company is concerned about the reliability of the instance and needs to migrate to a highly available architecture. The company cannot modify the application code. Which combination of actions should a solutions architect take to achieve high availability for the website? (Choose two.) Answers: B) Migrate DB to RDS Multi-AZ + E) Use ALB + Auto Scaling for EC2. RDS Multi-AZ ensures DB high availability. ALB + Auto Scaling distributes traffic across AZs. DynamoDB (Option C) requires code changes; DataSync (Option D) doesn\'t solve HA.',
    answer: 'B. Migrate the database tier to Amazon RDS Multi-AZ and place the web tier behind an ALB with Auto Scaling across Availability Zones.',
    answerVariants: [
      'A. Keep the single EC2 + MySQL architecture and enable detailed monitoring.',
      'B. Migrate the database tier to Amazon RDS Multi-AZ and place the web tier behind an ALB with Auto Scaling across Availability Zones.',
      'C. Migrate the database to DynamoDB without changing application code.',
      'D. Use DataSync to replicate MySQL data between two EC2 instances.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 667,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A company is moving its data and applications to AWS during a multiyear migration project. The company wants to securely access data on Amazon S3 from the company\'s AWS Region and from the company\'s on-premises location. The data must not traverse the internet. The company has established an AWS Direct Connect connection between its Region and its on-premises location. Which solution will meet these requirements? Answer: A) Create S3 gateway endpoints. Gateway endpoints allow secure S3 access via Direct Connect/VPC without internet. Interface endpoints (Option C) are for private-link services, not S3.',
    answer: 'A. Create S3 gateway VPC endpoints so S3 access stays private over Direct Connect without traversing the internet.',
    answerVariants: [
      'A. Create S3 gateway VPC endpoints so S3 access stays private over Direct Connect without traversing the internet.',
      'B. Use NAT gateways for S3 access and route on-premises traffic through VPN.',
      'C. Use interface VPC endpoints for S3 as the only required configuration.',
      'D. Use public S3 endpoints with TLS and VPC egress filtering only.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 668,
    topicSlug: 'identity-access-and-governance',
    question: 'A company created a new organization in AWS Organizations. The organization has multiple accounts for the company\'s development teams. The development team members use AWS IAM Identity Center (AWS Single Sign-On) to access the accounts. For each of the company\'s applications, the development teams must use a prede ned application name to tag resources that are created.',
    answer: 'A. Use a tag policy with service control policies (SCPs) that deny resource creation when the required application-name tag is missing or invalid.',
    answerVariants: [
      'A. Use a tag policy with service control policies (SCPs) that deny resource creation when the required application-name tag is missing or invalid.',
      'B. Use AWS Budgets alerts to notify teams when resources are untagged.',
      'C. Use CloudTrail Lake queries monthly to enforce tag compliance retroactively.',
      'D. Use IAM user policies only in the management account for tag validation.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 669,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company runs its databases on Amazon RDS for PostgreSQL. The company wants a secure solution to manage the master user password by rotating the password every 30 days. Which solution will meet these requirements with the LEAST operational overhead? Answer: C) Use Secrets Manager with RDS for automated password rotation. Secrets Manager automates rotation every 30 days with zero operational effort. Manual rotation (Option B) or Parameter Store (Option D) lacks automation.',
    answer: 'C. Use AWS Secrets Manager integration with Amazon RDS to automate master password rotation every 30 days.',
    answerVariants: [
      'A. Store credentials in Parameter Store and rotate manually every month.',
      'B. Use RDS IAM authentication and disable password usage permanently.',
      'C. Use AWS Secrets Manager integration with Amazon RDS to automate master password rotation every 30 days.',
      'D. Rotate database passwords by Lambda script triggered from cron on EC2.'
    ],
    correctAnswerVariant: 'C',
  },
  {
    questionNumber: 670,
    topicSlug: 'database-performance-and-caching',
    question: 'A company performs tests on an application that uses an Amazon DynamoDB table. The tests run for 4 hours once a week. The company knows how many read and write operations the application performs to the table each second during the tests. The company does not currently use DynamoDB for any other use case. A solutions architect needs to optimize the costs for the table. Which solution will meet these requirements? Answer: B) Choose provisioned mode with calculated RCU/WCU. Provisioned mode is cost-effective for predictable weekly workloads. On-demand (Option A) is expensive for infrequent use.',
    answer: 'B. Use DynamoDB provisioned capacity mode with calculated RCU/WCU for the known weekly 4-hour test workload.',
    answerVariants: [
      'A. Use on-demand mode for all tests regardless of predictability.',
      'B. Use DynamoDB provisioned capacity mode with calculated RCU/WCU for the known weekly 4-hour test workload.',
      'C. Use DynamoDB Standard-IA with auto scaling disabled.',
      'D. Use one local DynamoDB instance on EC2 during tests only.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 671,
    topicSlug: 'monitoring-detection-and-response',
    question: 'A company runs its applications on Amazon EC2 instances. The company performs periodic nancial assessments of its AWS costs. The company recently identi ed unusual spending. The company needs a solution to prevent unusual spending. The solution must monitor costs and notify responsible stakeholders in the event of unusual spending. Which solution will meet these requirements? Answer: B) Create a Cost Anomaly Detection monitor. Automatically detects and alerts on unusual spending. CloudWatch (Option D) lacks built-in anomaly detection.',
    answer: 'B. Create an AWS Cost Anomaly Detection monitor and configure alerts for stakeholders.',
    answerVariants: [
      'A. Use Trusted Advisor checks and review recommendations monthly.',
      'B. Create an AWS Cost Anomaly Detection monitor and configure alerts for stakeholders.',
      'C. Use AWS Budgets fixed thresholds only for annual spending plans.',
      'D. Use CloudWatch CPU alarms to infer unusual spending events.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 672,
    topicSlug: 'storage-and-data-transfer-optimization',
    question: 'A marketing company receives a large amount of new clickstream data in Amazon S3 from a marketing campaign. The company needs to analyze the clickstream data in Amazon S3 quickly. Then the company needs to determine whether to process the data further in the data pipeline. Which solution will meet these requirements with the LEAST operational overhead? Answer: B) Use AWS Glue crawler + Athena for ad-hoc queries. Glue catalogs data; Athena provides serverless SQL queries. EMR (Option C) adds operational overhead.',
    answer: 'B. Use an AWS Glue crawler to catalog new S3 clickstream data and query it quickly with Amazon Athena.',
    answerVariants: [
      'A. Use Amazon EMR clusters for each campaign and run Spark jobs manually.',
      'B. Use an AWS Glue crawler to catalog new S3 clickstream data and query it quickly with Amazon Athena.',
      'C. Load all data into RDS before deciding whether to process further.',
      'D. Use Redshift Serverless ingestion for all clickstream files immediately.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 673,
    topicSlug: 'identity-access-and-governance',
    question: 'A company runs an SMB le server in its data center. The le server stores large les that the company frequently accesses for up to 7 days after the le creation date. After 7 days, the company needs to be able to access the les with a maximum retrieval time of 24 hours. Which solution will meet these requirements? Answer: B) Use S3 File Gateway + Lifecycle policy to Glacier Deep Archive. File Gateway extends on-prem storage; Glacier Deep Archive is cost-effective for archives. DataSync (Option A) doesn\'t automate tiering.',
    answer: 'B. Use AWS Storage Gateway File Gateway with lifecycle policies to transition older files to archive storage tiers.',
    answerVariants: [
      'A. Use DataSync one-time transfer and keep active archive management manual.',
      'B. Use AWS Storage Gateway File Gateway with lifecycle policies to transition older files to archive storage tiers.',
      'C. Use FSx for Windows and backup to S3 Glacier Deep Archive daily.',
      'D. Use EFS Infrequent Access with SMB protocol from on-premises clients.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 674,
    topicSlug: 'database-performance-and-caching',
    question: 'A company runs a web application on Amazon EC2 instances in an Auto Scaling group. The application uses a database that runs on an Amazon RDS for PostgreSQL DB instance. The application performs slowly when tra c increases. The database experiences a heavy read load during periods of high tra c. Which actions should a solutions architect take to resolve these performance issues? (Choose two.) Answers: B) Create a read replica + D) Use ElastiCache for caching. Read replicas offload read traffic. ElastiCache reduces DB load. Multi-AZ (Option C) doesn\'t scale reads; auto scaling (Option A) isn\'t for RDS.',
    answer: 'B. Create a read replica for PostgreSQL and direct read-heavy traffic to the replica.',
    answerVariants: [
      'A. Enable Multi-AZ only and keep all reads and writes on the writer endpoint.',
      'B. Create a read replica for PostgreSQL and direct read-heavy traffic to the replica.',
      'C. Increase application Auto Scaling desired capacity to reduce DB read load.',
      'D. Disable connection pooling and increase max_connections on the writer.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 675,
    topicSlug: 'identity-access-and-governance',
    question: 'A company uses Amazon EC2 instances and Amazon Elastic Block Store (Amazon EBS) volumes to run an application. The company creates one snapshot of each EBS volume every day to meet compliance requirements. The company wants to implement an architecture that prevents the accidental deletion of EBS volume snapshots. The solution must not change the administrative rights of the storage administrator user. Which solution will meet these requirements with the LEAST administrative effort? Answer: D) Lock the EBS snapshots. Prevents accidental deletion without IAM changes. Recycle Bin (Option C) requires tagging; IAM (Option B) changes permissions.',
    answer: 'D. Use EBS snapshot lock controls to prevent accidental deletion while keeping existing admin permissions.',
    answerVariants: [
      'A. Remove delete permissions from storage admins in IAM policies.',
      'B. Move snapshots to a separate account and block all administrator access.',
      'C. Require manual approval workflow in ServiceNow before deleting snapshots.',
      'D. Use EBS snapshot lock controls to prevent accidental deletion while keeping existing admin permissions.'
    ],
    correctAnswerVariant: 'D',
  },
  {
    questionNumber: 676,
    topicSlug: 'event-driven-and-messaging',
    question: 'A company\'s application uses Network Load Balancers, Auto Scaling groups, Amazon EC2 instances, and databases that are deployed in an Amazon VPC. The company wants to capture information about tra c to and from the network interfaces in near real time in its Amazon VPC. The company wants to send the information to Amazon OpenSearch Service for analysis. Which solution will meet these requirements? Answer: B) Use VPC Flow Logs  CloudWatch  Kinesis Firehose  OpenSearch. Flow Logs capture traffic; Firehose streams to OpenSearch. CloudTrail (Options C/D) logs API calls, not network traffic.',
    answer: 'B. Publish VPC Flow Logs to CloudWatch Logs, stream to Kinesis Data Firehose, and deliver to OpenSearch Service for analysis.',
    answerVariants: [
      'A. Use CloudTrail data events and export to OpenSearch for network packet analysis.',
      'B. Publish VPC Flow Logs to CloudWatch Logs, stream to Kinesis Data Firehose, and deliver to OpenSearch Service for analysis.',
      'C. Enable ALB access logs and infer all VPC network interface traffic.',
      'D. Use GuardDuty findings as the primary near real-time traffic telemetry feed.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 677,
    topicSlug: 'compute-selection-and-scaling',
    question: 'A company is developing an application that will run on a production Amazon Elastic Kubernetes Service (Amazon EKS) cluster. The EKS cluster has managed node groups that are provisioned with On-Demand Instances. The company needs a dedicated EKS cluster for development work. The company will use the development cluster infrequently to test the resiliency of the application. The EKS cluster must manage all the nodes. Which solution will meet these requirements MOST cost-effectively? Answer: B) Use mixed On-Demand + Spot Instances in managed node groups. Balances cost (Spot) and reliability (On-Demand) for infrequent dev workloads. All-Spot (Option A) risks interruptions; self-managed ASG (Option C) adds overhead.',
    answer: 'B. Use managed node groups with a mix of On-Demand and Spot Instances for the development EKS cluster.',
    answerVariants: [
      'A. Use Spot Instances only for all managed node groups in development.',
      'B. Use managed node groups with a mix of On-Demand and Spot Instances for the development EKS cluster.',
      'C. Use self-managed node groups on EC2 to lower costs further.',
      'D. Use Fargate profiles only for all workloads regardless of test patterns.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 678,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company stores sensitive data in Amazon S3. A solutions architect needs to create an encryption solution. The company needs to fully control the ability of users to create, rotate, and disable encryption keys with minimal effort for any data that must be encrypted. Which solution will meet these requirements? Answer: B) Use customer-managed KMS keys (SSE-KMS). Grants full control over key rotation/access. SSE-S3 (Option A) lacks key management. Client-side encryption (Option D) is complex.',
    answer: 'B. Use customer managed AWS KMS keys (SSE-KMS) so the company controls key creation, rotation, and disable actions.',
    answerVariants: [
      'A. Use SSE-S3 so AWS fully manages encryption and key rotation.',
      'B. Use customer managed AWS KMS keys (SSE-KMS) so the company controls key creation, rotation, and disable actions.',
      'C. Use client-side encryption with hardcoded keys in application code.',
      'D. Use imported key material in KMS and rotate keys manually in scripts only.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 679,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company wants to back up its on-premises virtual machines (VMs) to AWS. The company\'s backup solution exports on-premises backups to an Amazon S3 bucket as objects. The S3 backups must be retained for 30 days and must be automatically deleted after 30 days. Which combination of steps will meet these requirements? (Choose three.) Answers: B) Enable versioning + C) Set 30-day retention + E) Expire objects after 30 days. Versioning + retention policies automate compliance. Lifecycle rules expire objects. Object Lock (Option A) prevents deletion; tagging (Option F) doesn\'t enforce retention.',
    answer: 'B. Enable S3 versioning, apply retention controls for 30 days, and configure lifecycle expiration to delete backups after 30 days.',
    answerVariants: [
      'A. Disable versioning and use one-time lifecycle expiration after upload.',
      'B. Enable S3 versioning, apply retention controls for 30 days, and configure lifecycle expiration to delete backups after 30 days.',
      'C. Use S3 Glacier Deep Archive immediately with no object retention policy.',
      'D. Use DynamoDB TTL metadata to expire S3 objects automatically.'
    ],
    correctAnswerVariant: 'B',
  },
  {
    questionNumber: 680,
    topicSlug: 'storage-performance-patterns',
    question: 'A solutions architect needs to copy les from an Amazon S3 bucket to an Amazon Elastic File System (Amazon EFS) le system and another S3 bucket. The les must be copied continuously. New les are added to the original S3 bucket consistently. The copied les should be overwritten only if the source le changes. Which solution will meet these requirements with the LEAST operational overhead? Answer: A) Use DataSync with "changed data only" mode. Continuously syncs only modified files to S3/EFS. Lambda (Option B) requires custom code; full syncs (Option C) are inefficient.',
    answer: 'A. Use AWS DataSync continuous tasks configured to copy only changed files from the source bucket to EFS and the target S3 bucket.',
    answerVariants: [
      'A. Use AWS DataSync continuous tasks configured to copy only changed files from the source bucket to EFS and the target S3 bucket.',
      'B. Use Lambda triggers per object and full recursive copy for each change.',
      'C. Use nightly AWS Batch jobs to sync all files regardless of modifications.',
      'D. Use S3 replication rules to copy objects directly into EFS mount targets.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 681,
    topicSlug: 'data-protection-and-key-management',
    question: 'A company uses Amazon EC2 instances and stores data on Amazon Elastic Block Store (Amazon EBS) volumes. The company must ensure that all data is encrypted at rest by using AWS Key Management Service (AWS KMS). The company must be able to control rotation of the encryption keys. Which solution will meet these requirements with the LEAST operational overhead? Answer: A) Use customer-managed KMS keys for EBS encryption. Allows control over key rotation. AWS-managed keys (Option B) limit rotation flexibility.',
    answer: 'A. Use customer managed AWS KMS keys for EBS encryption to control key rotation while keeping operational overhead low.',
    answerVariants: [
      'A. Use customer managed AWS KMS keys for EBS encryption to control key rotation while keeping operational overhead low.',
      'B. Use AWS managed EBS encryption keys and rotate them manually each month.',
      'C. Encrypt EBS snapshots only and leave active volumes unencrypted.',
      'D. Use client-side encryption libraries on each EC2 instance for EBS volumes.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 682,
    topicSlug: 'identity-access-and-governance',
    question: 'A company needs a solution to enforce data encryption at rest on Amazon EC2 instances. The solution must automatically identify noncompliant resources and enforce compliance policies on ndings. Which solution will meet these requirements with the LEAST administrative overhead? Answer: A) Use IAM + AWS Config + Systems Manager for enforcement. Config detects noncompliant volumes; Systems Manager automates remediation. Macie (Option C) is for data classification, not encryption.',
    answer: 'A. Use AWS Config rules to detect unencrypted resources and AWS Systems Manager Automation to remediate findings automatically.',
    answerVariants: [
      'A. Use AWS Config rules to detect unencrypted resources and AWS Systems Manager Automation to remediate findings automatically.',
      'B. Use AWS IAM Access Analyzer to detect EBS encryption noncompliance.',
      'C. Use Amazon Macie to discover unencrypted EC2 block devices.',
      'D. Use Security Hub custom insights only without automated remediation.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 683,
    topicSlug: 'database-performance-and-caching',
    question: 'A company is migrating its multi-tier on-premises application to AWS. The application consists of a single-node MySQL database and a multi-node web tier. The company must minimize changes to the application during the migration. The company wants to improve application resiliency after the migration. Which combination of steps will meet these requirements? (Choose two.) Answers: A) Migrate web tier to ALB + Auto Scaling + C) Migrate DB to RDS Multi-AZ. Auto Scaling improves web tier resiliency; RDS Multi-AZ ensures DB HA. Lambda (Option D) requires code changes; DynamoDB (Option E) is incompatible.',
    answer: 'A. Migrate the web tier behind an ALB with Auto Scaling and migrate MySQL to Amazon RDS Multi-AZ for improved resiliency.',
    answerVariants: [
      'A. Migrate the web tier behind an ALB with Auto Scaling and migrate MySQL to Amazon RDS Multi-AZ for improved resiliency.',
      'B. Keep the web tier on one EC2 instance and add CloudFront for resilience.',
      'C. Migrate MySQL to DynamoDB without changing application data access.',
      'D. Use AWS Lambda for the web tier and local MySQL on EC2 for persistence.'
    ],
    correctAnswerVariant: 'A',
  },
  {
    questionNumber: 684,
    topicSlug: 'edge-and-global-routing',
    question: 'A company wants to migrate its web applications from on premises to AWS. The company is located close to the eu-central-1 Region. Because of regulations, the company cannot launch some of its applications in eu-central-1. The company wants to achieve single-digit millisecond latency. Which solution will meet these requirements? Answer: B) Deploy in AWS Local Zones. Local Zones provide single-digit latency near eu-central-1 while complying with regulations. CloudFront (Option A) is for caching, not app hosting.',
    answer: 'B. Deploy the applications in AWS Local Zones to achieve single-digit millisecond latency while meeting regional constraints.',
    answerVariants: [
      'A. Deploy in eu-central-1 and use CloudFront edge caching for all workloads.',
      'B. Deploy the applications in AWS Local Zones to achieve single-digit millisecond latency while meeting regional constraints.',
      'C. Deploy in a distant Region and use Global Accelerator for single-digit latency.',
      'D. Deploy on Outposts in a single data center and route all users through VPN.'
    ],
    correctAnswerVariant: 'B',
  },
];

export const SAA_C03_QUESTIONS: SeedSaaC03Question[] = RAW_SAA_C03_QUESTIONS.map((question) => {
  if (question.answerVariants?.length === 4 && question.correctAnswerVariant) {
    const correctLine =
      question.answerVariants.find((variant) =>
        variant.startsWith(`${question.correctAnswerVariant}. `),
      ) ??
      question.answerVariants[0] ??
      `${question.correctAnswerVariant}. Insufficient source answer details to determine the exact option.`;

    return {
      questionNumber: question.questionNumber,
      topicSlug: question.topicSlug,
      question: question.question,
      answer: correctLine,
      answerVariants: question.answerVariants,
      correctAnswerVariant: question.correctAnswerVariant,
    };
  }

  const built = buildAnswerVariants(question.answer);
  return {
    questionNumber: question.questionNumber,
    topicSlug: question.topicSlug,
    question: question.question,
    answer: built.normalizedAnswer,
    answerVariants: built.answerVariants,
    correctAnswerVariant: built.correctAnswerVariant,
  };
});

export const SAA_C03_QUESTIONS_WITH_SOURCE_VARIANTS: SeedSaaC03Question[] = RAW_SAA_C03_QUESTIONS
  .filter((question) => question.answerVariants?.length === 4 && !!question.correctAnswerVariant)
  .map((question) => {
    const correctLine =
      question.answerVariants!.find((variant) =>
        variant.startsWith(`${question.correctAnswerVariant}. `),
      ) ??
      question.answerVariants![0] ??
      `${question.correctAnswerVariant}. Insufficient source answer details to determine the exact option.`;

    return {
      questionNumber: question.questionNumber,
      topicSlug: question.topicSlug,
      question: question.question,
      answer: correctLine,
      answerVariants: question.answerVariants!,
      correctAnswerVariant: question.correctAnswerVariant!,
    };
  });
