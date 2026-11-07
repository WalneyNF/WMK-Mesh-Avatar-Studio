# WMK Facial Engine — Pesquisa e integração de lip-sync
Créditos: Walney Moreira Klein — walneyk@hotmail.com

## Estado real
O arquivo `wmk-rhubarb-adapter.mjs` converte JSON Rhubarb para um formato experimental `wmk-performance/0.1`. Não substitui o Diretor atual e não executa reconhecimento de voz sozinho. Os parâmetros de cada visema são aproximações iniciais e precisam de calibração visual no NEX.

## Projetos analisados
- Rhubarb: https://github.com/DanielSWolf/rhubarb-lip-sync — CLI, WAV/OGG, JSON com mouthCues, reconhecedor phonetic para outros idiomas.
- Papagayo-NG: https://github.com/morevnaproject-org/papagayo-ng — referência para waveform, arrastar palavras e editar fonemas.
- WhisperX: https://github.com/m-bain/whisperX — transcrição e alinhamento de palavras; requer modelos e dependências.
- Montreal Forced Aligner: https://montreal-forced-aligner.readthedocs.io/ — alinhamento de palavras/fonemas; requer recursos linguísticos compatíveis.
- NVIDIA Audio2Face-2D: https://docs.nvidia.com/nim/maxine/audio2face-2d/latest/overview.html — avaliar licenças, requisitos e adequação.

## Primeiro teste com Rhubarb (Windows)
1. Obter a versão Windows na página oficial de releases.
2. Criar uma gravação curta em WAV, com voz isolada em português.
3. Executar: `rhubarb -r phonetic -f json -o nex-rhubarb.json nex.wav`.
4. Importar o JSON gerado pelo adaptador `convertRhubarb(JSON.parse(texto))`.
5. Inspecionar `tracks.visemes`; cada entrada contém startMs, endMs, shape e values.
6. Ajustar os valores do mapa VISEMES para o rig do NEX antes de integrar à reprodução.

## Próximos passos
- Interface de importação de áudio e JSON Rhubarb.
- Timeline com zoom, waveform, scrub e correção de visemas.
- Reprodução sincronizada ao audio.currentTime, não por temporizador independente.
- Exportação de projeto JSON e testes com voz PT-BR.
- Integração opcional com WhisperX/MFA; evitar instalar modelos pesados sem verificar espaço e RAM.
