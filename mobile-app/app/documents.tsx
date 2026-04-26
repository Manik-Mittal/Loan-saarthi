import { View, Text, Button } from 'react-native';

export default function Documents() {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Upload Documents</Text>

            <Text>Aadhaar</Text>
            <Button title="Upload" onPress={() => { }} />

            <Text>PAN</Text>
            <Button title="Upload" onPress={() => { }} />

            <Text>Marksheet</Text>
            <Button title="Upload" onPress={() => { }} />
        </View>
    );
}