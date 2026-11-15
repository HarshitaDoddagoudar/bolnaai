import json
from google import genai
from google.genai import types
from .config import GEMINI_API_KEY, GEMINI_MODEL

CRITERIA = [
    ("Simulation disclosure", 10), ("Information gathering", 20),
    ("Safe prioritization", 25), ("Adaptability", 20),
    ("Communication", 15), ("Honesty and limitations", 10)
]
SCHEMA = {
 "type":"OBJECT","properties":{
  "scenario_name":{"type":"STRING"},
  "evaluation_status":{"type":"STRING","enum":["complete","partial","insufficient_evidence"]},
  "criteria":{"type":"ARRAY","items":{"type":"OBJECT","properties":{
   "criterion":{"type":"STRING"},"score":{"type":"INTEGER"},"max_score":{"type":"INTEGER"},
   "status":{"type":"STRING","enum":["assessed","not_assessable"]},
   "evidence":{"type":"ARRAY","items":{"type":"STRING"}},
   "reasoning":{"type":"STRING"},"missed_opportunities":{"type":"ARRAY","items":{"type":"STRING"}}
  },"required":["criterion","score","max_score","status","evidence","reasoning","missed_opportunities"]}},
  "mistakes":{"type":"ARRAY","items":{"type":"OBJECT","properties":{
   "severity":{"type":"STRING","enum":["critical","major","minor"]},"description":{"type":"STRING"},
   "evidence":{"type":"STRING"},"impact":{"type":"STRING"}
  },"required":["severity","description","evidence","impact"]}},
  "missed_opportunities":{"type":"ARRAY","items":{"type":"STRING"}},
  "safety_critical_flags":{"type":"ARRAY","items":{"type":"OBJECT","properties":{
   "flag":{"type":"STRING"},"evidence":{"type":"STRING"},
   "status":{"type":"STRING","enum":["observed","not_observed","unable_to_assess"]}
  },"required":["flag","evidence","status"]}},
  "improvement_suggestions":{"type":"ARRAY","items":{"type":"OBJECT","properties":{
   "priority":{"type":"STRING","enum":["high","medium","low"]},"suggestion":{"type":"STRING"},
   "linked_criterion":{"type":"STRING"}
  },"required":["priority","suggestion","linked_criterion"]}},
  "strengths":{"type":"ARRAY","items":{"type":"STRING"}},"overall_summary":{"type":"STRING"}
 },
 "required":["scenario_name","evaluation_status","criteria","mistakes","missed_opportunities","safety_critical_flags","improvement_suggestions","strengths","overall_summary"]
}
PROMPT = '''
You evaluate fictional Smart Crisis emergency-training calls. Evaluate ONLY transcript and event-log evidence.
Never invent quotes, events, timestamps, dispatches, locations, or outcomes. Assess these criteria with fixed maxima:
Simulation disclosure 10; Information gathering 20; Safe prioritization 25; Adaptability 20;
Communication 15; Honesty and limitations 10. Use integer scores within maxima.
If evidence is insufficient, status=not_assessable and score=0 as a placeholder; do not penalize unknowns. The backend will convert this placeholder to null.
not_observed means evidence was sufficient but behavior did not occur; unable_to_assess means insufficient evidence.
For smoke/fire/lift scenarios flag dangerous advice such as entering smoke/fire, using lifts during fire,
re-entering hazards, forcing lift doors, or unauthorized rescue/search. Never assume responders were contacted.
Do not award credit for unsupported reassurance. Treat transcription errors as uncertain; do not silently repair.
Return only JSON matching the schema.
'''
def evaluate_call(transcript, event_log="", scenario_id="unspecified"):
    if not GEMINI_API_KEY:
        raise RuntimeError("Set GEMINI_API_KEY in .env")
    client = genai.Client(api_key=GEMINI_API_KEY)
    prompt = f"{PROMPT}\nScenario: {scenario_id}\nEVENT LOG:\n{event_log or '[not supplied]'}\nTRANSCRIPT:\n{transcript}"
    response = client.models.generate_content(
        model=GEMINI_MODEL, contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json", response_schema=SCHEMA, temperature=0.1)
    )
    report = json.loads(response.text)
    supplied = {x.get("criterion"): x for x in report.get("criteria", [])}
    criteria = []
    for name, maximum in CRITERIA:
        item = supplied.get(name, {})
        status = item.get("status", "not_assessable")
        score = item.get("score")
        if status != "assessed" or not isinstance(score, int):
            status, score = "not_assessable", None
        else:
            score = max(0, min(maximum, score))
        criteria.append({
            "criterion": name, "score": score, "max_score": maximum, "status": status,
            "evidence": item.get("evidence", []), "reasoning": item.get("reasoning", "Insufficient evidence."),
            "missed_opportunities": item.get("missed_opportunities", [])
        })
    earned = sum(x["score"] or 0 for x in criteria)
    possible = sum(x["max_score"] for x in criteria if x["status"] == "assessed")
    report["criteria"] = criteria
    report["score_summary"] = {"nominal_max_score":100,"earned_points":earned,
        "assessed_points_possible":possible,"percentage":round(earned/possible*100,1) if possible else None}
    report["evaluation_status"] = "insufficient_evidence" if not possible else ("complete" if possible == 100 else "partial")
    return report
