FROM postgres:16-alpine

COPY dpscheck_schema_pgsql.sql /docker-entrypoint-initdb.d/01-schema.sql
COPY seed.sql /docker-entrypoint-initdb.d/02-seed.sql