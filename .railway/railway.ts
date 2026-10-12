import { defineRailway, project, service } from "railway/iac";

// accounts: the Accounts cell. Variables stay unmanaged (secrets live in Railway only).
// accounts-api sleeps when idle (Railway Serverless) and wakes on the next request.
// Every service runs in Singapore next to Neon (aws-ap-southeast-1) and empire-platform; the IaC does not
// carry the region, so after the first deploy: railway scale --service <svc> asia-southeast1-eqsg3a=1 us-east4-eqdc4a=0
export default defineRailway(() => {
  const api = service("accounts-api", {
    healthcheck: "/health",
    healthcheckTimeout: 60,
    deploy: { sleepApplication: true },
  });

  // accounts-metadata-api: read-only account metadata API for solo-web (service-JWT auth, ACCOUNTS_API_AUTH_* variables).
  const metadata = service("accounts-metadata-api", {
    build: { builder: "DOCKERFILE", dockerfilePath: "services/accounts-metadata-api/Dockerfile" },
    healthcheck: "/ready",
    healthcheckTimeout: 30,
    deploy: { sleepApplication: true },
  });

  return project("accounts", {
    variables: { managed: false },
    resources: [api, metadata],
  });
});
