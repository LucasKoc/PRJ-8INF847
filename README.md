# PRJ-8INF847

## Environment setup

## Tests

### Unit tests

```bash
cd Backend
npm run test
cd ..
```

### Integration tests

```bash
docker compose -f docker-compose.integration-test.yaml up -d
cd Backend
npm run test:e2e
cd .. && docker compose -f docker-compose.integration-test.yaml down -v
```

## Functionnal tests (Selenium)

```bash
docker compose -f docker-compose.selenium.yaml up -d --build
cd Selenium && npm test
cd .. && docker compose -f docker-compose.selenium.yaml down -v
```