import API from "./api";

export const createLoan = (data: any) => {
    return API.post("/api/createLoan", data);
};