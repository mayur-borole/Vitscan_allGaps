from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from torch.optim import Adam
from torchvision import models

from app.config.settings import get_settings
from ml.data.dataset import build_dataloaders
from ml.evaluation.metrics import evaluate
from ml.preprocessing.transforms import build_eval_transforms, build_train_transforms


def build_model(architecture: str, num_classes: int) -> torch.nn.Module:
    if architecture == "mobilenet_v3_small":
        model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)
        for param in model.features.parameters():
            param.requires_grad = False
        model.classifier[-1] = torch.nn.Linear(model.classifier[-1].in_features, num_classes)
        return model

    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    for param in model.layer1.parameters():
        param.requires_grad = False
    for param in model.layer2.parameters():
        param.requires_grad = False
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    return model


def train(args: argparse.Namespace) -> None:
    settings = get_settings()
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    train_tf = build_train_transforms(settings.image_size, settings.mean, settings.std)
    eval_tf = build_eval_transforms(settings.image_size, settings.mean, settings.std)

    loaders = build_dataloaders(
        data_dir=Path(args.data_dir),
        train_transform=train_tf,
        eval_transform=eval_tf,
        image_size=settings.image_size,
        batch_size=args.batch_size,
        val_size=args.val_split,
        random_state=args.seed,
    )

    model = build_model(args.architecture, len(loaders.classes)).to(device)
    criterion = torch.nn.CrossEntropyLoss()
    optimizer = Adam((p for p in model.parameters() if p.requires_grad), lr=args.learning_rate)

    best_val_acc = 0.0
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for epoch in range(args.epochs):
        model.train()
        running_loss = 0.0
        for images, targets in loaders.train_loader:
            images, targets = images.to(device), targets.to(device)
            optimizer.zero_grad(set_to_none=True)
            logits = model(images)
            loss = criterion(logits, targets)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        train_loss = running_loss / max(len(loaders.train_loader), 1)
        val_metrics, val_loss = evaluate(model, loaders.val_loader, device)

        print(
            f"Epoch {epoch + 1}/{args.epochs} | "
            f"train_loss={train_loss:.4f} | val_loss={val_loss:.4f} | "
            f"val_acc={val_metrics.accuracy:.4f} | "
            f"precision={val_metrics.precision:.4f} | recall={val_metrics.recall:.4f}"
        )

        if val_metrics.accuracy >= best_val_acc:
            best_val_acc = val_metrics.accuracy
            torch.save(model.state_dict(), output_path)

    meta = {
        "architecture": args.architecture,
        "class_names": loaders.classes,
        "image_size": settings.image_size,
        "mean": settings.mean,
        "std": settings.std,
        "best_val_accuracy": best_val_acc,
    }
    with open(output_path.with_suffix(".meta.json"), "w", encoding="utf-8") as file:
        json.dump(meta, file, indent=2)

    print(f"Model saved to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train VitaScanAI image classifier")
    parser.add_argument("--data-dir", default="ml/data/dataset", help="Path to ImageFolder dataset root")
    parser.add_argument("--output", default="saved_models/vitascan_model.pth", help="Model output path")
    parser.add_argument("--architecture", default="resnet18", choices=["resnet18", "mobilenet_v3_small"])
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--learning-rate", type=float, default=1e-3)
    parser.add_argument("--val-split", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    train(parser.parse_args())
