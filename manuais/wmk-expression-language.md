# WMK Expression Language (WEL) v0.1

Linguagem JSON declarativa, determinística, sem JavaScript arbitrário, para controlar personagens 2D. A IA gera um documento JSON; o motor valida e executa. Os canais são valores de controles existentes, não pontos anatômicos individuais. Pontos programáveis serão uma extensão posterior.

## Contrato
- language: "wmk-expression/0.1"
- name e description: metadados opcionais
- steps: 1 a 100 etapas
- action: set, reset, wait
- region: mouth, brows ou face (não usar em wait)
- values: objeto com canais válidos da região (somente set)
- durationMs: inteiro 0..10000, obrigatório
- easing: linear ou easeInOut (opcional)

## Canais
- mouthOpen: 0..100
- mouthForm: 0..100
- mouthWidth: 60..150
- mouthStrength: 0..100
- lipUpper: 0..100
- lipLower: 0..100
- jawDrop: 0..100
- browA: -20..20
- browB: -20..20

## Exemplo
```json
{
  "language": "wmk-expression/0.1",
  "name": "NEX — apresentação",
  "description": "Uma IA pode enviar este JSON para animar os canais faciais disponíveis.",
  "steps": [
    {
      "action": "reset",
      "region": "face",
      "durationMs": 250
    },
    {
      "action": "set",
      "region": "brows",
      "values": {
        "browA": 3,
        "browB": 2
      },
      "durationMs": 400
    },
    {
      "action": "set",
      "region": "mouth",
      "values": {
        "mouthOpen": 48,
        "mouthForm": 12,
        "mouthWidth": 108,
        "mouthStrength": 75,
        "lipUpper": 38,
        "lipLower": 50,
        "jawDrop": 28
      },
      "durationMs": 450
    },
    {
      "action": "wait",
      "durationMs": 550
    },
    {
      "action": "set",
      "region": "mouth",
      "values": {
        "mouthOpen": 0,
        "mouthForm": 0,
        "mouthWidth": 100,
        "jawDrop": 0
      },
      "durationMs": 400
    },
    {
      "action": "reset",
      "region": "face",
      "durationMs": 400
    }
  ]
}
```

## Regras
- Ação set modifica somente os canais especificados.
- Ação reset restaura os valores neutros da região.
- Ação wait mantém os valores anteriores.
- Transições usam interpolação linear ou smoothstep.
- Não há execução de código enviado pela IA (sem eval).
- O editor exibe o resultado em prévia; não modifica os landmarks.draft.json.
- Um JSON válido não garante expressão esteticamente boa. Calibre os controles e valide visualmente.
