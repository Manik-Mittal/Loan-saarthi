import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';

export default function Apply() {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    return (
        <View style={{ padding: 20 }}>
            <Text>Name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
            />

            <Text>Loan Amount</Text>
            <TextInput
                value={amount}
                onChangeText={setAmount}
                style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
            />

            <Button title="Submit" onPress={() => alert('Submitted')} />
        </View>
    );
}