param(
    [string]$DbHost = "ep-rapid-forest-alrxnmci-pooler.ap-southeast-1.aws.neon.tech",
    [string]$DbName = "neondb",
    [string]$DbUser = "neondb_owner",
    [int]$AppPort = 8080,
    [string]$FrontendBaseUrl = "http://localhost:5173",
    [string]$RedisHost = "",
    [int]$RedisPort = 6379,
    [string]$RedisUser = "",
    [string]$SessionCookieDomain = "localhost"
)

function Read-PlainSecret([string]$Prompt) {
    $secure = Read-Host -Prompt $Prompt -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

if ([string]::IsNullOrWhiteSpace($RedisHost)) {
    $RedisHost = Read-Host -Prompt "Enter Redis host"
}

$dbPassword = Read-PlainSecret "Enter Neon DB password"
$redisPassword = Read-PlainSecret "Enter Redis password"

$env:PORT = "$AppPort"
$env:FRONTEND_BASE_URL = $FrontendBaseUrl
$env:DB_DRIVER = "org.postgresql.Driver"
$env:DB_URL = "jdbc:postgresql://$DbHost/$DbName?sslmode=require&channel_binding=require"
$env:DB_USERNAME = $DbUser
$env:DB_PASSWORD = $dbPassword
$env:REDIS_HOST = $RedisHost
$env:REDIS_PORT = "$RedisPort"
$env:REDIS_USERNAME = $RedisUser
$env:REDIS_PASSWORD = $redisPassword
$env:REDIS_SSL_ENABLED = "true"
$env:SESSION_COOKIE_SECURE = "false"
$env:SESSION_COOKIE_DOMAIN = $SessionCookieDomain

Write-Host "Starting backend with cloud DB + Redis configuration..." -ForegroundColor Cyan
& .\mvnw.cmd spring-boot:run
