import React from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocation } from '../hooks/useLocation';
import Btn from '../components/Btn';

/**
 * Example component to check location during onboarding
 * Add this to your onboarding.tsx or create a separate location check screen
 */
export const LocationCheckScreen = ({ onLocationVerified }: { onLocationVerified: () => void }) => {
    const { location, loading, error, isServiceable } = useLocation();

    const handleContinue = () => {
        if (isServiceable) {
            onLocationVerified();
        } else {
            Alert.alert(
                'Service Not Available',
                error || 'We currently serve Delhi & NCR only.',
                [{ text: 'OK' }]
            );
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0066cc" />
                <Text style={{ marginTop: 16, fontSize: 16 }}>Detecting your location...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                Service Availability Check
            </Text>

            {location && (
                <View style={{ marginBottom: 20, padding: 16, backgroundColor: '#f0f0f0', borderRadius: 8 }}>
                    <Text style={{ fontSize: 14, marginBottom: 8 }}>
                        <Text style={{ fontWeight: 'bold' }}>Detected Location: </Text>
                        {location.city}, {location.state}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                        ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                    </Text>
                </View>
            )}

            {error && (
                <View style={{ padding: 16, backgroundColor: '#ffe0e0', borderRadius: 8, marginBottom: 20 }}>
                    <Text style={{ color: '#cc0000', fontSize: 14 }}>{error}</Text>
                </View>
            )}

            {isServiceable && (
                <View style={{ padding: 16, backgroundColor: '#e0ffe0', borderRadius: 8, marginBottom: 20 }}>
                    <Text style={{ color: '#00aa00', fontSize: 14, fontWeight: 'bold' }}>
                        ✓ You are in our service area!
                    </Text>
                </View>
            )}

            <Btn
                title={isServiceable ? 'Continue' : 'Dismiss'}
                onPress={handleContinue}
                disabled={!location && !error}
            />
        </View>
    );
};
