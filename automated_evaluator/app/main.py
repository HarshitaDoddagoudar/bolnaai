import json, secrets
from datetime import datetime, timezone
from fastapi import FastAPI, Request, HTTPException
from sqlalchemy import select
from .config import APP_NAME, BOLNA_AGENT_ID, WEBHOOK_SECRET
from .database import Base, engine, SessionLocal
from .models import CallRecord
from .evaluator import evaluate_call
Base.metadata.create_all(bind=engine)
app = FastAPI(title=APP_NAME, version="1.0.0")

def norm(p):
    d = p.get("data") if isinstance(p.get("data"), dict) else {}
    x = {**d, **p}
    def get(*ks, default=""):
        for k in ks:
            if x.get(k) not in (None, ""): return x[k]
        return default
    ex = x.get("extracted_data") or {}
    transcript = get("transcript", "transcript_text", "conversation")
    if isinstance(transcript, list):
        transcript = "\n".join((f'{v.get("speaker",v.get("role","unknown"))}: {v.get("text",v.get("content",""))}' if isinstance(v,dict) else str(v)) for v in transcript)
    ctx = x.get("context_details") or x.get("user_data") or {}
    return (str(get("execution_id","id","call_id")), str(get("agent_id")),
            str(get("status","call_status")).lower(), str(transcript or ""),
            str(get("event_log","scenario_event_log", default=ex.get("event_log",""))),
            str(get("scenario_id", default=ctx.get("scenario_id","unspecified") if isinstance(ctx,dict) else "unspecified")))

@app.get("/health")
def health(): return {"ok": True, "service": APP_NAME}

@app.post("/webhooks/bolna")
async def bolna_webhook(request: Request):
    if WEBHOOK_SECRET and not secrets.compare_digest(request.headers.get("x-webhook-secret",""), WEBHOOK_SECRET):
        raise HTTPException(401, "Invalid webhook secret")
    try: p = await request.json()
    except Exception: raise HTTPException(400, "Expected JSON")
    if not isinstance(p,dict): raise HTTPException(400,"Expected JSON object")
    cid, aid, status, transcript, event_log, scenario = norm(p)
    if not cid: raise HTTPException(400,"Missing execution id")
    if BOLNA_AGENT_ID and aid and aid != BOLNA_AGENT_ID:
        return {"accepted":True,"evaluated":False,"reason":"agent id mismatch"}
    if status not in ("completed","call_completed"):
        return {"accepted":True,"evaluated":False,"reason":f"status={status}"}
    if not transcript.strip():
        return {"accepted":True,"evaluated":False,"reason":"No transcript in completed payload"}
    with SessionLocal() as db:
        row = db.get(CallRecord,cid)
        if row and row.evaluation_status in ("complete","partial"):
            return {"accepted":True,"duplicate":True,"call_id":cid}
        row = row or CallRecord(id=cid)
        row.agent_id, row.status, row.scenario_id = aid,status,scenario
        row.transcript,row.event_log,row.raw_payload = transcript,event_log,json.dumps(p,ensure_ascii=False)
        row.evaluation_status = "processing"
        db.add(row); db.commit()
        try:
            report = evaluate_call(transcript,event_log,scenario)
            row.report_json = json.dumps(report,ensure_ascii=False)
            row.score = report["score_summary"]["percentage"]
            row.evaluation_status = report["evaluation_status"]
            row.evaluated_at = datetime.now(timezone.utc); row.error = ""
            db.commit()
        except Exception as e:
            row.evaluation_status,row.error = "failed",str(e)
            db.commit()
            raise HTTPException(500,"Evaluation failed; payload and transcript were stored.")
    return {"accepted":True,"evaluated":True,"call_id":cid,"evaluation_status":row.evaluation_status}

@app.get("/api/calls")
def calls(limit:int=200):
    with SessionLocal() as db:
        rs=db.scalars(select(CallRecord).order_by(CallRecord.received_at.desc()).limit(min(limit,500))).all()
        return [{"id":r.id,"scenario":r.scenario_id,"status":r.evaluation_status,"score":r.score,
                 "received_at":r.received_at.isoformat(),"error":r.error} for r in rs]

@app.get("/api/calls/{cid}")
def call_detail(cid:str):
    with SessionLocal() as db:
        r=db.get(CallRecord,cid)
        if not r: raise HTTPException(404,"Call not found")
        return {"id":r.id,"scenario":r.scenario_id,"transcript":r.transcript,"event_log":r.event_log,
                "report":json.loads(r.report_json) if r.report_json else None,
                "status":r.evaluation_status,"error":r.error}
