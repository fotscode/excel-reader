import { IProcessError } from "@domain/models/ProcessError";

interface ProcessErrorsPaginatedResponse {
    page: number;
    limit: number;
    totalErrors: number;
    totalPages: number;
    data: IProcessError[];
}

export { ProcessErrorsPaginatedResponse }