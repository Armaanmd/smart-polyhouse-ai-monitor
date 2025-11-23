# Backend Setup
Write-Host "Setting up Backend..." -ForegroundColor Green
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt

# Frontend Setup
Write-Host "Setting up Frontend..." -ForegroundColor Green
cd ..\frontend\dashboard
npm install

Write-Host "Setup Complete!" -ForegroundColor Green