# PRJ-8INF847

## Environment setup

## Tests

### Unit tests

```bash
cd Backend
npm run test
```

### Integration tests

```bash
docker compose -f docker-compose.test.yaml up -d
cd Backend
npm run test:e2e
```