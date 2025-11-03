<#
PowerShell helper to initialize a git repo (if needed) and push to GitHub.

USAGE:
  1) Install Git and optionally GitHub CLI (`gh`).
  2) Authenticate locally: `gh auth login` (recommended) or create a PAT and use credential manager.
  3) Run this script from the repository root in PowerShell:
     .\push-to-github.ps1

This script will:
 - initialize a git repo if none exists
 - create an initial commit if there are no commits
 - add the provided remote URL (https://github.com/Quisyyy/NEXT-STEP.git)
 - push to remote (main branch)

Note: This script does NOT include any tokens. You'll be prompted to authenticate by Git/GitHub.
#>

param(
    [string]$RemoteUrl = 'https://github.com/Quisyyy/NEXT-STEP.git',
    [string]$Branch = 'main'
)

function Run($cmd) {
    Write-Host "> $cmd"
    & powershell -NoProfile -Command $cmd
}

Push-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

# Check for git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host 'git is not installed or not in PATH. Please install Git: https://git-scm.com/downloads' -ForegroundColor Yellow
    Pop-Location; return
}

# Initialize repo if needed
if (-not (Test-Path .git)) {
    git init
    Write-Host 'Initialized empty git repository.' -ForegroundColor Green
}

# Ensure there is at least one commit
$hasCommit = & git rev-parse --verify HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
    git add --all
    git commit -m "Initial commit from local workspace"
    Write-Host 'Created initial commit.' -ForegroundColor Green
} else {
    Write-Host 'Repository already has commits.' -ForegroundColor Cyan
}

# Add remote if missing or different
$existing = (& git remote get-url origin 2>$null) -join "`n"
if (-not $existing) {
    git remote add origin $RemoteUrl
    Write-Host "Added remote origin -> $RemoteUrl" -ForegroundColor Green
} elseif ($existing -ne $RemoteUrl) {
    Write-Host "Remote origin already set to: $existing" -ForegroundColor Yellow
    Write-Host "Would you like to update it to $RemoteUrl? (y/N) " -NoNewline
    $r = Read-Host
    if ($r -match '^[Yy]') { git remote set-url origin $RemoteUrl; Write-Host 'Remote updated.' -ForegroundColor Green }
}

# Ensure branch name
# Create or move to branch
$branchExists = (git rev-parse --verify $Branch 2>$null) -ne $null
if (-not $branchExists) {
    git checkout -b $Branch
} else {
    git checkout $Branch
}

# Push (this will prompt for auth if needed)
Write-Host "About to push to origin/$Branch. This may prompt for credentials or use your gh auth." -ForegroundColor Cyan
git push -u origin $Branch

Pop-Location
Write-Host 'Done. If push failed, check errors above (auth, remote permissions, or branch protection).' -ForegroundColor Green
