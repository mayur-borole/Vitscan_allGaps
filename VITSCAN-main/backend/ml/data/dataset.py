from dataclasses import dataclass
from pathlib import Path

import numpy as np
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision.datasets import ImageFolder


@dataclass
class DatasetBundle:
    train_loader: DataLoader
    val_loader: DataLoader
    classes: list[str]


def build_dataloaders(
    data_dir: Path,
    train_transform,
    eval_transform,
    image_size: int,
    batch_size: int = 32,
    val_size: float = 0.2,
    random_state: int = 42,
) -> DatasetBundle:
    del image_size

    full = ImageFolder(root=data_dir)
    indices = list(range(len(full.samples)))
    labels = [sample[1] for sample in full.samples]

    train_idx, val_idx = train_test_split(
        indices,
        test_size=val_size,
        stratify=labels,
        random_state=random_state,
    )

    train_dataset = ImageFolder(root=data_dir, transform=train_transform)
    val_dataset = ImageFolder(root=data_dir, transform=eval_transform)

    train_dataset.samples = [full.samples[i] for i in train_idx]
    train_dataset.targets = [full.targets[i] for i in train_idx]
    train_dataset.imgs = train_dataset.samples

    val_dataset.samples = [full.samples[i] for i in val_idx]
    val_dataset.targets = [full.targets[i] for i in val_idx]
    val_dataset.imgs = val_dataset.samples

    class_counts = np.bincount(train_dataset.targets)
    class_weights = 1.0 / np.maximum(class_counts, 1)
    sample_weights = [class_weights[label] for label in train_dataset.targets]
    sampler = WeightedRandomSampler(sample_weights, num_samples=len(sample_weights), replacement=True)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, sampler=sampler, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)

    return DatasetBundle(train_loader=train_loader, val_loader=val_loader, classes=full.classes)
