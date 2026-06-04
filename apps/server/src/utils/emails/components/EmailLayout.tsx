import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Column,
    Section,
    Text,
} from '@react-email/components';

interface EmailLayoutProps {
    preview: string;
    children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
    return (
        <Html lang='en'>
            <Head />
            <Preview>{preview}</Preview>
            <Body style={styles.body}>
                <Container style={styles.container}>
                    {/* Header */}
                    <Section style={styles.header}>
                        <Img
                            src='https://ik.imagekit.io/uw2j2cj9gp/logo-and-name-mixed.webp'
                            alt='Mintd'
                            height={36}
                            style={styles.logo}
                        />
                    </Section>

                    {/* Body Content */}
                    <Section style={styles.content}>{children}</Section>

                    <Hr style={styles.hr} />

                    {/* Social Icons */}
                    <Section style={styles.socialSection}>
                        <Row>
                            <Column align='center'>
                                <Link
                                    href='https://twitter.com/mintduk'
                                    style={styles.socialLink}
                                >
                                    𝕏 Twitter
                                </Link>
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                <Link
                                    href='https://instagram.com/mintduk'
                                    style={styles.socialLink}
                                >
                                    Instagram
                                </Link>
                                &nbsp;&nbsp;·&nbsp;&nbsp;
                                <Link
                                    href='https://linkedin.com/company/mintd'
                                    style={styles.socialLink}
                                >
                                    LinkedIn
                                </Link>
                            </Column>
                        </Row>
                    </Section>

                    {/* Footer */}
                    <Section style={styles.footer}>
                        <Text style={styles.footerText}>
                            &copy; {new Date().getFullYear()} Mintd Ltd. All
                            rights reserved.
                        </Text>
                        <Text style={styles.footerText}>
                            Mintd Ltd is a company registered in England and
                            Wales with company number 16677272.
                        </Text>
                        <Text style={styles.footerText}>
                            Correspondence address: 82a James Carter Road,
                            Mildenhall,{'\n'}
                            Bury St. Edmunds, England, IP28 7DE
                        </Text>
                        <Text style={styles.footerLinks}>
                            <Link
                                href='https://mintd.uk/privacy'
                                style={styles.footerLink}
                            >
                                Privacy Policy
                            </Link>
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            <Link
                                href='https://mintd.uk/terms'
                                style={styles.footerLink}
                            >
                                Terms of Service
                            </Link>
                            &nbsp;&nbsp;·&nbsp;&nbsp;
                            <Link
                                href='mailto:hello@mintd.uk'
                                style={styles.footerLink}
                            >
                                Contact Us
                            </Link>
                        </Text>
                        <Text
                            style={{ ...styles.footerText, marginTop: '12px' }}
                        >
                            You're receiving this email because you have an
                            account with Mintd. This is a transactional email
                            related to your account activity.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: {
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
        margin: '0',
        padding: '0',
    },
    container: {
        backgroundColor: '#ffffff',
        margin: '40px auto',
        maxWidth: '600px',
        borderRadius: '8px',
        overflow: 'hidden' as const,
        border: '1px solid #e5e5e5',
    },
    header: {
        backgroundColor: '#000000',
        padding: '24px 32px',
        textAlign: 'center' as const,
    },
    logo: { display: 'block', margin: '0 auto' },
    content: { padding: '40px 32px' },
    hr: { borderColor: '#e5e5e5', margin: '0 32px' },
    socialSection: { padding: '20px 32px 8px', textAlign: 'center' as const },
    socialLink: { color: '#555', fontSize: '13px', textDecoration: 'none' },
    footer: { padding: '12px 32px 32px', textAlign: 'center' as const },
    footerText: {
        color: '#999',
        fontSize: '11px',
        lineHeight: '1.6',
        margin: '4px 0',
    },
    footerLinks: { margin: '12px 0 4px' },
    footerLink: {
        color: '#999',
        fontSize: '11px',
        textDecoration: 'underline',
    },
};
