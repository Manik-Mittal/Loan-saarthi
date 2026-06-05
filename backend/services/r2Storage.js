const crypto = require("crypto");
const path = require("path");
const { GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const DOCUMENT_RULES = {
    aadhaar: {
        label: "Aadhaar Card",
        maxSize: MAX_DOCUMENT_SIZE,
        mimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    },
    class10Marksheet: {
        label: "Class 10 Marksheet",
        maxSize: MAX_DOCUMENT_SIZE,
        mimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    },
    class12Marksheet: {
        label: "Class 12 Marksheet",
        maxSize: MAX_DOCUMENT_SIZE,
        mimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    },
    admissionOfferLetter: {
        label: "Admission Offer Letter",
        maxSize: MAX_DOCUMENT_SIZE,
        mimeTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    },
    passportPhoto: {
        label: "Passport Size Photo",
        maxSize: MAX_PHOTO_SIZE,
        mimeTypes: ["image/jpeg", "image/jpg", "image/png"],
    },
};

const MIME_EXTENSIONS = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
};

let client;

const getR2Config = () => ({
    accountId: process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET_NAME,
    uploadTtlSeconds: Number(process.env.R2_UPLOAD_URL_TTL_SECONDS || 900),
    downloadTtlSeconds: Number(process.env.R2_DOWNLOAD_URL_TTL_SECONDS || 300),
});

const requireR2Config = () => {
    const config = getR2Config();
    const missing = Object.entries({
        R2_ACCOUNT_ID: config.accountId,
        R2_ACCESS_KEY_ID: config.accessKeyId,
        R2_SECRET_ACCESS_KEY: config.secretAccessKey,
        R2_BUCKET_NAME: config.bucket,
    })
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(`Missing R2 configuration: ${missing.join(", ")}`);
    }

    return config;
};

const getClient = () => {
    if (client) return client;

    const config = requireR2Config();
    client = new S3Client({
        region: "auto",
        endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        },
    });

    return client;
};

const sanitizeSegment = (value) =>
    String(value || "")
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);

const sanitizeFileName = (value) =>
    String(value || "document")
        .trim()
        .replace(/[/\\?%*:|"<>]/g, "-")
        .replace(/\s+/g, "-")
        .slice(0, 120);

const getExtension = (fileName, mimeType) => {
    const ext = path.extname(String(fileName || "")).toLowerCase();
    if ([".pdf", ".jpg", ".jpeg", ".png"].includes(ext)) {
        return ext === ".jpeg" ? ".jpg" : ext;
    }

    return MIME_EXTENSIONS[mimeType] || "";
};

const getMimeTypeFromFileName = (fileName) => {
    const ext = path.extname(String(fileName || "")).toLowerCase();
    if (ext === ".pdf") return "application/pdf";
    if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
    if (ext === ".png") return "image/png";
    return "";
};

const normalizeMimeType = ({ documentType, fileName, mimeType }) => {
    const value = String(mimeType || "").split(";")[0].trim().toLowerCase();
    if (value && value !== "application/octet-stream") {
        return value === "image/jpg" ? "image/jpeg" : value;
    }

    const inferred = getMimeTypeFromFileName(fileName);
    if (inferred) return inferred;

    return documentType === "passportPhoto" ? "image/jpeg" : "application/pdf";
};

const validateUploadRequest = ({ userId, applicationNumber, documentType, fileName, mimeType, size }) => {
    const rule = DOCUMENT_RULES[documentType];
    const numericSize = Number(size || 0);

    if (!userId) {
        return "Missing required field: userId";
    }

    if (!applicationNumber) {
        return "Missing required field: applicationNumber";
    }

    if (!rule) {
        return "Invalid document type";
    }

    if (!fileName) {
        return "Missing required field: fileName";
    }

    if (!rule.mimeTypes.includes(mimeType)) {
        return `${rule.label} must be one of: ${rule.mimeTypes.join(", ")}`;
    }

    if (!numericSize || numericSize > rule.maxSize) {
        return `${rule.label} must be smaller than ${Math.round(rule.maxSize / 1024 / 1024)}MB`;
    }

    return "";
};

const createDocumentKey = ({ applicationNumber, documentType, fileName, mimeType }) => {
    const safeApplicationNumber = sanitizeSegment(applicationNumber);
    const randomId = crypto.randomBytes(10).toString("hex");
    const extension = getExtension(fileName, mimeType);

    return `loan-applications/${safeApplicationNumber}/${documentType}-${randomId}${extension}`;
};

const createPresignedUpload = async ({ userId, applicationNumber, documentType, fileName, mimeType, size }) => {
    const normalizedMimeType = normalizeMimeType({ documentType, fileName, mimeType });
    const validationError = validateUploadRequest({
        userId,
        applicationNumber,
        documentType,
        fileName,
        mimeType: normalizedMimeType,
        size,
    });
    if (validationError) {
        const err = new Error(validationError);
        err.statusCode = 400;
        throw err;
    }

    const config = requireR2Config();
    const key = createDocumentKey({ applicationNumber, documentType, fileName, mimeType: normalizedMimeType });
    const safeFileName = sanitizeFileName(fileName);
    const expiresIn = Number.isFinite(config.uploadTtlSeconds) ? config.uploadTtlSeconds : 900;
    const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: normalizedMimeType,
        Metadata: {
            userId: sanitizeSegment(userId),
            applicationNumber: sanitizeSegment(applicationNumber),
            documentType,
            originalName: safeFileName,
        },
    });

    const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn });

    return {
        uploadUrl,
        method: "PUT",
        expiresIn,
        headers: {
            "Content-Type": normalizedMimeType,
        },
        document: {
            provider: "cloudflare-r2",
            bucket: config.bucket,
            key,
            applicationNumber: sanitizeSegment(applicationNumber),
            documentType,
            originalName: safeFileName,
            name: safeFileName,
            mimeType: normalizedMimeType,
            size: Number(size || 0),
            uploadedAt: new Date().toISOString(),
        },
    };
};

const createPresignedDownload = async ({ key, originalName, mimeType }) => {
    const config = requireR2Config();
    const expiresIn = Number.isFinite(config.downloadTtlSeconds) ? config.downloadTtlSeconds : 300;
    const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ResponseContentType: mimeType || "application/octet-stream",
        ResponseContentDisposition: `attachment; filename="${sanitizeFileName(originalName || path.basename(key))}"`,
    });

    const downloadUrl = await getSignedUrl(getClient(), command, { expiresIn });

    return {
        downloadUrl,
        expiresIn,
    };
};

module.exports = {
    DOCUMENT_RULES,
    createPresignedDownload,
    createPresignedUpload,
};
