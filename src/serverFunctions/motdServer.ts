import poly, { PolyServerFunction } from "polyapi";

export const polyConfig: PolyServerFunction = {
    context: "covetrus2.demo2",
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

/**
 * Greets the caller by name, adding a message of the day chosen by motdClient based on mood.
 * @param {MotdPayload} eventPayload - The webhook payload containing the caller's name and mood.
 * @returns {Promise<string>} Combined greeting message.
 */
export async function motdServer(eventPayload: MotdPayload): Promise<string> {
    const content = await poly.covetrus2.demo2.motdClient(eventPayload.mood);
    return `Hi ${eventPayload.name}! ${content}`;
}
