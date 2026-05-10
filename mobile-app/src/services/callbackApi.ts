import { API } from "./api";

export const requestCallback = (data: {
  userId?: string;
  name?: string;
  phone: string;
  email?: string;
  preferredTime?: string;
  message?: string;
  source?: string;
}) => {
  return API.post("/callback", data);
};

export const getCallbackRequests = (
  adminPhone: string,
  status?: "Pending" | "Contacted" | "Resolved"
) => {
  return API.get("/callback", {
    headers: {
      "x-admin-phone": adminPhone,
    },
    params: status ? { status } : undefined,
  });
};

export const updateCallbackRequestStatus = (
  adminPhone: string,
  id: string,
  status: "Pending" | "Contacted" | "Resolved"
) => {
  return API.put(
    `/callback/${id}/status`,
    { status },
    {
      headers: {
        "x-admin-phone": adminPhone,
      },
    }
  );
};
