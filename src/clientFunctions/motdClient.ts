import poly, { PolyClientFunction } from "polyapi";

export const polyConfig: PolyClientFunction = {
    context: "covetrus2.demo2",
    name: "motdClient",
    description: "Picks a trained API Function based on mood and returns its content.",
    visibility: "TENANT",
};

export type Mood = "funny" | "wise";

/**
 * Picks a trained API Function based on mood and returns its content.
 * @param {Mood} mood - "funny" calls the trained joke API Function, "wise" calls the trained advice API Function.
 * @returns {Promise<string>} A joke (funny) or a piece of advice (wise).
 */
export async function motdClient(mood: Mood): Promise<string> {
    if (mood === "funny") {
        const joke = await poly.covetrus2.demo2.getRandomJoke();
        return `${joke.data.setup} ... ${joke.data.punchline}`;
    }

    const advice = await poly.covetrus2.demo2.getRandomAdvice();
    return advice.data.slip.advice;
}
