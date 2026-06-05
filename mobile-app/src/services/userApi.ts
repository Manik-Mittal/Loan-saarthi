import { API } from "./api";

export const sendLoginOtp = (phone: string) => {
    return API.post("/user/send-otp", { phone });
};

export const verifyLoginOtp = (phone: string, code: string) => {
    return API.post("/user/verify-otp", { phone, code });
};

export const getProfile = (userId: string) => {
    return API.get(`/user/${userId}`);
};

export const updatePushToken = (userId: string, data: { token: string; platform: string }) => {
    return API.post(`/user/${userId}/push-token`, data);
};

export const sendAdminNotificationToUser = (
    adminPhone: string,
    userId: string,
    data: { title: string; body: string; data?: Record<string, any> }
) => {
    return API.post(`/user/admin/${userId}/notify`, data, {
        headers: {
            "x-admin-phone": adminPhone,
        },
    });
};

export const updateProfile = (userId: string, data: any) => {
    return API.put(`/user/update/${userId}`, data);
};
