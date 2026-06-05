import { API } from "./api";

export const createLoan = (data: any) => {
    return API.post("/loan/createLoan", data);
};

export const reserveLoanApplicationNumber = () => {
    return API.post("/loan/application-number");
};

export const requestLoanDocumentUpload = (data: {
    userId: string;
    applicationNumber: string;
    documentType: string;
    fileName: string;
    mimeType: string;
    size: number;
}) => {
    return API.post("/loan/document-upload-url", data);
};

export const getLoansByUser = (userId: string) => {
    return API.get("/loan", { params: { userId } });
};

export const getAllLoansForAdmin = (adminPhone: string) => {
    return API.get("/loan/admin/all", {
        headers: {
            "x-admin-phone": adminPhone,
        },
    });
};

export const updateLoanStatusForAdmin = (
    adminPhone: string,
    id: string,
    status: "In Review" | "Approved" | "Rejected" | "Disbursed"
) => {
    return API.put(
        `/loan/admin/${id}/status`,
        { status },
        {
            headers: {
                "x-admin-phone": adminPhone,
            },
        }
    );
};

export const getAdminLoanDocumentUrl = (
    adminPhone: string,
    id: string,
    documentKey: string
) => {
    return API.get(`/loan/admin/${id}/document/${documentKey}`, {
        headers: {
            "x-admin-phone": adminPhone,
        },
    });
};
