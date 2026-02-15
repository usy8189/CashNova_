from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

app = FastAPI(title="FinanceAI ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    amounts: List[float]
    periods: int = 1


class PredictResponse(BaseModel):
    forecast: float
    trend: str
    confidence: str
    method: str
    forecast_series: List[float]


class AnomalyRequest(BaseModel):
    amounts: List[float]
    threshold: float = 2.0


class AnomalyItem(BaseModel):
    index: int
    value: float
    z_score: float
    is_anomaly: bool


class AnomalyResponse(BaseModel):
    anomalies: List[AnomalyItem]
    mean: float
    std: float
    anomaly_count: int


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ml-service"}


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    amounts = np.array(req.amounts)
    n = len(amounts)

    if n < 2:
        return PredictResponse(
            forecast=float(amounts[0]) if n == 1 else 0.0,
            trend="stable",
            confidence="low",
            method="insufficient_data",
            forecast_series=list(amounts),
        )

    # Moving average (window = min(3, n))
    window = min(3, n)
    ma = np.convolve(amounts, np.ones(window) / window, mode="valid")
    ma_forecast = float(ma[-1])

    # Linear regression
    x = np.arange(n)
    coeffs = np.polyfit(x, amounts, 1)  # slope, intercept
    slope, intercept = coeffs
    lr_forecasts = [float(slope * (n + i) + intercept) for i in range(req.periods)]

    # Weighted ensemble (60% LR, 40% MA)
    forecast = 0.6 * lr_forecasts[0] + 0.4 * ma_forecast
    forecast = max(forecast, 0)  # Can't be negative

    # Trend
    if slope > 50:
        trend = "increasing"
    elif slope < -50:
        trend = "decreasing"
    else:
        trend = "stable"

    # Confidence
    if n >= 6:
        confidence = "high"
    elif n >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    return PredictResponse(
        forecast=round(forecast, 2),
        trend=trend,
        confidence=confidence,
        method="ensemble_ma_lr",
        forecast_series=[round(f, 2) for f in lr_forecasts],
    )


@app.post("/anomaly-detect", response_model=AnomalyResponse)
def anomaly_detect(req: AnomalyRequest):
    amounts = np.array(req.amounts)
    n = len(amounts)

    if n < 3:
        return AnomalyResponse(
            anomalies=[],
            mean=float(np.mean(amounts)) if n > 0 else 0,
            std=0,
            anomaly_count=0,
        )

    mean = float(np.mean(amounts))
    std = float(np.std(amounts))

    if std == 0:
        return AnomalyResponse(anomalies=[], mean=mean, std=0, anomaly_count=0)

    anomalies = []
    for i, val in enumerate(amounts):
        z = (val - mean) / std
        is_anomaly = abs(z) > req.threshold
        anomalies.append(
            AnomalyItem(index=i, value=float(val), z_score=round(z, 3), is_anomaly=is_anomaly)
        )

    anomaly_count = sum(1 for a in anomalies if a.is_anomaly)

    return AnomalyResponse(
        anomalies=anomalies,
        mean=round(mean, 2),
        std=round(std, 2),
        anomaly_count=anomaly_count,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
