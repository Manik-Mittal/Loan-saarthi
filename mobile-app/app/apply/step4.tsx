// import { View, Text } from "react-native";
// import ProgressBar from "../../src/components/ProgressBar";
// import Btn from "../../src/components/Btn";

// export default function Step4() {
//     return (
//         <View style={{ flex: 1, padding: 16 }}>
//             <ProgressBar progress={100} />

//             <Text style={{ fontSize: 20, fontWeight: "700" }}>
//                 Upload Documents
//             </Text>

//             <Text>Aadhaar Upload</Text>
//             <Btn title="Upload Aadhaar" onPress={() => { }} />

//             <Text>PAN Upload</Text>
//             <Btn title="Upload PAN" onPress={() => { }} />

//             <Text>Marksheet Upload</Text>
//             <Btn title="Upload Marksheet" onPress={() => { }} />

//             <Btn title="Submit Application" onPress={() => alert("Done ✅")} />
//         </View>
//     );
// }

import { View, Text } from "react-native";
import ProgressBar from "../../src/components/ProgressBar";
import Btn from "../../src/components/Btn";
import { createLoan } from "../../src/services/loanApi";
import { useUser } from "../../src/context/UserContext";

export default function Step4({ form, prev }: any) {

    const { user } = useUser();

    const handleSubmit = async () => {
        try {
            // 🔥 only sending form data (no documents)
            const payload = {
                ...form,
                userId: user?._id,
            };

            console.log("SUBMITTING:", payload);

            const res = await createLoan(payload);

            console.log("RESPONSE:", res.data);
            alert("Loan Submitted ✅");

        } catch (err: any) {
            console.log("ERROR:", err?.response || err.message);
            alert("Error submitting loan ❌");
        }
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>

            <ProgressBar progress={100} />

            <Text style={{ fontSize: 20, fontWeight: "700" }}>
                Review & Submit
            </Text>

            <Text style={{ marginTop: 8, color: "#6B7280" }}>
                Documents can be uploaded later
            </Text>

            {/* (Optional UI only) */}
            <Text style={{ marginTop: 15 }}>Aadhaar Upload</Text>
            <Btn title="Upload Aadhaar" onPress={() => { }} />

            <Text>PAN Upload</Text>
            <Btn title="Upload PAN" onPress={() => { }} />

            <Text>Marksheet Upload</Text>
            <Btn title="Upload Marksheet" onPress={() => { }} />

            {/* 🔥 FINAL SUBMIT */}
            <View style={{ marginTop: 20 }}>
                {prev && <Btn title="Back" onPress={prev} />}
                <Btn title="Submit Application" onPress={handleSubmit} />
            </View>

        </View>
    );
}