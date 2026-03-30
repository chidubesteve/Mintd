import { Heading, Text, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface Props {
    userFName: string;
    otp: string;
}

export function ResendVerificationEmail({ userFName, otp }: Props) {
    return (
        <EmailLayout preview={`Your new Mintd verification code is ${otp}`}>
            <Heading style={styles.heading}>
                Here's your new verification code
            </Heading>
            <Text style={styles.text}>Hi {userFName},</Text>
            <Text style={styles.text}>
                Your previous code expired — no problem. Here's a fresh one:
            </Text>
            <Section style={styles.otpContainer}>
                <Text style={styles.otpCode}>{otp}</Text>
            </Section>
            <Text style={styles.subText}>
                This code expires in <strong>10 minutes</strong>. Do not share
                it with anyone.
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
        margin: '0 0 12px',
    },
    otpContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center' as const,
        margin: '16px 0 24px',
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
        margin: '0',
    },
};
