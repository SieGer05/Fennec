from openai import OpenAI
import os
import json
from dotenv import load_dotenv

OPENROUTER_API = "INSERT YOUR API HERE"

def get_api_key():
    if OPENROUTER_API != "INSERT YOUR API HERE":
        return OPENROUTER_API
    
    load_dotenv()
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENROUTER_API")
    
    if not api_key:
        raise ValueError(
            "API key not found. Please either:\n"
            "1. Modify the OPENROUTER_API variable in the code with your API key, or\n"
            "2. Set the OPENROUTER_API_KEY environment variable"
        )
    return api_key

try:
    api_key = get_api_key()
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )
except ValueError as e:
    client = None
    print(f"Warning: {e}")

def analyze_security_audit(audit_data):
    if client is None:
        raise RuntimeError("OpenRouter client is not initialized. Please provide a valid API key.")
    
    failed_audits = [a for a in audit_data if not a.get("passed", True)]
    
    if not failed_audits:
        return "Aucun problème de sécurité détecté."
    
    audit_json = json.dumps(failed_audits, indent=2, ensure_ascii=False)
    
    prompt = f"""Tu es un expert en sécurité web. Analyse ce rapport d'audit et explique les problèmes en français simple.

Données d'audit:
{audit_json}

Instructions:
- Pour chaque problème, donne une explication courte et claire (2-3 phrases maximum)
- Utilise un langage simple, compréhensible par un administrateur système
- Explique pourquoi c'est important pour la sécurité
- Sois direct et concis
- Sépare chaque explication par une ligne vide

Format:
[Nom de la directive]
[Explication courte du problème]
[Impact sur la sécurité]
"""
    
    response = client.chat.completions.create(
        model="x-ai/grok-4.1-fast:free",
        messages=[{"role": "user", "content": prompt}],
        extra_body={"reasoning": {"enabled": True}},
        timeout=60
    )
    
    return response.choices[0].message.content