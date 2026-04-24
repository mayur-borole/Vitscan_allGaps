from io import BytesIO

import torch
from PIL import Image
from torchvision import transforms


def build_train_transforms(image_size: int, mean: tuple[float, float, float], std: tuple[float, float, float]) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.RandomAffine(degrees=0, scale=(0.9, 1.1)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ]
    )


def build_eval_transforms(image_size: int, mean: tuple[float, float, float], std: tuple[float, float, float]) -> transforms.Compose:
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ]
    )


def load_and_transform(image_bytes: bytes, transform: transforms.Compose) -> torch.Tensor:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image)
    return tensor.unsqueeze(0)
