import poly, { PolyServerFunction } from "polyapi";

export const polyConfig: PolyServerFunction = {
    context: "foo.bar",
    name: "motdServer",
    description: "Greets the caller by name, adding a message of the day chosen by motdClient based on mood.",
    visibility: "TENANT",
    logsEnabled: true,
    serverSideAsync: false,
};

export type MotdPayload = {
    name: string;
    mood: "funny" | "wise";
};

export type MotdResponse = {
    statusCode: number;
    message: string;
};

/**
 * Greets the caller by name, adding a message of the day chosen by motdClient based on mood.
 * @param {MotdPayload} eventPayload - The webhook payload containing the caller's name and mood.
 * @returns {Promise<MotdResponse>} Combined greeting message.
 */
export async function motdServer(eventPayload: MotdPayload): Promise<MotdResponse> {
    const content = await poly.foo.bar.motdClient(eventPayload.mood);

    return {
        statusCode: 200,
        message: `Hi ${eventPayload.name}! ${content}`,
    };
}
