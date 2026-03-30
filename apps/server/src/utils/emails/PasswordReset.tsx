import { Button, Heading, Text, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface Props {
    userFName: string;
    resetUrl: string;
}

export function PasswordResetEmail({ userFName, resetUrl }: Props) {
    return (
        <EmailLayout preview='Reset your Mintd password'>
            <Heading style={styles.heading}>Reset your password</Heading>
            <Text style={styles.text}>Hi {userFName},</Text>
            <Text style={styles.text}>
                We received a request to reset your Mintd password. Click the
                button below to choose a new one:
            </Text>
            <Button href={resetUrl} style={styles.button}>
                Reset Password
            </Button>
            <Text style={styles.subText}>
                This link expires in <strong>10 minutes</strong>. If you didn't
                request a reset, you can safely ignore this.
            </Text>
            <Text
                style={{
                    ...styles.subText,
                    wordBreak: 'break-all' as const,
                    marginTop: '24px',
                }}
            >
                Or copy this link into your browser: {resetUrl}
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
    button: {
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: '4px',
        padding: '14px 28px',
        fontSize: '15px',
        fontWeight: 'bold',
        textDecoration: 'none',
        display: 'inline-block',
        margin: '16px 0',
    },
    subText: {
        color: '#888',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '8px 0 0',
    },
};
