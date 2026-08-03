import { AxiosError } from "axios";
export interface ErrorResponse {
    message?: string;
}

export function getErrorMessage(err: unknown, fallback: string): string {
    const error = err as AxiosError<ErrorResponse>;
    return error.response?.data?.message || fallback;
}
