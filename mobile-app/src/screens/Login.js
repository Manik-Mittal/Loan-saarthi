import { View, Text, TextInput, Button } from 'react-native';
import { useState } from 'react';

export default function Login({ navigation }) {
    const [phone, setPhone] = useState('');

    return (
        <View style={{ padding: 20 }}>
            <Text>Enter Phone</Text>

            <TextInput
                placeholder="Phone"
                value={phone}
                onChangeText={setPhone}
                style={{ borderWidth: 1, marginVertical: 10, padding: 10 }}
            />

            <Button title="Continue" onPress={() => navigation.navigate('Home')} />
        </View>
    );
}