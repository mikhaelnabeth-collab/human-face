# netlify.toml

[build]
  publish = "."
  functions = "netlify/functions"

# Redirige /.netlify/functions/* vers les fonctions
[[redirects]]
  from = "/api/*"
  to   = "/.netlify/functions/:splat"
  status = 200
