import { View, Text, Button } from 'react-native';

export default function Home({ navigation }) {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 20 }}>Welcome 👋</Text>

            <Button
                title="Apply for Loan"
                onPress={() => navigation.navigate('Apply')}
            />
        </View>
    );
}