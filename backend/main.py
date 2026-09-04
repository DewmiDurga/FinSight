from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.transactions import router as transaction_router
from app.api.budgets import router as budget_router
from app.api.goals import router as goal_router
from app.api.loans import router as loan_router
from app.api.analytics import router as analytics_router
from app.api.dashboard import router as dashboard_router
from app.api.assistant import router as assistant_router

app = FastAPI(
    title="FinSight API",
    description="Unified Financial Intelligence API for FinSight",
    version="1.0.0",
)

# Enable CORS so frontend (Vite) can communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all page API routers
app.include_router(dashboard_router)
app.include_router(transaction_router)
app.include_router(budget_router)
app.include_router(goal_router)
app.include_router(loan_router)
app.include_router(analytics_router)
app.include_router(assistant_router)


@app.get("/")
def root():
    return {
        "message": "FinSight API is running",
        "endpoints": [
            "/dashboard",
            "/transactions",
            "/budgets",
            "/goals",
            "/loans",
            "/analytics/overview",
            "/assistant/chat",
        ],
    }
