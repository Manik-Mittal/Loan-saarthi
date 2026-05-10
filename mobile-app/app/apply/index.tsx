import { useEffect, useState } from "react";
import { View } from "react-native";
import { useUser } from "../../src/context/UserContext";
import { getProfile } from "../../src/services/userApi";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";

function buildAddressString(address: any) {
    if (!address) return "";
    if (typeof address === "string") return address;

    const parts = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.country,
    ]
        .map((part) => String(part || "").trim())
        .filter(Boolean);

    return parts.join(", ");
}

function createInitialForm(user: any) {
    return {
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: buildAddressString(user?.address),
        pincode: user?.address?.pincode || user?.pincode || "",
        tenth: user?.education?.class10 ? String(user.education.class10) : "",
        twelfth: user?.education?.class12 ? String(user.education.class12) : "",
        college: user?.education?.college || "",
        course: user?.education?.course || "",
        income: user?.financial?.income ? String(user.financial.income) : "",
        loanAmount: user?.financial?.loanAmount ? String(user.financial.loanAmount) : "",
        duration: user?.financial?.duration ? String(user.financial.duration) : "",
        documents: user?.documents || {},
    };
}

export default function Apply() {
    const { user } = useUser();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<any>(() => createInitialForm(user));

    useEffect(() => {
        if (!user) return;

        const nextFromProfile = createInitialForm(user);
        setForm((prev: any) => {
            const merged: any = { ...prev };

            // Prefill only blank fields so in-progress edits are preserved.
            Object.entries(nextFromProfile).forEach(([key, value]) => {
                if (key === "documents") {
                    merged.documents = merged.documents || value || {};
                    return;
                }

                if (!String(merged[key] || "").trim() && String(value || "").trim()) {
                    merged[key] = value;
                }
            });

            return merged;
        });
    }, [user]);

    useEffect(() => {
        let active = true;

        const hydrateFromBackendProfile = async () => {
            if (!user?._id) return;

            try {
                const res = await getProfile(user._id);
                if (!active) return;

                const nextFromProfile = createInitialForm(res.data);
                setForm((prev: any) => {
                    const merged: any = { ...prev };

                    Object.entries(nextFromProfile).forEach(([key, value]) => {
                        if (key === "documents") {
                            merged.documents = merged.documents || value || {};
                            return;
                        }

                        if (!String(merged[key] || "").trim() && String(value || "").trim()) {
                            merged[key] = value;
                        }
                    });

                    return merged;
                });
            } catch {
                // Ignore hydration failure and keep local form values.
            }
        };

        hydrateFromBackendProfile();

        return () => {
            active = false;
        };
    }, [user?._id]);

    const next = () => setStep((prev) => prev + 1);
    const prev = () => setStep((prev) => prev - 1);

    return (
        <View style={{ flex: 1 }}>
            {step === 1 && <Step1 form={form} setForm={setForm} next={next} />}
            {step === 2 && <Step2 form={form} setForm={setForm} next={next} prev={prev} />}
            {step === 3 && <Step3 form={form} setForm={setForm} next={next} prev={prev} />}
            {step === 4 && <Step4 form={form} setForm={setForm} prev={prev} />}
        </View>
    );
}
