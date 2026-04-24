LABEL_TO_PREDICTION = {
    "vitamin_a": "Vitamin A Deficiency",
    "vitamin_b": "Vitamin B Deficiency",
    "vitamin_c": "Vitamin C Deficiency",
    "vitamin_d": "Vitamin D Deficiency",
    "vitamin_e": "Vitamin E Deficiency",
    "vitamin_k": "Vitamin K Deficiency",
    "minerals": "Mineral Deficiency",
    "protein": "Protein Deficiency",
}


def to_display_label(raw_label: str) -> str:
    key = raw_label.strip().lower()
    return LABEL_TO_PREDICTION.get(key, raw_label.replace("_", " ").title())
