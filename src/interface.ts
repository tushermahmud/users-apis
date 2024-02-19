export interface EmailData {
    from: string | undefined;
    to: string | null | undefined;
    subject: string;
    html: string;
}

