"""Añade al AndroidManifest los permisos que necesitan los avisos con la app cerrada."""
import sys

PERMS = [
    'POST_NOTIFICATIONS',       # Android 13+: mostrar notificaciones
    'USE_EXACT_ALARM',          # Android 13+: avisos a la hora exacta sin pedir nada al usuario
    'SCHEDULE_EXACT_ALARM',     # Android 12/12L: avisos a la hora exacta
    'RECEIVE_BOOT_COMPLETED',   # recuperar los avisos al reiniciar el teléfono
    'VIBRATE',
]
path = sys.argv[1] if len(sys.argv) > 1 else 'android/app/src/main/AndroidManifest.xml'
s = open(path, encoding='utf-8').read()
add = ''.join(f'    <uses-permission android:name="android.permission.{p}" />\n' for p in PERMS if f'android.permission.{p}"' not in s)
if '</manifest>' not in s:
    sys.exit('AndroidManifest.xml sin </manifest>')
s = s.replace('</manifest>', add + '</manifest>')
open(path, 'w', encoding='utf-8').write(s)
print('permisos añadidos:', [p for p in PERMS if f'android.permission.{p}"' in add])
