# Build from the repository root: docker build -f services/accounts-api/Dockerfile .
# Only the files declared in service.yaml data.reads are baked in; nothing else from the repo.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 ACCOUNTS_API_HOST=0.0.0.0 ACCOUNTS_API_ENV=production
WORKDIR /app
COPY services/accounts-api/pyproject.toml services/accounts-api/server.py /app/services/accounts-api/
RUN pip install /app/services/accounts-api
COPY accounts/ACCOUNT-MATRIX.yaml /app/accounts/ACCOUNT-MATRIX.yaml

RUN useradd --system --uid 10001 app
USER app
EXPOSE 3470
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:3470/health', timeout=2)"
CMD ["python", "/app/services/accounts-api/server.py"]
