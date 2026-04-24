from dataclasses import dataclass

import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support


@dataclass
class Metrics:
    accuracy: float
    precision: float
    recall: float
    f1: float


def compute_metrics(y_true: list[int], y_pred: list[int]) -> Metrics:
    if not y_true:
        return Metrics(accuracy=0.0, precision=0.0, recall=0.0, f1=0.0)

    accuracy = accuracy_score(y_true, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_true,
        y_pred,
        average="weighted",
        zero_division=0,
    )
    return Metrics(accuracy=float(accuracy), precision=float(precision), recall=float(recall), f1=float(f1))


def evaluate(model: torch.nn.Module, loader, device: torch.device) -> tuple[Metrics, float]:
    model.eval()
    y_true: list[int] = []
    y_pred: list[int] = []
    total_loss = 0.0
    criterion = torch.nn.CrossEntropyLoss()

    with torch.inference_mode():
        for images, targets in loader:
            images, targets = images.to(device), targets.to(device)
            logits = model(images)
            loss = criterion(logits, targets)
            total_loss += loss.item()

            preds = torch.argmax(logits, dim=1)
            y_true.extend(targets.cpu().tolist())
            y_pred.extend(preds.cpu().tolist())

    metrics = compute_metrics(y_true, y_pred)
    avg_loss = total_loss / max(len(loader), 1)
    return metrics, avg_loss
