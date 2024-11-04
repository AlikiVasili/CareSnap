import pandas as pd
import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
from transformers import AdamW, get_linear_schedule_with_warmup, AutoTokenizer, AutoModel
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MultiLabelBinarizer
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, roc_curve, auc, f1_score
import matplotlib.pyplot as plt

class TextClassificationDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_length):
        self.texts = texts
        self.labels = labels  # Multi-label vectors (e.g., [1, 0, 1])
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        label = self.labels[idx]
        encoding = self.tokenizer(text, return_tensors='pt', max_length=self.max_length, padding='max_length', truncation=True)
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.float)
        }

class RoBERTaClassifier(nn.Module):
    def __init__(self, roberta_model_name, num_classes):
        super(RoBERTaClassifier, self).__init__()
        self.roberta = AutoModel.from_pretrained(roberta_model_name)
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(self.roberta.config.hidden_size, num_classes)

    def forward(self, input_ids, attention_mask):
        outputs = self.roberta(input_ids=input_ids, attention_mask=attention_mask)
        x = outputs.last_hidden_state[:, 0, :]  # CLS token from last hidden state
        x = self.dropout(x)
        logits = self.fc(x)
        return logits

    def train_model(self, data_loader, optimizer, scheduler, device):
        self.train()
        total_loss = 0
        for batch in data_loader:
            optimizer.zero_grad()
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            outputs = self(input_ids=input_ids, attention_mask=attention_mask)
            loss = nn.BCEWithLogitsLoss()(outputs, labels)
            loss.backward()
            optimizer.step()
            scheduler.step()
            total_loss += loss.item()
        return total_loss / len(data_loader)

    def evaluate(self, data_loader, device, threshold=0.5):
        self.eval()
        predictions = []
        actual_labels = []
        probs = []
        with torch.no_grad():
            for batch in data_loader:
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)
                outputs = self(input_ids=input_ids, attention_mask=attention_mask)
                preds = torch.sigmoid(outputs)
                preds = (preds > threshold).float()
                predictions.extend(preds.cpu().tolist())
                actual_labels.extend(labels.cpu().tolist())
                probs.extend(preds.cpu().tolist())

        return classification_report(np.array(actual_labels), np.array(predictions), zero_division=1, target_names=mlb.classes_, output_dict=True), np.array(probs), np.array(actual_labels)

    def predict(self, text, tokenizer, device, threshold=0.5):
        encoding = tokenizer(text, return_tensors='pt', max_length=128, padding='max_length', truncation=True)
        input_ids = encoding['input_ids'].to(device)
        attention_mask = encoding['attention_mask'].to(device)
        with torch.no_grad():
            outputs = self(input_ids=input_ids, attention_mask=attention_mask)
            preds = torch.sigmoid(outputs)
            preds = (preds > threshold).float()
        return preds.cpu().numpy()

def load_data(file_path):
    df = pd.read_csv(file_path, delimiter=",")
    df['intent'] = df['intent'].apply(lambda x: x.split('/'))
    return df['input'].tolist(), df['intent'].tolist()

def plot_roc_curve(actual_labels, probs, num_classes):
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    for i in range(num_classes):
        fpr[i], tpr[i], _ = roc_curve(actual_labels[:, i], probs[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])

    plt.figure()
    for i in range(num_classes):
        plt.plot(fpr[i], tpr[i], label=f'Class {i} (AUC = {roc_auc[i]:.2f})')

    plt.plot([0, 1], [0, 1], 'k--', label="Chance")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('ROC Curve for Multi-label Classification')
    plt.legend(loc="lower right")
    plt.show()

def main():
    data_file = "train_ml_shuffled.csv"
    inputs, intents = load_data(data_file)

    roberta_model_name = 'roberta-base'
    max_length = 128
    batch_size = 16
    num_epochs = 15
    learning_rate = 2e-5

    global mlb
    mlb = MultiLabelBinarizer()
    labels = mlb.fit_transform(intents)

    train_texts, val_texts, train_labels, val_labels = train_test_split(inputs, labels, test_size=0.1, random_state=0)

    tokenizer = AutoTokenizer.from_pretrained(roberta_model_name)
    train_dataset = TextClassificationDataset(train_texts, train_labels, tokenizer, max_length)
    val_dataset = TextClassificationDataset(val_texts, val_labels, tokenizer, max_length)

    train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_dataloader = DataLoader(val_dataset, batch_size=batch_size)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = RoBERTaClassifier(roberta_model_name, num_classes=len(mlb.classes_)).to(device)

    optimizer = AdamW(model.parameters(), lr=learning_rate)
    total_steps = len(train_dataloader) * num_epochs
    scheduler = get_linear_schedule_with_warmup(optimizer, num_warmup_steps=0, num_training_steps=total_steps)

    for epoch in range(num_epochs):
        print(f"Epoch {epoch + 1}/{num_epochs}")
        avg_train_loss = model.train_model(train_dataloader, optimizer, scheduler, device)
        print(f"Training loss: {avg_train_loss:.4f}")

        report, probs, actual_labels = model.evaluate(val_dataloader, device)
        print(f"F1 Score (macro): {report['macro avg']['f1-score']:.4f}")
        print(f"F1 Score (weighted): {report['weighted avg']['f1-score']:.4f}")

    plot_roc_curve(actual_labels, probs, num_classes=len(mlb.classes_))

    torch.save(model.state_dict(), "roberta_multi_label.pth")

    example_text = "Do I have any allergies that could affect my upcoming surgery?"
    print(f"Example input: {example_text}")
    
    model.eval()
    predictions = model.predict(example_text, tokenizer, device)

    predicted_labels = [mlb.classes_[i] for i in range(len(predictions[0])) if predictions[0][i] == 1]
    print(f"Predicted labels: {predicted_labels}")

if __name__ == "__main__":
    main()
