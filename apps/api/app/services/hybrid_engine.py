import time
import structlog
from typing import List, Dict, Any

log = structlog.get_logger()

class HybridNationalIntelligence:
    """
    MASTER BRAIN (PHASE 7): Fuses Real + Simulated Data + AI Forecasts.
    """

    @staticmethod
    def fuse_data(real_data: List[Dict], simulated_data: List[Dict]) -> List[Dict]:
        """
        Data Fusion Engine: Normalizes and merges two streams of reality.
        """
        fused = []
        for item in real_data:
            item["reality_layer"] = "REAL_WORLD"
            fused.append(item)
        for item in simulated_data:
            item["reality_layer"] = "SIMULATION"
            fused.append(item)
        return fused

    @staticmethod
    def forecast_risk(fused_events: List[Dict]) -> Dict[str, Any]:
        """
        AI Forecast Engine: Predicts future escalation based on hybrid signals.
        """
        if not fused_events:
            return {"current_risk": 0, "predicted_risk_6h": 0, "status": "stable"}

        avg_severity = sum(e.get("severity", 0) for e in fused_events) / len(fused_events)
        
        # Simulation items often represent "stress tests", so they weight heavier in forecast
        sim_count = len([e for e in fused_events if e["reality_layer"] == "SIMULATION"])
        escalation_factor = 1.25 + (0.1 * sim_count)
        
        predicted_risk = avg_severity * escalation_factor
        
        return {
            "current_risk_index": round(avg_severity, 2),
            "predicted_risk_6h": round(min(predicted_risk, 100), 2),
            "status": "CRITICAL_ESCALATION" if predicted_risk > 80 else "ESCALATING" if predicted_risk > 60 else "STABLE",
            "confidence_score": 0.89
        }

    @staticmethod
    def run_hybrid_cycle(real_data: List[Dict], simulated_data: List[Dict]) -> Dict[str, Any]:
        """
        Executes a full Hybrid National Intelligence cycle.
        """
        log.info("Starting Hybrid National Intelligence Cycle", real_count=len(real_data), sim_count=len(simulated_data))
        
        fused = HybridNationalIntelligence.fuse_data(real_data, simulated_data)
        prediction = HybridNationalIntelligence.forecast_risk(fused)
        
        return {
            "timestamp": time.time(),
            "mode": "HYBRID_NATIONAL_INTELLIGENCE",
            "fused_layer_count": len(fused),
            "forecast": prediction,
            "events": fused
        }
