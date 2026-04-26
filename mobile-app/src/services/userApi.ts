import { API } from "./api";

export const loginUser = (phone: string) => {
    return API.post("/user/login", { phone });
};