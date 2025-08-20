import re
from pathlib import Path
from ..utils.rules_loader import load_mariadb_rules

class MariaDBAudit:
    def __init__(self):
        self.rules = load_mariadb_rules()

    def normalize_value(self, value, expected_type):
        """Normalize values for comparison"""
        value = str(value).lower().strip()
        
        if expected_type == "boolean":
            if value in ['on', 'yes', '1', 'true']:
                return 'on'
            elif value in ['off', 'no', '0', 'false']:
                return 'off'
        return value

    def audit_config(self, config_content: str):
        results = []
        config_dict = {}
        
        current_section = None
        for line in config_content.split('\n'):
            line = line.strip()
            
            section_match = re.match(r'^\[([^\]]+)\]$', line)
            if section_match:
                current_section = section_match.group(1).lower()
                continue
                
            if not line:
                continue
                
            commented = False
            original_line = line
            if line.startswith('#') or line.startswith(';'):
                commented = True
                line = re.sub(r'^[#;]\s*', '', line)  
                
            match = re.match(r'^(\S+)\s*=\s*(.+)$', line)
            if match:
                directive, value = match.groups()
                directive_normalized = directive.lower().replace('-', '_')
                
                config_dict[directive_normalized] = {
                    'value': value.strip(),
                    'commented': commented,
                    'original_line': original_line
                }

        for rule in self.rules:
            directive_key = rule['directive'].lower()
            expected = rule['expected']
            
            if directive_key in config_dict:
                config_item = config_dict[directive_key]
                actual = config_item['value']
                commented = config_item['commented']
                
                expected_type = "boolean" if expected.upper() in ['ON', 'OFF'] else "other"
                expected_normalized = self.normalize_value(expected, expected_type)
                actual_normalized = self.normalize_value(actual, expected_type)
                
                if directive_key in ['ssl_ca', 'ssl_cert', 'ssl_key']:
                    ssl_path = Path(actual)
                    passed = (not commented) and ssl_path.is_file()
                else:
                    passed = (not commented) and (actual_normalized == expected_normalized)
                
                if commented:
                    actual = f"{actual} (commented)"
            else:
                commented = False
                actual_value = None
                
                for line in config_content.split('\n'):
                    line = line.strip()
                    if line.startswith('#') or line.startswith(';'):
                        clean_line = line[1:].strip()
                        match = re.match(r'^(\S+)\s*=\s*(.+)$', clean_line)
                        if match:
                            directive, value = match.groups()
                            if directive.lower().replace('-', '_') == directive_key:
                                commented = True
                                actual_value = value.strip()
                                break
                
                if commented:
                    expected_type = "boolean" if expected.upper() in ['ON', 'OFF'] else "other"
                    expected_normalized = self.normalize_value(expected, expected_type)
                    actual_normalized = self.normalize_value(actual_value, expected_type)
                    
                    if directive_key in ['ssl_ca', 'ssl_cert', 'ssl_key']:
                        ssl_path = Path(actual_value)
                        passed = ssl_path.is_file()
                    else:
                        passed = (actual_normalized == expected_normalized)
                    
                    actual = f"{actual_value} (commenté)"
                else:
                    actual = "Not set"
                    passed = False
            
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