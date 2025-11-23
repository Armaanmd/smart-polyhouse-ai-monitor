# backend/app/config.py
import sys

def is_raspberry_pi():
    """Detects if the code is running on a Raspberry Pi."""
    try:
        with open('/proc/cpuinfo', 'r') as cpuinfo:
            for line in cpuinfo:
                if line.startswith('Hardware') and ('bcm' in line.lower() or 'raspberry' in line.lower()):
                    return True
    except:
        pass
    return False

IS_RPI = is_raspberry_pi()

print("-" * 50)
if IS_RPI:
    print("✅ Platform: Raspberry Pi detected.")
else:
    print("🖥️  Platform: Non-Raspberry Pi (PC/Windows) detected.")
print("-" * 50)