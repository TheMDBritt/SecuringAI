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

];
