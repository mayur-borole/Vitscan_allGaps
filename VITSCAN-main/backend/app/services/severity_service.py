def confidence_to_severity(confidence: float) -> str:
    risk_score = 1.0 - confidence
    if risk_score >= 0.6:
        return "Severe"
    if risk_score >= 0.3:
        return "Moderate"
    return "Mild"
