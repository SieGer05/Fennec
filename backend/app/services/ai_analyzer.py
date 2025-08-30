from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENROUTER_API")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key,
)

def analyze_security_audit(audit_data):
    failed_audits = [a for a in audit_data if not a.get("passed", True)]
    if not failed_audits:
        return "Aucun problème de sécurité détecté."

    audit_json = json.dumps(failed_audits, indent=2)
    
    prompt = f"""
Analysez ce rapport d'audit de sécurité et expliquez chaque directive qui a échoué.

Données d'audit:
{audit_json}

Pour chaque directive qui a échoué, fournissez:
1. Nom de la directive
2. Explication brève en français (2-3 phrases)
3. Pourquoi c'est important pour la sécurité

Séparez chaque explication par '|'.
"""
    completion = client.chat.completions.create(
        model="meta-llama/llama-4-maverick:free",
        messages=[{"role": "user", "content": prompt}],
        timeout=60
    )

    return completion.choices[0].message.content