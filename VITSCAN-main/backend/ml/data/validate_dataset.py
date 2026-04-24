from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path

from PIL import Image

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def validate_dataset(dataset_root: Path) -> dict:
    if not dataset_root.exists():
        raise FileNotFoundError(f"Dataset folder not found: {dataset_root}")

    class_counts: Counter[str] = Counter()
    broken_images: list[str] = []

    for class_dir in sorted(p for p in dataset_root.iterdir() if p.is_dir()):
        for path in class_dir.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in ALLOWED_EXTENSIONS:
                continue
            class_counts[class_dir.name] += 1
            try:
                with Image.open(path) as img:
                    img.verify()
            except Exception:
                broken_images.append(str(path))

    counts = list(class_counts.values())
    min_count = min(counts) if counts else 0
    max_count = max(counts) if counts else 0
    imbalance_ratio = (max_count / min_count) if min_count else 0

    return {
        "dataset_root": str(dataset_root),
        "classes": len(class_counts),
        "total_images": int(sum(class_counts.values())),
        "class_distribution": dict(class_counts),
        "broken_images": broken_images,
        "broken_count": len(broken_images),
        "min_class_size": min_count,
        "max_class_size": max_count,
        "imbalance_ratio": imbalance_ratio,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate prepared ImageFolder dataset")
    parser.add_argument("--dataset", default="ml/data/dataset", help="Dataset root")
    parser.add_argument("--report", default="ml/data/validation_report.json", help="Validation report output")
    args = parser.parse_args()

    report = validate_dataset(Path(args.dataset))
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print(json.dumps(report, indent=2))
    print(f"Saved report to: {report_path}")


if __name__ == "__main__":
    main()
