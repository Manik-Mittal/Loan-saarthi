import { View } from "react-native";
import { useState } from "react";
import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";
import Step4 from "./step4";

export default function Apply() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({}); // 🔥 CENTRAL STATE

    const next = () => setStep((prev) => prev + 1);
    const prev = () => setStep((prev) => prev - 1);

    return (
        <View style={{ flex: 1 }}>

            {step === 1 && (
                <Step1 form={form} setForm={setForm} next={next} />
            )}

            {step === 2 && (
                <Step2 form={form} setForm={setForm} next={next} prev={prev} />
            )}

            {step === 3 && (
                <Step3 form={form} setForm={setForm} next={next} prev={prev} />
            )}

            {step === 4 && (
                <Step4 form={form} setForm={setForm} prev={prev} />
            )}

        </View>
    );
}