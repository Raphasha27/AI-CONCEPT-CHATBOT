from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.services.hybrid_engine import HybridNationalIntelligence
from app.core.rbac import RBAC

router = APIRouter()

class HybridCycleRequest(BaseModel):
    real: List[Dict[str, Any]]
    simulated: List[Dict[str, Any]]

@router.post("/run", dependencies=[Depends(RBAC.has_role(["admin", "gov_agent"]))])
async def run_hybrid_national_cycle(payload: HybridCycleRequest):
    """
    Triggers a Hybrid Intelligence Cycle: Fusing Real + Simulated data for Forecasting.
    """
    result = HybridNationalIntelligence.run_hybrid_cycle(payload.real, payload.simulated)
    return {
        "status": "success",
        "system_mode": "HYBRID_FUSION",
        "result": result
    }
