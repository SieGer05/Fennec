import json
from pathlib import Path

def load_ssh_rules():
    rules_path = Path(__file__).resolve().parent.parent / "rules" / "ssh_rules.json"
    with open(rules_path, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_apache2_rules():
    rules_path = Path(__file__).resolve().parent.parent / "rules" / "apache2_rules.json"
    with open(rules_path, "r", encoding="utf-8") as f:
        return json.load(f)
    
def load_mariadb_rules():
    rules_path = Path(__file__).resolve().parent.parent / "rules" / "mariadb_rules.json"
    with open(rules_path, "r", encoding="utf-8") as f:
        return json.load(f)