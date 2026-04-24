from app.services.severity_service import confidence_to_severity


def test_severity_mapping() -> None:
    assert confidence_to_severity(0.2) == "Severe"
    assert confidence_to_severity(0.6) == "Moderate"
    assert confidence_to_severity(0.9) == "Mild"
