#!/usr/bin/env python3
"""Focused offline tests for the account matrix projection."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from server import AccountsApi  # noqa: E402


MATRIX = """
version: 1
updated: '2026-08-02'
description: Fixture matrix
status_definitions:
  active: Configured
  planned: Intended
identity_layers:
  - id: public-personal
    display_name: Public
    face_visible: true
    privacy: public
    purpose: Professional identity
    platforms:
      - {platform: github, purpose: personal, name: book, status: active, evidence: accounts/github}
      - {platform: linkedin, purpose: personal, name: book, status: needs-verification}
faceless_brands:
  - {id: artbybook, platforms: [instagram, tiktok], status: planned, topic: Art guides}
existing_platform_records:
  - {platform: facebook, name: sme-page, purpose: business, face_visible: false, status: needs-verification, evidence: dashboard/TOOLS-REGISTRY.md}
anonymous_identities:
  isolation_required: true
  accounts:
    - {id: secret-handle, platforms: [x, reddit], status: planned, purpose: Private venting}
"""


class AccountsApiTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "matrix.yaml"
        self.path.write_text(MATRIX, encoding="utf-8")
        self.api = AccountsApi(self.path, token="", environment="development", allowed_origins=("http://127.0.0.1:3600",))

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def get(self, target: str, **kwargs):
        return self.api.handle("GET", target, **kwargs)

    def test_overview_flattens_every_section(self) -> None:
        response = self.get("/api/v1/accounts")
        self.assertEqual(response.status, 200)
        payload = response.payload
        self.assertEqual(payload["schema_version"], "solo-empire.accounts.v1")
        self.assertEqual(payload["summary"]["accounts_total"], 5)
        self.assertEqual(payload["summary"]["active"], 1)
        self.assertEqual(payload["summary"]["needs_attention"], 2)
        brand_rows = [row for row in payload["accounts"] if row["group_kind"] == "brand"]
        self.assertEqual({row["platform"] for row in brand_rows}, {"instagram", "tiktok"})
        self.assertEqual(payload["source"]["status_definitions"][0], {"value": "active", "description": "Configured"})

    def test_anonymous_identities_are_counts_only(self) -> None:
        payload = self.get("/api/v1/accounts").payload
        self.assertEqual(payload["anonymous"], {
            "isolation_required": True, "identities": 1, "platform_slots": 2,
            "by_status": [{"value": "planned", "count": 1}],
        })
        encoded = json.dumps(payload)
        self.assertNotIn("secret-handle", encoded)
        self.assertNotIn("Private venting", encoded)

    def test_filters(self) -> None:
        payload = self.get("/api/v1/accounts?status=needs-verification&kind=existing").payload
        self.assertEqual([row["name"] for row in payload["accounts"]], ["sme-page"])
        self.assertEqual([group["id"] for group in payload["groups"]], ["existing-records"])
        payload = self.get("/api/v1/accounts?q=ART").payload
        self.assertEqual(payload["summary"]["accounts_matched"], 2)
        self.assertEqual(self.get("/api/v1/accounts?q=" + "x" * 81).status, 400)

    def test_read_only_and_routes(self) -> None:
        self.assertEqual(self.api.handle("POST", "/api/v1/accounts").status, 405)
        self.assertEqual(self.get("/api/v1/other").status, 404)
        self.assertEqual(self.get("/health").payload["status"], "ok")

    def test_token_and_production_gate(self) -> None:
        guarded = AccountsApi(self.path, token="t0ken", environment="development")
        self.assertEqual(guarded.handle("GET", "/api/v1/accounts").status, 401)
        self.assertEqual(guarded.handle("GET", "/api/v1/accounts", headers={"Authorization": "Bearer t0ken"}).status, 200)
        production = AccountsApi(self.path, token="", environment="production")
        self.assertEqual(production.handle("GET", "/api/v1/accounts").status, 503)

    def test_unreadable_matrix_is_503(self) -> None:
        self.path.write_text("- not a mapping\n", encoding="utf-8")
        response = self.get("/api/v1/accounts")
        self.assertEqual(response.status, 503)
        self.assertEqual(response.payload["error"]["code"], "matrix_unavailable")

    def test_real_matrix_projects(self) -> None:
        real = Path(__file__).resolve().parents[3] / "accounts" / "ACCOUNT-MATRIX.yaml"
        response = AccountsApi(real, token="", environment="development").handle("GET", "/api/v1/accounts")
        self.assertEqual(response.status, 200)
        self.assertGreater(response.payload["summary"]["accounts_total"], 0)


if __name__ == "__main__":
    unittest.main()
