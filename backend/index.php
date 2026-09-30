<?php
// Automatic redirect from legacy Apache XAMPP path to Next.js Backend & Admin Console
header("Location: http://localhost:3000/admin/login");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=http://localhost:3000/admin/login">
  <title>Redirecting to Movies.snishad Admin...</title>
  <script>
    window.location.href = "http://localhost:3000/admin/login";
  </script>
</head>
<body style="background:#08080c;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
  <div style="text-align:center;">
    <h2>Opening Movies.snishad Admin Console...</h2>
    <a href="http://localhost:3000/admin/login" style="color:#e50914;font-weight:bold;">Click here if not redirected automatically</a>
  </div>
</body>
</html>
