param([string]$Url = 'http://127.0.0.1:4173')
# Do not open a browser before Vite is responding.
for ($i = 0; $i -lt 60; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Start-Process $Url
            exit 0
        }
    } catch { }
    Start-Sleep -Seconds 1
}
exit 1
