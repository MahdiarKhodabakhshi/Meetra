FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Note: This requires a requirements.txt - generate from conda env if needed
COPY requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

# For conda-based setup, install common dependencies
RUN pip install --no-cache-dir \
    fastapi>=0.115.0 \
    uvicorn[standard]>=0.32.0 \
    pydantic>=2.9.0 \
    sqlalchemy>=2.0.36 \
    psycopg[binary]>=3.2.0 \
    alembic>=1.14.0 \
    python-dotenv>=1.0.1 \
    prometheus-fastapi-instrumentator>=7.0.0 \
    structlog \
    argon2-cffi \
    PyJWT>=2.9.0 \
    email-validator \
    cryptography>=43.0.0 \
    bcrypt>=4.2.0 \
    redis>=5.0.0 \
    celery>=5.3.0 \
    httpx>=0.28.0 \
    python-multipart>=0.0.9 \
    pdfplumber \
    python-docx

# Copy application code
COPY . .

# Run with uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
