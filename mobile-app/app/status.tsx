import { View, Text } from 'react-native';

export default function Status() {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Application Status</Text>

            <Text>✅ Applied</Text>
            <Text>⏳ Under Review</Text>
            <Text>❌ Pending Approval</Text>
            <Text>💰 Disbursed</Text>
        </View>
    );
}