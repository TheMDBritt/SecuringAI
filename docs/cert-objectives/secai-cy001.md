# CompTIA SecAI+ CY0-001 V1: Official Exam Objectives

**Source:** CompTIA SecAI+ Certification Exam Objectives, Document Version 4.0 (2025)
**Original file:** `CompTIA_SecAI_CY0001_Exam_Objectives_4.0.pdf` (user-uploaded)
**Fetched / transcribed:** 2026-08-11
**Rule of use:** Every SecAI+ article, glossary term, quiz question, drill in this repo MUST cite an objective ID from this file (e.g. "SecAI+ 2.6 Attacks: Backdoor"). Never write from memory.

---

## Test details

- **Exam code:** CY0-001 V1
- **Number of questions:** Maximum of 60
- **Question types:** Multiple-choice and performance-based
- **Length:** 60 minutes
- **Recommended experience:** 3-4 years IT experience + ~2 years hands-on cybersecurity
- **Passing score:** 600 (on a scale of 100-900), approximately 67%

## Domain weights

| Domain | Title | Weight |
|---|---|---|
| 1.0 | Basic AI concepts related to cybersecurity | 17% |
| 2.0 | Securing AI systems | 40% |
| 3.0 | AI-assisted security | 24% |
| 4.0 | AI governance, risk, and compliance | 19% |

---

## 1.0 Basic AI concepts related to cybersecurity (17%)

### 1.1 Compare and contrast various AI types and techniques used in cybersecurity

- Types of AI
  - Generative AI
  - Machine learning
  - Statistical learning
  - Transformers
  - Deep learning
  - Generative adversarial networks (GANs)
  - Natural language processing (NLP)
    - Large language models (LLMs)
    - Small language models (SLMs)
- Model training techniques
  - Model validation
  - Supervised learning
  - Unsupervised learning
  - Reinforcement learning
  - Federated learning
  - Fine-tuning
    - Epoch
    - Pruning
    - Quantization
- Prompt engineering
  - System prompts
  - User prompts
  - One-shot prompting
  - Multi-shot prompting
  - Zero-shot prompting
  - System roles
  - Templates

### 1.2 Explain the importance of data security in relation to AI

- Data processing
  - Data cleansing
  - Data verification
  - Data lineage
  - Data integrity
  - Data provenance
  - Data augmentation
  - Data balancing
- Data types
  - Structured data
  - Semi-structured data
  - Unstructured data
- Watermarking
- Retrieval-augmented generation (RAG)
  - Vector storage
  - Embeddings

### 1.3 Explain the importance of security throughout the life cycle of AI

- Business use case
  - Alignment with corporate objectives
- Data collection
  - Trustworthiness
  - Authenticity
- Data preparation
- Model development/selection
- Model evaluation
- Deployment
- Validation
- Monitoring and maintenance
- Feedback and iteration
- Human-centric AI design principles
  - Human-in-the-loop
  - Human oversight
  - Human validation

---

## 2.0 Securing AI systems (40%)

### 2.1 Given a scenario, use AI threat-modeling resources

- OWASP Top 10
  - LLM Top 10
  - Machine Learning (ML) Security Top 10
- MIT AI Risk Repository
- MITRE Adversarial Threat Landscape for Artificial-Intelligence Systems (ATLAS)
- CVE AI Working Group
- Threat-modeling frameworks

### 2.2 Given a set of requirements, implement security controls for AI systems

- Model controls
  - Model evaluation
  - Model guardrails
    - Prompt templates
- Gateway controls
  - Prompt firewalls
  - Rate limits
  - Token limits
  - Input quotas
    - Data size
    - Quantity
  - Modality limits
  - Endpoint access controls
- Guardrail testing and validation

### 2.3 Given a scenario, implement appropriate access controls for AI systems

- Model access
- Data access
- Agent access
- Network/application programming interface (API) access

### 2.4 Given a scenario, implement data security controls for AI systems

- Encryption requirements
  - In transit
  - At rest
  - In use
- Data safety
  - Data anonymization
  - Data classification labels
  - Data redaction
  - Data masking
  - Data minimization

### 2.5 Given a scenario, implement monitoring and auditing for AI systems

- Prompt monitoring
  - Query
  - Response
- Log monitoring
- Log sanitization
- Log protection
- Response confidence level
- Rate monitoring
- AI cost monitoring
  - Prompts
  - Storage
  - Response
  - Processing
- Auditing for quality and compliance
  - Hallucinations
  - Accuracy
  - Bias and fairness
  - Access

### 2.6 Given a scenario, analyze the evidence of an attack and suggest compensating controls for AI systems

