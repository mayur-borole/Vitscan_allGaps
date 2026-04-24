Place your training dataset here in torchvision ImageFolder format.

Expected structure:

ml/data/dataset/
  vitamin_a/
    img1.jpg
  vitamin_b/
    img2.jpg
  vitamin_c/
    img3.jpg

If your source dataset has disease class folders, convert it using:

python -m ml.data.prepare_dataset --source "<raw_dataset_root>" --target ml/data/dataset

This uses label rules from:

ml/data/label_mapping.json

Validate dataset quality and class balance:

python -m ml.data.validate_dataset --dataset ml/data/dataset

Then train model:

python -m ml.training.train --data-dir ml/data/dataset --output saved_models/vitascan_model.pth --architecture resnet18
