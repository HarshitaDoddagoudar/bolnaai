
# Smart Crisis — Evaluator Output Format

The evaluator must return one JSON object per completed simulation. This format is designed for a simple demo screen, a saved JSON file, or later integration into the team's workflow.

## Required JSON structure

```json
{
  "report_id": "string",
  "scenario_id": "string",
  "evaluation_status": "complete | partial | insufficient_evidence",
  "input_quality": {
    "transcript_available": true,
    "event_log_available": true,
    "transcript_complete": true,
    "limitations": []
  },
  "score_summary": {
    "nominal_max_score": 100,
    "earned_points": 0,
    "assessed_points_possible": 100,
    "percentage": 0.0
  },
  "criteria": [
    {
      "criterion": "Simulation disclosure",
      "score": 0,
      "max_score": 10,
      "status": "assessed | not_assessable",
      "evidence": [
        {
          "source": "transcript | event_log",
          "speaker_or_event": "string",
          "quote_or_reference": "string"
        }
      ],
      "reasoning": "string",
      "missed_opportunities": []
    }
  ],
  "mistakes": [
    {
      "severity": "critical | major | minor",
      "description": "string",
      "evidence": "string",
      "impact": "string"
    }
  ],
  "missed_opportunities": [
    {
      "description": "string",
      "why_it_matters": "string",
      "evidence_basis": "string"
    }
  ],
  "safety_critical_flags": [
    {
      "flag": "string",
      "evidence": "string",
      "status": "observed | not_observed | unable_to_assess"
    }
  ],
  "improvement_suggestions": [
    {
      "priority": "high | medium | low",
      "suggestion": "string",
      "linked_criterion": "string"
    }
  ],
  "strengths": ["string"],
  "overall_summary": "string"
}
```

## Validation rules

- `criteria` should contain the six rubric criteria in the same order as the rubric.
- Each assessed criterion must have an integer `score` between 0 and its `max_score`.
- A `not_assessable` criterion must have `score: null`; it must not be counted in `assessed_points_possible`.
- `earned_points` is the sum of assessed criterion scores.
- `assessed_points_possible` is the sum of the maximum points for assessed criteria.
- `percentage` is `earned_points / assessed_points_possible * 100`, rounded to one decimal place. Use `null` if no criterion can be assessed.
- `nominal_max_score` remains 100 even when some criteria are not assessable.
- Use empty arrays when there are no evidenced mistakes, missed opportunities, flags, or suggestions.
- `evaluation_status` is `complete` when all criteria are assessable, `partial` when some are not assessable, and `insufficient_evidence` when the available inputs do not support a meaningful evaluation.
- `not_observed` means the available evidence was sufficient to check for the behavior and it did not occur. `unable_to_assess` means the evidence was insufficient.
- Never state that an emergency service was contacted unless a verified event-log entry supports it.
- All descriptions must be traceable to the transcript or event log. Do not invent quotes, timestamps, or events.

## Demonstration display order

For a human-readable demo, display:
1. Overall percentage and earned/assessed points.
2. Safety-critical flags.
3. Six criterion scores.
4. Mistakes.
5. Missed opportunities.
6. Improvement suggestions.
7. Strengths and overall summary.
