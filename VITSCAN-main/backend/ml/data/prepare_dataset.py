from __future__ import annotations

import argparse
import json
import shutil
from collections import Counter
from pathlib import Path

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def load_mapping(mapping_path: Path) -> dict:
    with mapping_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def infer_target_label(class_name: str, mapping: dict) -> str:
    normalized = class_name.strip().lower()
    direct = mapping.get("direct_mapping", {})
    if normalized in direct:
        return direct[normalized]

    keyword_mapping = mapping.get("keyword_mapping", {})
    for keyword, target in keyword_mapping.items():
        if keyword in normalized:
            return target

    return mapping.get("default_target", "protein")


def iter_images(folder: Path):
    for path in folder.rglob("*"):
        if path.is_file() and path.suffix.lower() in ALLOWED_EXTENSIONS:
            yield path


def prepare_dataset(source_root: Path, target_root: Path, mapping_path: Path, copy_mode: bool = True) -> dict:
    if not source_root.exists():
        raise FileNotFoundError(f"Source folder not found: {source_root}")

    mapping = load_mapping(mapping_path)
    target_root.mkdir(parents=True, exist_ok=True)

    per_source_class: Counter[str] = Counter()
    per_target_class: Counter[str] = Counter()

    class_dirs = [p for p in source_root.iterdir() if p.is_dir()]
    if not class_dirs:
        raise ValueError("No class directories found under source root")

    for class_dir in class_dirs:
        source_class = class_dir.name
        target_class = infer_target_label(source_class, mapping)
        out_dir = target_root / target_class
        out_dir.mkdir(parents=True, exist_ok=True)

        for image_path in iter_images(class_dir):
            destination = out_dir / f"{source_class}__{image_path.name}"
            if destination.exists():
                continue
            if copy_mode:
                shutil.copy2(image_path, destination)
            else:
                shutil.move(str(image_path), str(destination))
            per_source_class[source_class] += 1
            per_target_class[target_class] += 1

    report = {
        "source_root": str(source_root),
        "target_root": str(target_root),
        "total_images": int(sum(per_target_class.values())),
        "source_distribution": dict(per_source_class),
        "target_distribution": dict(per_target_class),
    }
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Prepare ImageFolder dataset for VitaScanAI training")
    parser.add_argument("--source", required=True, help="Root with raw disease class folders")
    parser.add_argument("--target", default="ml/data/dataset", help="Output ImageFolder root")
    parser.add_argument("--mapping", default="ml/data/label_mapping.json", help="Path to JSON label mapping")
    parser.add_argument("--move", action="store_true", help="Move files instead of copying")
    parser.add_argument("--report", default="ml/data/prepare_report.json", help="Output report path")
    args = parser.parse_args()

    report = prepare_dataset(
        source_root=Path(args.source),
        target_root=Path(args.target),
        mapping_path=Path(args.mapping),
        copy_mode=not args.move,
    )

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    print(f"Saved report to: {report_path}")


if __name__ == "__main__":
    main()
