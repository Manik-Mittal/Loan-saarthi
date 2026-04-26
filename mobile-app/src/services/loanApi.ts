import { API } from "./api";

export const createLoan = (data: any) => {
    return API.post("/loan/createLoan", data);
};

export const getLoansByUser = (userId: string) => {
    return API.get("/loan", { params: { userId } });
};
