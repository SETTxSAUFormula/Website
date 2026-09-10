$ErrorActionPreference = 'Stop'

$panelProjectPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$panelVarsPath = Join-Path $panelProjectPath '.dev.vars'
$panelCalendarId = 'c_d90b1f75a976b1aaee38ca1e4aa138bb4870f42fcf4be61fa3e83da011814e1e@group.calendar.google.com'
$panelLocalVars = @{}

if (Test-Path -LiteralPath $panelVarsPath) {
  foreach ($panelVarsLine in [System.IO.File]::ReadAllLines($panelVarsPath)) {
    $panelVarsMatch = [regex]::Match(
      $panelVarsLine,
      '^\s*([A-Z0-9_]+)\s*=\s*(.*)$'
    )
    if ($panelVarsMatch.Success) {
      $panelVarsKey = $panelVarsMatch.Groups[1].Value
      $panelVarsValue = $panelVarsMatch.Groups[2].Value.Trim()
      $panelLocalVars[$panelVarsKey] = $panelVarsValue
    }
  }
}

$panelHasSavedOAuth = (
  $panelLocalVars.ContainsKey('GOOGLE_OAUTH_CLIENT_ID') -and
  $panelLocalVars.ContainsKey('GOOGLE_OAUTH_CLIENT_SECRET') -and
  $panelLocalVars.ContainsKey('GOOGLE_OAUTH_REFRESH_TOKEN')
)

if ($panelHasSavedOAuth) {
  $panelClientId = $panelLocalVars['GOOGLE_OAUTH_CLIENT_ID']
  $panelClientSecretPlain = $panelLocalVars['GOOGLE_OAUTH_CLIENT_SECRET']
  $panelRefreshTokenPlain = $panelLocalVars['GOOGLE_OAUTH_REFRESH_TOKEN']
  Write-Host 'Kayitli yerel Google Takvim bilgileri kullaniliyor.' -ForegroundColor Green
} else {
  $panelClientId = Read-Host '1/3 Google OAuth Client ID'
  $panelClientSecretSecure = Read-Host '2/3 Google OAuth Client Secret (ekranda gorunmez)' -AsSecureString
  $panelRefreshTokenSecure = Read-Host '3/3 Google OAuth Refresh Token (ekranda gorunmez)' -AsSecureString
  $panelClientSecretPlain = [System.Net.NetworkCredential]::new('', $panelClientSecretSecure).Password
  $panelRefreshTokenPlain = [System.Net.NetworkCredential]::new('', $panelRefreshTokenSecure).Password

  $panelVarsLines = @(
    '# Local-only Google Calendar credentials. This file is ignored by Git.'
    "GOOGLE_CALENDAR_ID=$panelCalendarId"
    "GOOGLE_OAUTH_CLIENT_ID=$panelClientId"
    "GOOGLE_OAUTH_CLIENT_SECRET=$panelClientSecretPlain"
    "GOOGLE_OAUTH_REFRESH_TOKEN=$panelRefreshTokenPlain"
  )
  [System.IO.File]::WriteAllLines(
    $panelVarsPath,
    $panelVarsLines,
    [System.Text.UTF8Encoding]::new($false)
  )
  Write-Host 'Bilgiler Git disindaki yerel .dev.vars dosyasina kaydedildi.' -ForegroundColor Green
}

try {
  $env:GOOGLE_CALENDAR_ID = $panelCalendarId
  $env:GOOGLE_OAUTH_CLIENT_ID = $panelClientId
  $env:GOOGLE_OAUTH_CLIENT_SECRET = $panelClientSecretPlain
  $env:GOOGLE_OAUTH_REFRESH_TOKEN = $panelRefreshTokenPlain

  Push-Location -LiteralPath $panelProjectPath
  npm run dev
} finally {
  if ((Get-Location).Path -eq $panelProjectPath) {
    Pop-Location
  }
  Remove-Item Env:\GOOGLE_CALENDAR_ID -ErrorAction SilentlyContinue
  Remove-Item Env:\GOOGLE_OAUTH_CLIENT_ID -ErrorAction SilentlyContinue
  Remove-Item Env:\GOOGLE_OAUTH_CLIENT_SECRET -ErrorAction SilentlyContinue
  Remove-Item Env:\GOOGLE_OAUTH_REFRESH_TOKEN -ErrorAction SilentlyContinue
  $panelClientSecretPlain = $null
  $panelRefreshTokenPlain = $null
}
