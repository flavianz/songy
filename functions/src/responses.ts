export const BadRequest = { code: "400" };
export const Unauthorized = { code: "401" };
export const Forbidden = { code: "403" };
export const InternalError = { code: "500" };

export function Ok(args?: object): Response {
    if (!args) {
        return { code: "100" };
    }
    return { code: "100", data: args };
}

export interface Response {
    code: string;
    data?: object;
}
