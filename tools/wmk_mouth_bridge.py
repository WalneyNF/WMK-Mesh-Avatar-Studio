"""Converte pontos WMK em parâmetros de boca do motor Mesh Avatar Studio.
Não altera rig.draft.json nem arquivos da Miko.
Uso: python tools/wmk_mouth_bridge.py NEX_apresentador
"""
import json, math, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def convert(points, area=None):
    if len(points) < 4:
        raise ValueError("A boca precisa de pelo menos quatro pontos.")
    pts = [(float(p["x"]), float(p["y"])) for p in points]
    if any(not math.isfinite(x) or not math.isfinite(y) for x, y in pts):
        raise ValueError("Coordenadas inválidas.")
    xs = [x for x, _ in pts]
    left, right = min(xs), max(xs)
    if right - left < 2:
        raise ValueError("Largura insuficiente.")
    # Pontos próximos das extremidades definem o eixo da boca.
    margin = max(1.0, (right-left)*0.12)
    lp = [p for p in pts if p[0] <= left + margin]
    rp = [p for p in pts if p[0] >= right - margin]
    lx = sum(p[0] for p in lp)/len(lp)
    ly = sum(p[1] for p in lp)/len(lp)
    rx = sum(p[0] for p in rp)/len(rp)
    ry = sum(p[1] for p in rp)/len(rp)
    angle = math.atan2(ry-ly, rx-lx)
    cx, cy = (lx+rx)/2, (ly+ry)/2
    half_len = math.hypot(rx-lx, ry-ly)/2
    # Arco da linha central: positivo para curvatura descendente.
    mid = [p for p in pts if abs(p[0]-cx) < (right-left)*0.28]
    center_y = sum(p[1] for p in mid)/len(mid) if mid else cy
    bow = center_y - cy
    result = {"cx":round(cx,3),"cy":round(cy,3),"angle":round(angle,5),
              "halfLen":round(half_len,3),"bow":round(bow,3)}
    if area:
        result["area"] = {**area, "angle":0}
    return result

def main(name):
    folder = ROOT/"projects"/name
    source = folder/"landmarks.draft.json"
    draft = folder/"rig.draft.json"
    if not source.is_file() or not draft.is_file():
        raise FileNotFoundError("Projeto sem landmarks.draft.json ou rig.draft.json")
    landmarks = json.loads(source.read_text(encoding="utf-8"))
    rig = json.loads(draft.read_text(encoding="utf-8"))
    points = landmarks.get("regions",{}).get("face_mouth",[])
    mouth = convert(points, rig.get("mouth",{}).get("area"))
    out = {"schemaVersion":1,"project":name,"source":"landmarks.draft.json",
           "target":"Mesh Avatar Studio / rig.mouth","mouth":mouth,
           "status":"prévia de conversão; ainda requer camadas e rig completo"}
    target = folder/"mouth.bridge.json"
    target.write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(f"Gerado: {target}\n"+json.dumps(mouth,ensure_ascii=False,indent=2))

if __name__=="__main__":
    main(sys.argv[1] if len(sys.argv)>1 else "NEX_apresentador")
