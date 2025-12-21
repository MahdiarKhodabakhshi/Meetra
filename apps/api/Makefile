SHELL := /usr/bin/env bash
.SHELLFLAGS := -lc

.PHONY: lint format format-check

lint:
	conda run -n meetra-api ruff check .

format:
	conda run -n meetra-api ruff check . --fix
	conda run -n meetra-api black .

format-check:
	conda run -n meetra-api ruff check .
	conda run -n meetra-api black . --check