export const BAD_REQUEST = { code: "400" };
export const UNAUTHORIZED = { code: "401" };
export const FORBIDDEN = { code: "403" };
export const INTERNAL_ERROR = { code: "500" };

export function OK(args?: object): Response {
    if (!args) {
        return { code: "100" };
    }
    return { code: "100", data: args };
}

export interface Response {
    code: string;
    data?: object;
}
