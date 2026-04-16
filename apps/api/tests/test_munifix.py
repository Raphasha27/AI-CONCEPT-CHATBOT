"""
Tests for MuniFix engine — categorisation + report generation.
"""
import pytest
from app.services.munifix_engine import detect_category, compute_urgency, generate_report


def test_detect_water_leak():
    assert detect_category("There is a burst pipe outside my house") == "water_leak"


def test_detect_pothole():
    assert detect_category("The road has a huge pothole on Main Street") == "pothole"


def test_detect_sewage():
    assert detect_category("Raw sewage is leaking outside the school") == "sewage"


def test_detect_electricity():
    assert detect_category("There is a power outage in our area since yesterday") == "electricity_fault"


def test_detect_streetlight():
    assert detect_category("The streetlight on our road has not worked for 2 weeks") == "streetlight"


def test_detect_general_fallback():
    cat = detect_category("The council building has cracked walls")
    assert cat in ("infrastructure", "general")


def test_urgency_critical():
    assert compute_urgency("The pipe burst and is flooding the road") == 5


def test_urgency_moderate():
    assert compute_urgency("The drain is blocked and not working") == 3


def test_urgency_low():
    assert compute_urgency("Please check this area for service") == 2


def test_generate_report_structure():
    result = generate_report(
        description="Sewage leaking into the street near the school",
        location="Soweto Ext 4",
        municipality="City of Johannesburg",
    )
    assert "category" in result
    assert "urgency_score" in result
    assert "suggested_department" in result
    assert "generated_report" in result
    assert len(result["generated_report"]) > 100
    assert "Johannesburg" in result["generated_report"]


def test_generate_report_no_location():
    result = generate_report("pothole on the road", None, None)
    assert result["category"] == "pothole"
    assert "Not provided" in result["generated_report"]
