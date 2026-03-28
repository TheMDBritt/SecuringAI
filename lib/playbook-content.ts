import type { TopicArticle } from '@/types';

export const TOPIC_ARTICLES: TopicArticle[] = [

  // ─── AI & ML Fundamentals ─────────────────────────────────────────────────

  {
    id: 'ml-supervised-learning',
    category: 'AI & ML Fundamentals',
    title: 'Supervised Learning',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-900', 'Google-MLE'],
    vocab: ['Label', 'Feature', 'Training Set', 'Validation Set', 'Overfitting', 'Underfitting', 'Regularization'],
    content: `## Supervised Learning

Supervised learning trains a model on **labeled examples** — input–output pairs — so it can predict outputs for unseen inputs.

### Core Concepts

**Training Data**: A dataset of (input, label) pairs. The model learns a mapping \`f(x) → y\`.

**Features**: The input variables (columns) fed to the model. Good feature engineering is critical to performance.

**Labels**: The target output values. In classification these are discrete classes; in regression they are continuous values.

### Types of Problems

| Type | Output | Example |
|------|--------|---------|
| Binary Classification | 0 or 1 | Spam detection |
| Multi-class Classification | One of N classes | Image recognition |
| Regression | Continuous number | House price prediction |
| Multi-label | Multiple classes | Document tagging |

### The Bias-Variance Tradeoff

- **Underfitting (high bias)**: Model is too simple; fails on both training and test data.
- **Overfitting (high variance)**: Model memorizes training data; fails on new data.
- **Regularization** (L1/L2, dropout) penalizes complexity to reduce overfitting.

### Common Algorithms

- **Linear/Logistic Regression** — fast baselines for regression and binary classification
- **Decision Trees / Random Forests** — interpretable, handle mixed data types
- **Support Vector Machines (SVM)** — effective in high-dimensional spaces
- **Gradient Boosting (XGBoost, LightGBM)** — state-of-the-art on tabular data
- **Neural Networks** — required for images, text, audio

### Evaluation Metrics

- **Accuracy** — correct predictions / total (misleading on imbalanced data)
- **Precision / Recall / F1** — critical for imbalanced classes
- **AUC-ROC** — probability that model ranks a positive higher than a negative
- **MAE / RMSE** — for regression tasks

### Exam Tips (SecAI, AWS AIF-C01)
- Know the difference between training, validation, and test splits
- Understand why accuracy alone is insufficient for imbalanced datasets
- Be able to identify overfitting from learning curves`,
  },

  {
    id: 'ml-unsupervised-learning',
    category: 'AI & ML Fundamentals',
    title: 'Unsupervised Learning',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-900', 'Google-MLE'],
    vocab: ['Clustering', 'Dimensionality Reduction', 'Anomaly Detection', 'K-Means', 'PCA', 'Autoencoder'],
    content: `## Unsupervised Learning

Unsupervised learning finds patterns in **unlabeled data** — no predefined outputs are provided.

### Key Tasks

#### Clustering
Groups similar data points together. The model discovers structure without labels.

- **K-Means**: Assigns points to K centroids; iterates until convergence. Simple, scalable, sensitive to initialization.
- **DBSCAN**: Density-based; finds arbitrarily shaped clusters; identifies outliers as noise.
- **Hierarchical Clustering**: Builds a tree (dendrogram); no need to specify K upfront.

#### Dimensionality Reduction
Reduces the number of features while preserving meaningful structure.

- **PCA (Principal Component Analysis)**: Linear projection onto orthogonal axes of maximum variance.
- **t-SNE**: Non-linear; excellent for 2D/3D visualization of high-dimensional embeddings.
- **UMAP**: Faster than t-SNE; better preserves global structure.
- **Autoencoders**: Neural network that compresses then reconstructs input; latent space = compressed representation.

#### Anomaly Detection
Identifies data points that deviate significantly from learned patterns.

- **Isolation Forest**: Anomalies are easier to isolate; uses random feature splits.
- **One-Class SVM**: Learns a boundary around normal data.
- **Autoencoders**: High reconstruction error signals anomaly.

### Applications in AI Security

Unsupervised learning is widely used for:
- Detecting novel malware (no labels for zero-day threats)
- Network intrusion detection (anomaly baseline)
- User behavior analytics (UEBA)
- Clustering phishing campaigns

### Evaluation Challenges
Without ground truth labels, evaluation uses:
- **Silhouette score** — cohesion vs separation of clusters
- **Inertia** — sum of squared distances to nearest centroid (K-Means)
- Domain expert review

### Exam Tips
- Understand when to use clustering vs anomaly detection
- Know that K-Means requires specifying K; DBSCAN does not
- Autoencoders can serve both dimensionality reduction and anomaly detection`,
  },

  {
    id: 'ml-neural-networks',
    category: 'AI & ML Fundamentals',
    title: 'Neural Networks & Deep Learning',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-900', 'Azure-AI-102', 'Google-MLE'],
    vocab: ['Neuron', 'Layer', 'Activation Function', 'Backpropagation', 'Gradient Descent', 'Batch Size', 'Epoch', 'Dropout'],
    content: `## Neural Networks & Deep Learning

Neural networks are computational models loosely inspired by biological brains, composed of layers of interconnected **neurons**.

### Architecture

\`\`\`
Input Layer → Hidden Layers → Output Layer
\`\`\`

- **Input Layer**: Receives raw features (pixels, tokens, numbers)
- **Hidden Layers**: Learn intermediate representations; depth = "deep" learning
- **Output Layer**: Produces predictions (logits, probabilities, values)

Each neuron computes: \`output = activation(weights · inputs + bias)\`

### Activation Functions

| Function | Formula | Use Case |
|----------|---------|----------|
| ReLU | max(0, x) | Hidden layers (default) |
| Sigmoid | 1/(1+e^-x) | Binary output |
| Softmax | e^x / Σe^x | Multi-class output |
| GELU | ~x·Φ(x) | Transformers |
| Tanh | (e^x−e^-x)/(e^x+e^-x) | RNNs |

### Training Process

1. **Forward Pass**: Compute predictions from input to output
2. **Loss Calculation**: Measure error (cross-entropy, MSE, etc.)
3. **Backward Pass (Backpropagation)**: Compute gradients of loss w.r.t. weights via chain rule
4. **Weight Update**: Apply optimizer (SGD, Adam) to reduce loss
5. **Repeat** for multiple epochs

### Key Hyperparameters

- **Learning Rate**: Step size for weight updates; too high → divergence; too low → slow
- **Batch Size**: Samples per gradient update; smaller = noisier but generalizes better
- **Epochs**: Full passes through training data
- **Dropout Rate**: Fraction of neurons randomly disabled during training (regularization)

### Common Architectures

- **MLP (Multilayer Perceptron)**: Fully connected; tabular data
- **CNN**: Convolutional layers; images and spatial data
- **RNN / LSTM**: Sequential data; time series, text (largely superseded by Transformers)
- **Transformer**: Attention-based; NLP, vision, multimodal (dominant architecture today)

### Exam Tips
- Know what backpropagation does (gradient computation via chain rule)
- Understand dropout as a regularization technique
- Distinguish between overfitting signs and underfitting signs in training curves`,
  },

  {
    id: 'ml-training-pipeline',
    category: 'AI & ML Fundamentals',
    title: 'The ML Training Pipeline',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-900', 'Google-MLE', 'GIAC-GOAA'],
    vocab: ['Data Preprocessing', 'Feature Engineering', 'Train-Test Split', 'Cross-Validation', 'Hyperparameter Tuning', 'Model Evaluation', 'Model Deployment'],
    content: `## The ML Training Pipeline

Building a production ML model follows a repeatable pipeline from raw data to deployed service.

### Pipeline Stages

#### 1. Data Collection & Exploration
- Gather data from databases, APIs, sensors, or public datasets
- **EDA (Exploratory Data Analysis)**: Understand distributions, correlations, missing values
- Profile data quality: completeness, consistency, duplicates

#### 2. Data Preprocessing
- **Handling Missing Values**: Imputation (mean/median/mode) or row removal
- **Encoding Categoricals**: One-hot encoding, label encoding, target encoding
- **Feature Scaling**: StandardScaler (z-score), MinMaxScaler (0–1)
- **Outlier Treatment**: Clip, log-transform, or remove extreme values
- **Train/Validation/Test Split**: Typically 70/15/15 or 80/10/10

#### 3. Feature Engineering
- Create new features from raw data (ratios, date parts, text embeddings)
- **Feature Selection**: Remove low-importance or redundant features
- Dimensionality reduction (PCA) if needed

#### 4. Model Selection & Training
- Start with simple baselines (logistic regression, decision tree)
- Progress to complex models if needed
- Track experiments with MLflow, W&B, or similar

#### 5. Hyperparameter Tuning
- **Grid Search**: Exhaustive search over parameter grid
- **Random Search**: Samples parameter combinations randomly; more efficient
- **Bayesian Optimization**: Uses previous results to guide next search
- **Cross-Validation**: K-fold split to reliably estimate generalization

#### 6. Evaluation
- Evaluate on held-out **test set** (never used during training or tuning)
- Report appropriate metrics for the task type
- **Confusion Matrix**: Visualize TP/FP/TN/FN

#### 7. Deployment & Monitoring
- Package model as REST API or batch job
- Monitor for **data drift** (input distribution shift) and **concept drift** (relationship change)
- Retrain periodically or on trigger

### Security Considerations
- Data poisoning attacks target the data collection stage
- Model inversion and membership inference attacks target deployed models
- Access controls on training data and model artifacts are critical

### Exam Tips
- Know all stages in order
- Understand the difference between validation set (tuning) and test set (final eval)
- Be able to describe how cross-validation reduces overfitting risk`,
  },

  {
    id: 'ml-eval-metrics',
    category: 'AI & ML Fundamentals',
    title: 'Evaluation Metrics',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-900', 'Google-MLE'],
    vocab: ['Precision', 'Recall', 'F1 Score', 'AUC-ROC', 'Confusion Matrix', 'BLEU', 'Perplexity', 'RMSE'],
    content: `## Evaluation Metrics

Choosing the right metric is critical — optimizing the wrong one leads to misleading results.

### Classification Metrics

#### Confusion Matrix

|  | Predicted Positive | Predicted Negative |
|--|-------------------|-------------------|
| **Actual Positive** | TP | FN |
| **Actual Negative** | FP | TN |

- **Accuracy** = (TP+TN) / Total — misleading on imbalanced datasets
- **Precision** = TP / (TP+FP) — of predicted positives, how many are correct?
- **Recall (Sensitivity)** = TP / (TP+FN) — of actual positives, how many did we catch?
- **F1 Score** = 2 × (Precision × Recall) / (Precision + Recall) — harmonic mean; balances both
- **Specificity** = TN / (TN+FP) — true negative rate

#### When to Prioritize What
- **High Precision**: When false positives are costly (spam filter, fraud alerts)
- **High Recall**: When false negatives are costly (cancer screening, security threats)
- **F1**: When both matter equally

#### AUC-ROC
- Plots True Positive Rate vs False Positive Rate at all thresholds
- AUC = 1.0 is perfect; 0.5 is random guessing
- Threshold-independent: useful for model comparison

### Regression Metrics
- **MAE** (Mean Absolute Error): Average absolute difference; interpretable units
- **RMSE** (Root Mean Squared Error): Penalizes large errors more than MAE
- **R² (R-squared)**: Proportion of variance explained; 1.0 = perfect fit

### NLP / LLM Metrics
- **BLEU**: N-gram overlap between generated and reference text (machine translation)
- **ROUGE**: Recall-oriented overlap; used for summarization
- **Perplexity**: How well a language model predicts a sample; lower = better
- **BERTScore**: Semantic similarity using BERT embeddings

### AI Safety Metrics
- **Refusal Rate**: % of harmful prompts correctly refused
- **Hallucination Rate**: % of factually incorrect statements in output
- **Jailbreak Success Rate**: % of adversarial prompts that bypass guardrails

### Exam Tips
- Be able to compute precision, recall, F1 from a confusion matrix
- Know when AUC-ROC is preferred over accuracy
- Understand what perplexity measures in LLMs`,
  },


  // ─── Generative AI & LLMs ─────────────────────────────────────────────────

  {
    id: 'genai-transformer-architecture',
    category: 'Generative AI & LLMs',
    title: 'Transformer Architecture',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-102', 'Google-MLE', 'GIAC-GOAA'],
    vocab: ['Attention Mechanism', 'Self-Attention', 'Multi-Head Attention', 'Positional Encoding', 'Encoder', 'Decoder', 'KV Cache'],
    content: `## Transformer Architecture

The Transformer, introduced in "Attention Is All You Need" (2017), is the foundation of all modern LLMs.

### Why Transformers Replaced RNNs

RNNs process tokens sequentially — slow and unable to capture long-range dependencies. Transformers process all tokens **in parallel** using attention, making them faster to train and better at long-context understanding.

### Core Components

#### Self-Attention
Each token attends to every other token in the sequence. For each token, three vectors are computed:
- **Query (Q)**: What am I looking for?
- **Key (K)**: What do I contain?
- **Value (V)**: What do I return?

\`\`\`
Attention(Q, K, V) = softmax(QK^T / √d_k) · V
\`\`\`

The \`√d_k\` scaling prevents vanishing gradients with large dimensions.

#### Multi-Head Attention
Multiple attention heads run in parallel, each learning different relationship patterns (syntax, semantics, coreference). Outputs are concatenated and projected.

#### Positional Encoding
Since attention has no inherent order, position information is injected via:
- **Sinusoidal encodings** (original paper)
- **Rotary Position Embedding (RoPE)** — used in Llama, GPT-4
- **ALiBi** — linear bias added to attention scores

#### Feed-Forward Network (FFN)
After attention, each token is processed independently through a two-layer MLP with an activation function (ReLU or GELU).

#### Layer Normalization & Residual Connections
Applied before each sub-layer (Pre-LN) in modern models. Stabilizes training.

### Encoder vs Decoder

| Type | Architecture | Examples | Use Case |
|------|-------------|---------|----------|
| Encoder-only | Bidirectional attention | BERT, RoBERTa | Classification, embeddings |
| Decoder-only | Causal (masked) attention | GPT, Llama, Claude | Text generation |
| Encoder-Decoder | Both | T5, BART | Translation, summarization |

### KV Cache
During inference, key and value matrices are cached to avoid recomputation. This is why memory grows linearly with context length.

### Exam Tips
- Know the formula for scaled dot-product attention
- Understand why decoder-only models use causal masking
- Encoder-only = bidirectional (sees full context); Decoder = left-to-right only`,
  },

  {
    id: 'genai-prompt-engineering',
    category: 'Generative AI & LLMs',
    title: 'Prompt Engineering',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-102', 'GIAC-GOAA', 'CAISP'],
    vocab: ['System Prompt', 'Zero-Shot Prompting', 'Few-Shot Prompting', 'Chain-of-Thought', 'Role Prompting', 'Prompt Injection'],
    content: `## Prompt Engineering

Prompt engineering is the practice of designing inputs to LLMs to reliably produce desired outputs.

### Prompt Anatomy

A typical API prompt has three layers:

1. **System Prompt**: Instructions, persona, constraints, context. Sets model behavior.
2. **Few-Shot Examples**: Optional demonstrations of desired input→output pairs.
3. **User Message**: The actual request.

### Core Techniques

#### Zero-Shot
No examples provided. Works well for clearly stated tasks.
\`\`\`
Classify the sentiment of this review as positive, negative, or neutral:
"The product was delivered late but works perfectly."
\`\`\`

#### Few-Shot
Include 2–5 examples before the actual query. Dramatically improves consistency on complex formats.

#### Chain-of-Thought (CoT)
Instruct the model to reason step-by-step before answering. Improves performance on math, logic, and multi-step tasks.
\`\`\`
Think through this step by step before giving your final answer.
\`\`\`

#### Role Prompting
Assign the model a persona:
\`\`\`
You are a senior security analyst with expertise in incident response...
\`\`\`

#### Self-Consistency
Sample multiple CoT responses and take a majority vote. Reduces variance.

#### ReAct (Reason + Act)
Interleave reasoning steps with tool calls. Foundation for agentic AI.

### System Prompt Security

System prompts are the **primary defense layer** for LLM applications:
- Define what the model will and won't do
- Set output format and tone
- Include explicit refusal instructions for harmful categories

**Risks**:
- **Prompt Injection**: User input overrides system instructions
- **Jailbreaking**: Crafted prompts bypass safety guidelines
- **System Prompt Extraction**: Adversary extracts confidential system prompt

### Best Practices
- Be explicit and specific; avoid ambiguity
- Use structured output formats (JSON schema) for reliable parsing
- Test prompts against adversarial inputs before deployment
- Keep sensitive business logic out of system prompts when possible

### Exam Tips
- Know the difference between zero-shot, few-shot, and chain-of-thought
- Understand that system prompts are NOT a security boundary on their own
- Be able to identify prompt injection risks in application designs`,
  },

  {
    id: 'genai-rag',
    category: 'Generative AI & LLMs',
    title: 'Retrieval-Augmented Generation (RAG)',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-102', 'GIAC-GOAA', 'CAISP'],
    vocab: ['RAG', 'Vector Database', 'Embedding', 'Semantic Search', 'Chunking', 'Context Window', 'Grounding'],
    content: `## Retrieval-Augmented Generation (RAG)

RAG augments LLM responses by retrieving relevant documents from an external knowledge base before generation.

### Why RAG?

LLMs have a training cutoff and cannot access private or real-time data. RAG solves this by:
- **Grounding** responses in retrieved facts (reduces hallucination)
- Enabling access to **private/enterprise knowledge**
- Providing **citations** for verifiable answers
- Keeping knowledge current without retraining

### RAG Pipeline

\`\`\`
Query → Embed → Vector Search → Retrieve Chunks → Inject into Prompt → LLM → Response
\`\`\`

#### Step 1: Indexing (Offline)
1. Split documents into **chunks** (typically 256–1024 tokens)
2. Embed each chunk using an embedding model (e.g., text-embedding-ada-002)
3. Store vectors in a **vector database** (Pinecone, Weaviate, ChromaDB, pgvector)

#### Step 2: Retrieval (Online)
1. Embed the user query
2. Compute cosine similarity between query embedding and all chunk embeddings
3. Return top-K most similar chunks

#### Step 3: Generation
1. Inject retrieved chunks into the LLM context window
2. LLM generates a response grounded in the retrieved context

### Advanced RAG Techniques

- **Hybrid Search**: Combine dense (embedding) + sparse (BM25 keyword) retrieval
- **Re-ranking**: Use a cross-encoder to re-rank top-K results for better precision
- **HyDE (Hypothetical Document Embeddings)**: Generate a hypothetical answer, then search with it
- **Multi-hop RAG**: Iteratively retrieve across multiple documents for complex questions

### RAG Security Risks

| Attack | Description |
|--------|-------------|
| **RAG Poisoning** | Inject malicious documents into the knowledge base |
| **Indirect Prompt Injection** | Retrieved document contains hidden instructions |
| **Data Exfiltration via RAG** | Retrieved context leaked to attacker through output |

### Exam Tips
- Know the two phases: indexing and retrieval
- Understand that vector databases store embeddings, not raw text
- RAG reduces hallucination but does NOT eliminate it
- Indirect prompt injection via retrieved documents is a key LLM06 risk`,
  },

  {
    id: 'genai-fine-tuning',
    category: 'Generative AI & LLMs',
    title: 'Fine-Tuning & Parameter-Efficient Training',
    certTags: ['SecAI', 'AWS-AIF-C01', 'Azure-AI-102', 'Google-MLE'],
    vocab: ['Fine-Tuning', 'LoRA', 'QLoRA', 'PEFT', 'Instruction Tuning', 'RLHF', 'DPO'],
    content: `## Fine-Tuning & Parameter-Efficient Training

Fine-tuning adapts a pre-trained model to a specific task or domain by continuing training on task-specific data.

### Types of Fine-Tuning

#### Full Fine-Tuning
Updates all model weights. Requires significant GPU memory and data. Risk of **catastrophic forgetting** (losing general capabilities).

#### Instruction Tuning
Fine-tune on (instruction, response) pairs to improve instruction-following. Used to create chat models from base models.

#### RLHF (Reinforcement Learning from Human Feedback)
1. Collect human preference data (which response is better?)
2. Train a **reward model** from preferences
3. Use PPO to fine-tune the LLM to maximize reward

Used by GPT-4, Claude, Llama-2-chat.

#### DPO (Direct Preference Optimization)
Simpler alternative to RLHF that optimizes preferences directly without a separate reward model.

### Parameter-Efficient Fine-Tuning (PEFT)

PEFT methods update only a small fraction of parameters, dramatically reducing memory and compute requirements.

#### LoRA (Low-Rank Adaptation)
Freezes original weights; adds small trainable low-rank matrices to attention layers.
- Adds ~0.1–1% additional parameters
- Merge adapters back at inference for zero overhead
- Most popular PEFT technique

#### QLoRA (Quantized LoRA)
LoRA applied to a 4-bit quantized model. Enables fine-tuning large models on a single consumer GPU.

#### Prompt Tuning
Learn soft prompt tokens prepended to input. Only input embeddings are trained.

### When to Fine-Tune vs RAG

| Approach | Best For |
|---------|---------|
| RAG | Dynamic/private knowledge, factual grounding |
| Fine-tuning | Style/tone, domain-specific vocabulary, consistent behavior |
| Both | Best accuracy + knowledge combination |

### Security Risks in Fine-Tuning
- **Training Data Poisoning**: Malicious samples in fine-tuning data introduce backdoors
- **Model Stealing**: Fine-tuned model can be extracted via repeated querying
- **Backdoor Attacks**: Trigger phrases inserted during fine-tuning cause unexpected behavior

### Exam Tips
- LoRA is the most common PEFT technique — know how it works
- RLHF requires a reward model; DPO does not
- Fine-tuning changes model behavior; RAG changes model knowledge`,
  },

];
