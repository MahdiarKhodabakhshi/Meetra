SHELL := /usr/bin/env bash
.SHELLFLAGS := -lc

.PHONY: lint format format-check db-upgrade db-downgrade db-revision db-current db-history db-stamp

PY := conda run -n meetra-api python

lint:
	conda run -n meetra-api ruff check .

format:
	conda run -n meetra-api ruff check . --fix
	conda run -n meetra-api black .

format-check:
	conda run -n meetra-api ruff check .
	conda run -n meetra-api black . --check

db-upgrade:
	$(PY) -m alembic -c alembic.ini upgrade head

db-downgrade:
	$(PY) -m alembic -c alembic.ini downgrade -1

db-revision:
	$(PY) -m alembic -c alembic.ini revision --autogenerate -m "$(m)"

db-current:
	$(PY) -m alembic -c alembic.ini current

db-history:
	$(PY) -m alembic -c alembic.ini history

db-stamp:
	$(PY) -m alembic -c alembic.ini stamp head