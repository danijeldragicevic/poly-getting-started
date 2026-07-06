import type { PolyWebhook } from "polyapi";

export const polyConfig: PolyWebhook = {
    context: "covetrus.demo",
    name: "motdWebhook",
    description: "Receives a name and mood and triggers the motdServer server function.",
    visibility: "TENANT",
    method: "POST",
    subpath: "motd",
    slug: "covetrus-motd",
    requirePolyApiKey: true,
    eventPayloadTypeSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "Name of the person to greet.",
            },
            mood: {
                type: "string",
                enum: ["funny", "wise"],
                description: '"funny" returns a joke, "wise" returns a piece of advice.',
            },
        },
        required: ["name", "mood"],
    },
    responseStatus: 200,
    responsePayload: { message: "MOTD event received." },
    responseHeaders: {
        "Content-Type": "application/json",
    },
    xmlParserOptions: {
        enabled: false,
        explicitArray: false,
        trim: false,
        normalizeTags: false,
    },
    securityFunctions: [
        {
            id: "00e74af9-530a-4f0f-8f7a-0c2a24608ea6",
            message: "Invalid or missing field in event payload.",
        },
    ],
};
