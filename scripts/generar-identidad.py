# Genera los HTML con SVG del ícono y el splash de TurnosYa! (colores de docs/diseno/guia-visual.md).
# No usa librerías de imágenes: los PNG se sacan con Microsoft Edge en modo headless.
#
# Para regenerar los PNG de assets/images/ (PowerShell, desde la raíz del proyecto):
#   python scripts/generar-identidad.py <carpeta temporal>
#   & "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu `
#     --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 `
#     --window-size=1024,1024 --screenshot=<carpeta>\icon.png file:///<carpeta>/icon.html
# Lo mismo para android-icon-foreground, android-icon-background y android-icon-monochrome
# (1024x1024) y para splash-icon (1200x320). Después se copian los PNG a assets/images/.
import math
import os
import sys

SALIDA = sys.argv[1]
PRIMARIO = '#1B7A3E'
ACENTO = '#F5C518'
TEXTO = '#1A1F1C'
BLANCO = '#FFFFFF'


def poligono(cx, cy, r, angulo0, lados=5):
    pts = []
    for k in range(lados):
        a = math.radians(angulo0 + 360 / lados * k)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def pts_str(pts):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)


def parches_pelota(cx, cy, R):
    """Parches (pentágonos) y costuras de una pelota vista de frente a un pentágono."""
    parches = []
    costuras = []
    central = poligono(cx, cy, 0.30 * R, -90)
    parches.append(central)
    exteriores = []
    for k in range(5):
        ang = -90 + 72 * k
        a = math.radians(ang)
        ox, oy = cx + 0.92 * R * math.cos(a), cy + 0.92 * R * math.sin(a)
        # Un vértice apunta al centro.
        ext = poligono(ox, oy, 0.27 * R, ang + 180)
        exteriores.append(ext)
        parches.append(ext)
        costuras.append((central[k], ext[0]))
    # Costuras entre pentágonos exteriores vecinos (lado externo de cada hexágono).
    for k in range(5):
        a = exteriores[k]
        b = exteriores[(k + 1) % 5]
        # Vértice de a más cercano a b y viceversa.
        pa = min(a, key=lambda p: math.dist(p, (sum(x for x, _ in b) / 5, sum(y for _, y in b) / 5)))
        pb = min(b, key=lambda p: math.dist(p, (sum(x for x, _ in a) / 5, sum(y for _, y in a) / 5)))
        costuras.append((pa, pb))
    return parches, costuras


def pelota(cx, cy, R, id_, monocromo=False):
    parches, costuras = parches_pelota(cx, cy, R)
    grosor = R * 0.045
    lineas = ''.join(
        f'<line x1="{p[0]:.1f}" y1="{p[1]:.1f}" x2="{q[0]:.1f}" y2="{q[1]:.1f}" />' for p, q in costuras
    )
    polis = ''.join(f'<polygon points="{pts_str(p)}" />' for p in parches)
    if monocromo:
        # Solo cuenta la opacidad: los parches y costuras quedan transparentes.
        return f'''
<mask id="m{id_}"><circle cx="{cx}" cy="{cy}" r="{R}" fill="white"/>
<g fill="black" stroke="black" stroke-width="{grosor:.1f}" stroke-linejoin="round" stroke-linecap="round">{polis}{lineas}</g></mask>
<circle cx="{cx}" cy="{cy}" r="{R}" fill="white" mask="url(#m{id_})"/>'''
    return f'''
<clipPath id="c{id_}"><circle cx="{cx}" cy="{cy}" r="{R}"/></clipPath>
<circle cx="{cx}" cy="{cy}" r="{R}" fill="{BLANCO}"/>
<g clip-path="url(#c{id_})" fill="{TEXTO}" stroke="{TEXTO}" stroke-width="{grosor:.1f}" stroke-linejoin="round" stroke-linecap="round">{polis}{lineas}</g>
<circle cx="{cx}" cy="{cy}" r="{R - grosor / 2:.1f}" fill="none" stroke="{TEXTO}" stroke-width="{grosor:.1f}"/>'''


def pagina(ancho, alto, cuerpo, fondo='transparent'):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
html,body{{margin:0;padding:0;background:{fondo};width:{ancho}px;height:{alto}px;overflow:hidden}}
</style></head><body>{cuerpo}</body></html>'''


def svg(ancho, alto, interior):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{ancho}" height="{alto}" viewBox="0 0 {ancho} {alto}">{interior}</svg>'


def guardar(nombre, html):
    with open(os.path.join(SALIDA, nombre), 'w', encoding='utf-8') as f:
        f.write(html)


L = 1024
# Ícono clásico: fondo verde completo con la pelota.
guardar('icon.html', pagina(L, L, svg(L, L, f'<rect width="{L}" height="{L}" fill="{PRIMARIO}"/>' + pelota(512, 512, 330, 'i'))))
# Ícono adaptable: la pelota dentro de la zona segura (66 % central).
guardar('android-icon-foreground.html', pagina(L, L, svg(L, L, pelota(512, 512, 290, 'f'))))
guardar('android-icon-background.html', pagina(L, L, svg(L, L, f'<rect width="{L}" height="{L}" fill="{PRIMARIO}"/>')))
guardar('android-icon-monochrome.html', pagina(L, L, svg(L, L, pelota(512, 512, 290, 'm', monocromo=True))))

# Splash: "TurnosYa!" con la "o" de "Turnos" como pelota. Blanco y amarillo sobre el verde del splash.
TAM = 200
R_O = TAM * 0.285
texto = f'''<div style="display:flex;align-items:baseline;justify-content:center;width:1200px;height:320px;
font-family:'Segoe UI',Arial,sans-serif;font-weight:900;font-size:{TAM}px;line-height:320px;color:{BLANCO};letter-spacing:-4px">
<span>Turn</span>
<span style="display:inline-block;width:{2 * R_O + 8:.0f}px;height:{2 * R_O:.0f}px;margin:0 4px">{svg(int(2 * R_O + 8), int(2 * R_O), pelota(R_O + 4, R_O, R_O - 2, 's'))}</span>
<span>s</span><span style="color:{ACENTO}">Ya!</span></div>'''
guardar('splash-icon.html', pagina(1200, 320, texto))

# Vista previa del splash sobre el fondo verde, solo para revisarlo.
guardar('vista-splash.html', pagina(1200, 320, texto, fondo=PRIMARIO))
print('ok')

