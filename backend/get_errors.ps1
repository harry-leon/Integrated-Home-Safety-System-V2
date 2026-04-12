$content = Get-Content build.log -Encoding Unicode
$errors = $content | Where-Object { $_ -match "\[ERROR\] /C:" }
$errors | Out-File -FilePath errors.txt -Encoding utf8
