<?php
// Automatic redirect from legacy Apache XAMPP path to Next.js Frontend Server
header("Location: http://localhost:3001/");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=http://localhost:3001/">
  <title>Redirecting to Movies.snishad...</title>
  <script>
    window.location.href = "http://localhost:3001/";
  </script>
  <style>
    body {
      background-color: #08080c;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .btn {
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #e50914;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h2>Launching Movies.snishad...</h2>
  <p>Connecting to Next.js server on port 3001...</p>
  <a class="btn" href="http://localhost:3001/">Open Movies.snishad (Port 3001)</a>
</body>
</html>
