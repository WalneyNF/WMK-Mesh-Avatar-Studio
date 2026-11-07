param([Parameter(Mandatory=$true)][string]$InputPath,[Parameter(Mandatory=$true)][string]$OutputPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$text = [System.IO.File]::ReadAllText($InputPath, [System.Text.Encoding]::UTF8)
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $pt = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and $_.VoiceInfo.Culture.Name -like 'pt-*' } | Select-Object -First 1
  if ($pt) { $s.SelectVoice($pt.VoiceInfo.Name) }
  $s.Rate = 0
  $s.SetOutputToWaveFile($OutputPath)
  $s.Speak($text)
  $s.SetOutputToNull()
  Write-Output $s.Voice.Name
} finally { $s.Dispose() }
