import json
import pandas as pd
import streamlit as st
from sqlalchemy import select
from app.database import Base, engine, SessionLocal
from app.models import CallRecord
Base.metadata.create_all(bind=engine)
st.set_page_config(page_title="Smart Crisis Evaluator", page_icon="🚨", layout="wide")
st.title("🚨 Smart Crisis — Automated Evaluation Dashboard")
st.caption("Completed Bolna calls are received and evaluated individually.")
with SessionLocal() as db:
    rs=db.scalars(select(CallRecord).order_by(CallRecord.received_at.desc())).all()
    data=[{"Call ID":r.id,"Scenario":r.scenario_id,"Evaluation":r.evaluation_status,
           "Score":r.score,"Received":r.received_at.strftime("%Y-%m-%d %H:%M:%S"),"Error":r.error} for r in rs]
df=pd.DataFrame(data)
a,b,c=st.columns(3)
a.metric("Calls received",len(data))
b.metric("Reports generated",sum(1 for x in data if x["Evaluation"] in ("complete","partial")))
scores=[x["Score"] for x in data if isinstance(x["Score"],(int,float))]
c.metric("Average score",f"{sum(scores)/len(scores):.1f}/100" if scores else "—")
st.subheader("Call history")
if df.empty:
    st.info("No calls yet. Configure the Bolna agent webhook to this app's public /webhooks/bolna URL.")
else:
    st.dataframe(df,use_container_width=True,hide_index=True)
    selected=st.selectbox("View a call",df["Call ID"].tolist())
    with SessionLocal() as db:
        r=db.get(CallRecord,selected)
        st.write(f"**Scenario:** {r.scenario_id} · **Status:** {r.evaluation_status}")
        if r.error: st.error(r.error)
        st.download_button("Download transcript",r.transcript,file_name=f"{r.id}-transcript.txt")
        if r.report_json:
            report=json.loads(r.report_json)
            st.metric("Call score",f'{report["score_summary"]["percentage"]}/100' if report["score_summary"]["percentage"] is not None else "Not assessable")
            st.json(report)
            st.download_button("Download JSON evaluation",json.dumps(report,indent=2),file_name=f"{r.id}-evaluation.json",mime="application/json")
        with st.expander("Transcript"): st.text(r.transcript)
        with st.expander("Scenario event log"): st.text(r.event_log or "No event log received.")
st.divider()
st.caption("Training/evaluation tool only. Not an emergency service. AI evaluations require human review.")
