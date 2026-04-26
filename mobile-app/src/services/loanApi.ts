import { API } from "./api";

export const createLoan = (data: any) => {
    return API.post("/loan/createLoan", data);
};
