import dotenv from "dotenv";
import triggerConfig from "./motdTrigger.config.json";

dotenv.config({ quiet: true });

const POLY_INSTANCE_URL = process.env.POLY_INSTANCE_URL;
const POLY_API_KEY = process.env.POLY_API_KEY;

if (!POLY_INSTANCE_URL) throw new Error("Missing required environment variable: POLY_INSTANCE_URL");
if (!POLY_API_KEY) throw new Error("Missing required environment variable: POLY_API_KEY");

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export async function createMotdTrigger() {
  const webhook = await findWebhook();
  const serverFunction = await findServerFunction();

  const existingTrigger = await findExistingTrigger();
  if (existingTrigger) {
    // PATCH only accepts: name, waitForResponse, enabled, ownerUserId
    const updatedTrigger = await patchJson(`/triggers/${existingTrigger.id}`, {
      name: triggerConfig.name,
      waitForResponse: triggerConfig.waitForResponse,
      enabled: triggerConfig.enabled,
    });
    console.log(`Trigger '${triggerConfig.name}' updated (id: ${updatedTrigger.id}).`);
    return updatedTrigger;
  }

  // POST accepts the full payload including source and destination
  const createdTrigger = await postJson("/triggers", {
    name: triggerConfig.name,
    source: {
      webhookHandleId: webhook.id,
    },
    destination: {
      serverFunctionId: serverFunction.id,
    },
    waitForResponse: triggerConfig.waitForResponse,
    enabled: triggerConfig.enabled,
  });
  console.log(`Trigger '${triggerConfig.name}' created successfully (id: ${createdTrigger.id}).`);
  return createdTrigger;
}

// Runs automatically when this file is executed directly (e.g. ts-node or npm run setup:trigger)
if (require.main === module) {
  createMotdTrigger().catch((error: Error) => {
    console.error("Failed to create trigger:", error.message ?? error);
    process.exit(1);
  });
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

function buildHeaders() {
  return {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${POLY_API_KEY}`,
    "x-poly-api-version": "1",
  };
}

async function getJson(path: string) {
  const response = await fetch(`${POLY_INSTANCE_URL}${path}`, {
    headers: buildHeaders(),
  });
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function postJson(path: string, body: object) {
  const response = await fetch(`${POLY_INSTANCE_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST ${path} failed: ${response.status} ${response.statusText} — ${text}`);
  }
  return response.json();
}

async function patchJson(path: string, body: object) {
  const response = await fetch(`${POLY_INSTANCE_URL}${path}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PATCH ${path} failed: ${response.status} ${response.statusText} — ${text}`);
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

async function findWebhook() {
  const webhooks = await getJson("/webhooks");
  const webhook = webhooks.find(
    (wh: any) =>
      wh.context === triggerConfig.source.webhookContext &&
      wh.name === triggerConfig.source.webhookName,
  );
  if (!webhook) {
    throw new Error(
      `Webhook '${triggerConfig.source.webhookContext}.${triggerConfig.source.webhookName}' not found. Deploy the webhook first.`,
    );
  }
  return webhook;
}

async function findServerFunction() {
  const serverFunctions = await getJson("/functions/server");
  const serverFunction = serverFunctions.find(
    (sf: any) =>
      sf.context === triggerConfig.destination.serverFunctionContext &&
      sf.name === triggerConfig.destination.serverFunctionName,
  );
  if (!serverFunction) {
    throw new Error(
      `Server function '${triggerConfig.destination.serverFunctionContext}.${triggerConfig.destination.serverFunctionName}' not found. Deploy the server function first.`,
    );
  }
  return serverFunction;
}

async function findExistingTrigger() {
  const triggers = await getJson("/triggers");
  return triggers.find((t: any) => t.name === triggerConfig.name) ?? null;
}
