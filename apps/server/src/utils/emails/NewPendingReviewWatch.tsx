import { Heading, Text, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';

interface Props {
    ownerEmail: string;
    brand: string;
    model: string;
    reference?: string;
    assetId: string;
    reason: string;
}

export function NewPendingReviewWatch({
    ownerEmail,
    brand,
    model,
    reference,
    assetId,
    reason,
}: Props) {
    return (
        <EmailLayout preview={`New watch pending review: ${brand} ${model}`}>
            <Heading style={styles.heading}>New watch pending review</Heading>
            <Text style={styles.text}>
                {ownerEmail} just registered a watch that needs manual review
                before it can be minted.
            </Text>

            <Section style={styles.detailsContainer}>
                <Text style={styles.detailRow}>
                    <strong>Brand / model:</strong> {brand} {model}
                </Text>
                {reference && (
                    <Text style={styles.detailRow}>
                        <strong>Reference:</strong> {reference}
                    </Text>
                )}
                <Text style={styles.detailRow}>
                    <strong>Asset ID:</strong> {assetId}
                </Text>
                <Text style={styles.detailRow}>
                    <strong>Reason:</strong> {reason}
                </Text>
            </Section>

            <Text style={styles.subText}>
                Review it from the admin dashboard when you get a chance.
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
    detailsContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '16px 20px',
        margin: '0 0 24px',
    },
    detailRow: {
        color: '#333',
        fontSize: '14px',
        lineHeight: '1.8',
        margin: '0',
    },
    subText: {
        color: '#888',
        fontSize: '13px',
        lineHeight: '1.6',
        margin: '0 0 8px',
    },
};
