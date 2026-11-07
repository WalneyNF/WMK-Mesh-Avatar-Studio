Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = @($s.GetInstalledVoices() | Where-Object { $_.Enabled })
$pt = $voices | Where-Object { $_.VoiceInfo.Culture.Name -like 'pt-*' } | Select-Object -First 1
if ($pt) { $s.SelectVoice($pt.VoiceInfo.Name) }
$s.Rate = -1
$s.SetOutputToWaveFile('C:\ferramentas\mesh-avatar-studio\samples\wmk-lipsync\nex-apresentacao-longa.wav')
$s.Speak('Olá! Eu sou o NEX, o avatar de demonstração do WMK Avatar Studio. Hoje estamos testando minha voz e os movimentos do meu rosto. Este projeto permite criar personagens, trabalhar com imagens, experimentar animações e estudar como sincronizar a boca com o áudio. A ideia é que, no futuro, você possa escrever qualquer frase e me ver conversando naturalmente. Por enquanto, esta é uma demonstração, e os movimentos da minha boca ainda são aproximados. Estamos melhorando a tecnologia passo a passo. Obrigado por acompanhar nosso desenvolvimento!')
$s.Dispose()
Write-Output "VOZ=$($pt.VoiceInfo.Name)"
