from typing import Dict
from ..utils.rules_loader import load_webmin_rules

class WebminAudit:
    def __init__(self):
        self.rules = load_webmin_rules()

    def _parse_webmin_config(self, content: str) -> Dict[str, str]:
        """Parse Webmin configuration files (key=value format)"""
        config = {}
        for line in content.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # Handle key=value pairs
            if '=' in line:
                key, value = line.split('=', 1)
                config[key.strip()] = value.strip()
        
        return config

    def audit_config(self, ssh):
        file_groups = {}
        for rule in self.rules:
            file_groups.setdefault(rule['file'], []).append(rule)
        
        results = []
        file_cache = {}
        
        for file_path, rules in file_groups.items():
            if file_path not in file_cache:
                try:
                    # Use sudo to read the file
                    _, stdout, stderr = ssh.exec_command(f"sudo cat {file_path}")
                    content = stdout.read().decode("utf-8")
                    error = stderr.read().decode("utf-8")
                    
                    if error:
                        if "Permission denied" in error:
                            file_cache[file_path] = "Permission denied"
                        else:
                            file_cache[file_path] = None
                    else:
                        file_cache[file_path] = self._parse_webmin_config(content)
                except Exception:
                    file_cache[file_path] = None
            
            config = file_cache[file_path]
            
            for rule in rules:
                directive = rule['directive']
                expected = rule['expected']
                
                if config is None:
                    result = {
                        "directive": directive,
                        "expected": expected,
                        "actual": "File not found",
                        "passed": False,
                        "severity": rule['severity'],
                        "description": rule['description'],
                        "source": rule['source'],
                        "file": rule['file']
                    }
                elif config == "Permission denied":
                    result = {
                        "directive": directive,
                        "expected": expected,
                        "actual": "Permission denied (sudo required)",
                        "passed": False,
                        "severity": rule['severity'],
                        "description": rule['description'],
                        "source": rule['source'],
                        "file": rule['file']
                    }
                else:
                    actual = config.get(directive, "Not set")
                    passed = (str(actual) == str(expected))
                    
                    result = {
                        "directive": directive,
                        "expected": expected,
                        "actual": actual,
                        "passed": passed,
                        "severity": rule['severity'],
                        "description": rule['description'],
                        "source": rule['source'],
                        "file": rule['file']
                    }
                
                results.append(result)
        
        return results