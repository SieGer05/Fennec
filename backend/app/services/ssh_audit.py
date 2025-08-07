import re
from ..utils.rules_loader import load_ssh_rules

class SSHAudit:
    def __init__(self):
        self.rules = load_ssh_rules()

    def audit_config(self, sshd_T_output: str):
        results = []
        config_dict = {}
        
        for line in sshd_T_output.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            match = re.match(r'^(\S+)\s+(.+)$', line)
            if match:
                directive, value = match.groups()
                config_dict[directive.lower()] = value.lower()

        for rule in self.rules:
            directive_key = rule['directive'].lower()
            expected = rule['expected'].lower()
            
            actual = config_dict.get(directive_key, "Not set")
            passed = False
            
            if actual != "Not set":
                if directive_key in ['ciphers', 'macs', 'kexalgorithms']:
                    actual_list = [s.strip() for s in actual.split(',')]
                    expected_list = [s.strip() for s in expected.split(',')]
                    passed = set(actual_list) == set(expected_list)  
                else:
                    passed = actual == expected
            
            results.append({
                "directive": rule['directive'],
                "expected": rule['expected'],
                "actual": actual,
                "passed": passed,
                "severity": rule['severity'],
                "description": rule['description'],
                "source": rule['source']
            })
        
        return results