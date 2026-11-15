# Smart Crisis — Automated Evaluation Dashboard

FastAPI webhook + Gemini evaluation + SQLite storage + Streamlit dashboard.

## Workflow
Bolna completed-call webhook → `/webhooks/bolna` → Gemini evaluator → SQLite → dashboard.

Each completed Bolna execution ID is stored as one distinct call. Duplicate webhook deliveries do not create duplicate reports.

## Install
Python 3.10+ is recommended.

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`; set `GEMINI_API_KEY`. Never commit `.env`.

## Run
Terminal 1:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Terminal 2:
```bash
streamlit run dashboard.py
```
Dashboard: http://localhost:8501 ; API health: http://localhost:8000/health

## Connect Bolna
Deploy this backend or expose port 8000 through a secure public HTTPS tunnel. Bolna cannot reach `localhost`.
Set the Emergency Assistant agent's webhook URL to:
`https://YOUR-PUBLIC-HOST/webhooks/bolna`

Confirm with Person 1 before changing the central agent configuration; setting a new webhook may replace an existing destination. Configure completed-call delivery. Bolna docs: https://docs.bolna.ai/poll-call-data

Inspect a real webhook payload before relying on the integration. This MVP normalizes common keys (`id`/`execution_id`, `agent_id`, `status`, `transcript`, `event_log`, `context_details`), but account/version payloads can differ. Adapt `norm()` in `app/main.py` if needed. Event logs are only evaluated if Bolna sends them; if absent, the report must not invent scenario events.

## Test without a live call
```bash
curl -X POST http://localhost:8000/webhooks/bolna -H "Content-Type: application/json" -d "{\"id\":\"demo-001\",\"agent_id\":\"77903ab3-a9e5-4756-904b-345fdf96f785\",\"status\":\"completed\",\"transcript\":\"Agent: This is a fictional training simulation. Caller: I smell smoke in a lift.\"}"
```
Requires Gemini API key. This inserts a synthetic demo call.

## Security and limitations
- SQLite stores full transcripts and raw webhook payloads; treat them as sensitive.
- Use fictional caller details and obtain consent for test calls.
- Add authentication, HTTPS, access controls, backups, and webhook signature/IP verification before production. This MVP does not verify Bolna signatures or source IPs.
- Optional `WEBHOOK_SECRET` expects `X-Webhook-Secret`; use only if Bolna or a trusted intermediary can send that header.
- Gemini scores are AI-generated and must be reviewed by a human, especially critical safety flags.
- Not an emergency response, dispatch, diagnosis, or real-world safety system.
- MVP does not include user login, PDF export, cloud deployment, or automatic scenario-event injection.
