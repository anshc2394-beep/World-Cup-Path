FROM python:3.12-slim
WORKDIR /workspace
COPY packages/simulator packages/simulator
COPY packages/data packages/data
COPY apps/api apps/api
WORKDIR /workspace/apps/api
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

