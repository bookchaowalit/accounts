# Solo Empire Official Account — LINE

## Purpose

This account is the business-facing LINE entry point for Solo Empire
automation. It may eventually serve as the front door for operational agents,
notifications, and selected customer or venture workflows.

## Planned capabilities

- LINE Messaging API for receiving webhook events and sending messages.
- Rich menus and postback actions for routing requests to internal workflows.
- LINE Bot MCP Server for AI-assisted outbound messages and account operations.
- A central webhook/router so multiple internal agents can share one account
  without competing for the LINE webhook.

## Account boundary

Keep private human conversations on the personal LINE account. Use this
Official Account for business automation and explicitly approved recipients.
Do not send financial, health, or other sensitive information through this
account without an appropriate privacy and authorization design.

## Configuration references

Non-secret configuration is recorded in [`account.yaml`](./account.yaml).
Credentials must be provided through the local environment or credential
store. Never commit channel access tokens, webhook signing secrets, OAuth
credentials, or user IDs that identify real people.

## Current status

`planned` — account structure created; LINE account, Messaging API channel,
webhook, and MCP configuration still require setup and verification.