- Attacks
  - Backdoor attacks
  - Trojan attacks
  - Prompt injection
  - Poisoning
    - Model poisoning
    - Data poisoning
  - Jailbreaking
  - Input manipulation
  - Introducing biases
  - Circumventing AI guardrails
  - Manipulating application integrations
  - Model inversion
  - Model theft
  - AI supply chain attacks
  - Transfer learning attacks
  - Model skewing
  - Output integrity attacks
  - Membership inference
  - Insecure output handling
  - Model denial of service (DoS)
  - Sensitive information disclosure
  - Insecure plug-in design
  - Excessive agency
  - Overreliance
- Compensating controls
  - Prompt firewalls
  - Model guardrails
  - Access controls
  - Data integrity controls
  - Encryption
  - Prompt templates
  - Rate limiting
  - Least privilege

---

## 3.0 AI-assisted security (24%)

### 3.1 Given a scenario, use AI-enabled tools to facilitate security tasks

- Tools/applications
  - Integrated development environment (IDE) plug-ins
  - Browser plug-ins
  - Command-line interface (CLI) plug-ins
  - Chatbots
  - Personal assistants
  - Model Context Protocol (MCP) server
- Use cases
  - Signature matching
  - Code quality and linting
  - Vulnerability analysis
  - Automated penetration testing
  - Anomaly detection
  - Pattern recognition
  - Incident management
  - Threat modeling
  - Fraud detection
  - Translation
  - Summarization

### 3.2 Explain how AI enables or enhances attack vectors

- AI-generated content (deepfake)
  - Impersonation
  - Misinformation
  - Disinformation
- Adversarial networks
- Reconnaissance
- Social engineering
- Obfuscation
- Automated data correlation
- Automated attack generation
  - Attack vector discovery
  - Payloads
  - Malware
  - Honeypot
  - Distributed denial of service (DDoS)

### 3.3 Given a scenario, use AI to automate security tasks

- Scripting tools
  - Low-code
  - No-code
- Document synthesis and summarization
- Incident response ticket management
- Change management
  - AI-assisted approvals
  - Automated deployment/rollback
- AI agents
- Continuous integration and continuous deployment (CI/CD)
  - Code scanning
  - Software composition analysis
  - Unit testing
  - Regression testing
  - Model testing
  - Automated deployment/rollback

---

## 4.0 AI governance, risk, and compliance (19%)

### 4.1 Explain organizational governance structures that support AI

- Organizational structures
  - AI Center of Excellence
  - AI policies and procedures
- AI-related roles
  - Data scientist
  - AI architect
  - Machine learning engineer
  - Platform engineer
  - MLOps engineer
  - AI security architect
  - AI governance engineer
  - AI risk analyst
  - AI auditor
  - Data engineer

### 4.2 Explain risks associated with AI

- Responsible AI
  - Fairness
  - Reliability and safety
  - Transparency
  - Privacy and security
  - Differential privacy
  - Explainability
  - Inclusiveness
  - Accountability
  - Consistency
  - Awareness training
- Risks
  - Introduction of bias
  - Accidental data leakage
  - Reputational loss
  - Accuracy and performance of the model
  - Intellectual Property (IP)-related risks
  - Autonomous systems
- Shadow IT
  - Shadow AI

### 4.3 Summarize the impact of compliance on business use and development of AI

- European Union (EU) AI Act
- Organisation for Economic Co-operation and Development (OECD) standards
- International Organization for Standardization (ISO) AI standards
- National Institute of Standards and Technology (NIST) AI Risk Management Framework (AIRMF)
- Corporate policies
  - Sanctioned vs. unsanctioned
  - Private vs. public models
  - Sensitive data governance
- Third-party compliance evaluations
- Data sovereignty

---

## Official acronym list

AI · AIRMF · API · ATLAS · CDN · CI/CD · CLI · CPU · CRM · CVE · CWE · DAST · DDoS · DoS · EDR · ETL · EU · GAN · GDPR · GPU · GRC · HTTPS · IaC · IAM · IDE · IdP · IDS · IP · ISO · ITIL · ITSM · LAN · LDAP · LLM · MCP · MDLC · MFA · MIT · ML · MLOps · MSSP · NACL · NIST · NLP · OECD · OAuth · OWASP · PCI DSS · PII · RAG · RMF · SCA · SDLC · SIEM · SLM · SOAR · SOC · SOC 2 · SQL · SSH · TLS · VPC · WAF

## Sample hardware / software

Laptops · Cloud VMs · GPUs · NVidia Jetson Nano Orin · mobile devices · sandbox environment · LAN · virtual containers · large data sets · test data sets · Python · R · IDE · Jupyter · chatbots · LLMs · GitHub · Ollama · cloud-based AI studios · vector database · NoSQL database · Neo4j graph database.
