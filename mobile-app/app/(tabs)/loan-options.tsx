import { View, Text, TouchableOpacity } from 'react-native';

export default function LoanOptions() {
    const banks = [
        { name: 'SBI', rate: '8.5%' },
        { name: 'HDFC', rate: '9%' },
        { name: 'ICICI', rate: '9.2%' }
    ];

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Loan Options</Text>

            {banks.map((bank, index) => (
                <TouchableOpacity
                    key={index}
                    style={{
                        borderWidth: 1,
                        padding: 15,
                        marginTop: 10,
                        borderRadius: 10
                    }}
                >
                    <Text>{bank.name}</Text>
                    <Text>Interest: {bank.rate}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

}