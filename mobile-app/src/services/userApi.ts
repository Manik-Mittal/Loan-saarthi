import { API } from "./api";

export const loginUser = (phone: string) => {
    return API.post("/user/login", { phone });
};

export const getProfile = (userId: string) => {
    return API.get(`/user/${userId}`);
};

export const updateProfile = (userId: string, data: any) => {
    return API.put(`/user/update/${userId}`, data);
};
