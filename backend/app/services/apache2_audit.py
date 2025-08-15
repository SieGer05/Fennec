import re
from typing import Dict
from ..utils.rules_loader import load_apache2_rules

class Apache2Audit:
    def __init__(self):
        self.rules = load_apache2_rules()
        self.block_directives = {"Directory", "FilesMatch", "LimitExcept", "VirtualHost"}

    def _parse_apache_config(self, content: str) -> Dict[str, Dict]:
        config = {}
        current_context = []
        context_stack = []
        
        for line in content.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # Handle block directives
            block_match = re.match(r'<(\S+)\s*(.*?)\s*>', line)
            if block_match:
                directive = block_match.group(1)
                args = block_match.group(2).strip()
                context_stack.append(current_context.copy())
                current_context.append((directive, args))
                continue
            
            # Handle closing blocks
            if line.startswith('</'):
                if context_stack:
                    current_context = context_stack.pop()
                continue
            
            # Parse regular directives
            parts = re.split(r'\s+', line, 1)
            if len(parts) < 2:
                continue
                
            directive = parts[0]
            value = parts[1].strip()
            
            context_key = tuple(current_context) if current_context else ('global',)
            
            if context_key not in config:
                config[context_key] = {}
            
            config[context_key][directive] = value
        
        return config

    def audit_config(self, ssh):
        file_groups = {}
        for rule in self.rules:
            file_groups.setdefault(rule['file'], []).append(rule)
        
        results = []
        file_cache = {}
        
        for file_path, rules in file_groups.items():
            if any(rule['directive'] in self.block_directives for rule in rules):
                for rule in rules:
                    results.append({
                        "directive": rule['directive'],
                        "expected": rule['expected'],
                        "actual": "Block directive audit not implemented",
                        "passed": False,
                        "severity": rule['severity'],
                        "description": rule['description'],
                        "source": rule['source'],
                        "file": rule['file']
                    })
                continue
            
            if file_path not in file_cache:
                try:
                    _, stdout, stderr = ssh.exec_command(f"cat {file_path}")
                    content = stdout.read().decode("utf-8")
                    error = stderr.read().decode("utf-8")
                    
                    if error:
                        file_cache[file_path] = None
                    else:
                        file_cache[file_path] = self._parse_apache_config(content)
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
                        "actual": "File not found or unreadable",
                        "passed": False,
                        "severity": rule['severity'],
                        "description": rule['description'],
                        "source": rule['source'],
                        "file": rule['file']
                    }
                else:
                    actual = "Not set"
                    found = False
                    
                    for _, directives in config.items():
                        if directive in directives:
                            actual = directives[directive]
                            found = True
                            break
                    
                    passed = (actual == expected) if found else False
                    
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