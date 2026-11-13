#!/usr/bin/env bash
set -e

# ==============================================================================
# TechHub Automatic Ubuntu Server Deployment Script
# Target Server: 194.163.168.86 (Ubuntu 20.04/22.04/24.04 LTS)
# ==============================================================================

SERVER_IP="194.163.168.86"
DB_PASS="maina@254"
DB_PASS_ENC="maina%40254"
REPO_URL="https://github.com/jameskk-syy/E-commerce.git"
APP_DIR="/var/www/tech-hub"

echo "=========================================================="
echo " Starting TechHub Deployment on $SERVER_IP..."
echo "=========================================================="

# 1. Update and install prerequisites
echo "[1/8] Updating apt packages and installing system tools..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw build-essential mariadb-server nginx

# 2. Install Node.js 20 LTS
echo "[2/8] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null || [[ $(node -v) != v20* ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
echo "Node version: $(node -v), npm version: $(npm -v)"

# 3. Configure MariaDB Database
echo "[3/8] Configuring MariaDB database and user..."
systemctl enable mariadb
systemctl start mariadb

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS tech_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${DB_PASS}';
FLUSH PRIVILEGES;
EOF

# 4. Clone or Pull Latest Repository
echo "[4/8] Fetching project source code..."
mkdir -p /var/www
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git remote set-url origin "$REPO_URL"
  git fetch origin
  git reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# 5. Write Production .env File
echo "[5/8] Generating production .env configuration..."
cat > "$APP_DIR/.env" <<EOF
# MariaDB Database Connection
DATABASE_URL="mysql://root:${DB_PASS_ENC}@127.0.0.1:3306/tech_hub"

# NextAuth Configuration
NEXTAUTH_SECRET="techhub_production_secret_$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)"
NEXTAUTH_URL="http://${SERVER_IP}"

# Public App URL (For Kopo Kopo Webhooks & Callbacks)
NEXT_PUBLIC_APP_URL="http://${SERVER_IP}"

# Kopo Kopo Payment Configuration
KOPOKOPO_BASE_URL="https://sandbox.kopokopo.com"
KOPOKOPO_CLIENT_ID="liiH1LJEtJdBTJExn4SeNuq3DSxM1IT3pEopzROf1Kw"
KOPOKOPO_CLIENT_SECRET="NunuWKvCGbmCMmSSj5FfpAb8yHilp9tJc8yjQANYNec"
KOPOKOPO_API_KEY="5b188af4b8ffbb03456d18ec417657466c570b47"
KOPOKOPO_WEBHOOK_SECRET="5b188af4b8ffbb03456d18ec417657466c570b47"
KOPOKOPO_TILL_NUMBER="K159349"

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""

# Email Dispatch Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="kirugjames@gmail.com"
SMTP_PASS=""
SMTP_FROM="\"TechHub Security\" <kirugjames@gmail.com>"
EOF

chmod 600 "$APP_DIR/.env"

# 6. Install Node dependencies & Setup Database
echo "[6/8] Installing dependencies and syncing database..."
cd "$APP_DIR"
npm install --legacy-peer-deps

echo "Pushing Prisma schema to MariaDB..."
npx prisma db push --accept-data-loss
npx prisma generate

echo "Verifying admin account..."
node prisma/seed.js

# 7. Build Next.js Production Bundle
echo "[7/8] Building Next.js production build..."
npm run build

# 8. Setup PM2 Process Manager & Nginx Reverse Proxy
echo "[8/8] Setting up PM2 and Nginx reverse proxy..."
if ! command -v pm2 &> /dev/null; then
  npm install -g pm2
fi

pm2 delete tech-hub 2>/dev/null || true
pm2 start npm --name "tech-hub" -- start
pm2 save
pm2 startup systemd -u root --hp /root || true

# Configure Nginx
cat > /etc/nginx/sites-available/tech-hub <<'NGINX_EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;
    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/tech-hub /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Open Firewall ports
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true

echo "=========================================================="
echo " 🎉 TechHub Deployment Completed Successfully!"
echo " Visit your site: http://$SERVER_IP"
echo " Admin portal:    http://$SERVER_IP/login"
echo " Admin Email:     kirugjames@gmail.com"
echo " Admin Password:  Admin@254!"
echo "=========================================================="
