import { Button, Heading, Text, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface Props {
    userFName: string;
    otp: string; // Changed from token/URL to 6-digit code
}

export function VerifyEmail({ userFName, otp }: Props) {
    return (
        <EmailLayout preview={`Your Mintd verification code is ${otp}`}>
            <Heading style={styles.heading}>
                Welcome to Mintd, {userFName}!
            </Heading>
            <Text style={styles.text}>
                Thank you for signing up. Use the code below to verify your
                email address:
            </Text>

            {/* OTP Block */}
            <Section style={styles.otpContainer}>
                <Text style={styles.otpCode}>{otp}</Text>
            </Section>

            <Text style={styles.subText}>
                This code expires in <strong>10 minutes</strong>. Do not share
                it with anyone.
            </Text>
            <Text style={styles.subText}>
                If you didn't create a Mintd account, you can safely ignore this email.
            </Text>
        </EmailLayout>
    );
}

const styles = {
    heading: { color: '#111', fontSize: '22px', margin: '0 0 16px' },
    text: {
        color: '#444',
        fontSize: '15px',
        lineHeight: '1.6',
        margin: '0 0 24px',
    },
    otpContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center' as const,
        margin: '0 0 24px',
    },
    otpCode: {
        color: '#000',
        fontSize: '40px',
        fontWeight: 'bold',
        letterSpacing: '12px',
        margin: '0',
        fontFamily: 'monospace',
    },
    subText: {
        color: '#888',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '0 0 8px',
    },
};
