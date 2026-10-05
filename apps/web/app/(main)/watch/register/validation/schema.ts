import z from 'zod';

export const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic', // for ios devices which often use heic/heif format for photos
    'image/heif',
];

export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const VIEW_TYPES = ['front', 'back', 'left', 'right'] as const;
export type ViewType = (typeof VIEW_TYPES)[number];

export const watchImageEntrySchema = z.object({
    file: z
        .instanceof(File, { message: 'Must be a valid file' })
        .refine((f) => ACCEPTED_IMAGE_TYPES.includes(f.type), {
            message: 'Unsupported file type',
        })
        .refine(
            (f) => f.size <= MAX_FILE_SIZE,
            'File size must be less than 2MB',
        ),
    viewType: z.enum(VIEW_TYPES, {
        errorMap: () => ({ message: 'Invalid view type' }),
    }),
    isPrimary: z.boolean(),
});

export type WatchImageEntry = z.infer<typeof watchImageEntrySchema>;

// Letters (incl. accented), numbers, spaces, and the punctuation that
// actually shows up in real brand/model names (Jaeger-LeCoultre, Nautilus
// 5711/1A, Royal Oak "Jumbo" (39mm), Girard-Perregaux & Cie). Deliberately
// excludes quotes, colons, braces, and backslashes — the characters that
// show up when someone pastes structured text (JSON, code) into a plain
// name field rather than typing a watch name.
const NAME_PATTERN = /^[\p{L}\p{N} .,&()/-]+$/u;

export const watchRegistrationSchema = z.object({
    brand: z
        .string()
        .trim()
        .min(1, { message: 'Brand is required' })
        .max(50, { message: 'Brand must be less than 50 characters' })
        .regex(NAME_PATTERN, { message: 'Brand contains invalid characters' }),
    watchModel: z
        .string()
        .trim()
        .min(1, 'Model is required')
        .max(80, 'Model must be less than 80 characters')
        .regex(NAME_PATTERN, 'Model contains invalid characters'),
    serialNumber: z
        .string()
        .min(1, 'Serial number is required')
        .trim()
        .toUpperCase(),
    // There's no single standardised reference-number format across
    // brands — Rolex ("126610LN"), Patek ("5711/1A-010"), Omega
    // ("310.30.42.50.01.001") and AP ("26470ST.OO.A101CR.01") all use
    // different shapes. Rather than fake one canonical pattern, this just
    // constrains the general shape (uppercase alphanumerics plus the
    // separators real references use) and a sane length.
    referenceNo: z
        .string()
        .trim()
        .toUpperCase()
        .max(30, 'Reference number must be less than 30 characters')
        .regex(/^[A-Z0-9\-./ ]*$/, {
            message: 'Reference number contains invalid characters',
        }),
    description: z
        .string()
        .max(500, 'Description must be less than 500 characters')
        .trim(),
    purchaseDate: z.string().trim().optional(),
    // Deliberately not `.default(false)` — zod's input/output type split for
    // defaulted fields makes this optional on the *input* side, which then
    // fights react-hook-form's <WatchRegistrationValues> generic on
    // useForm/zodResolver (TS2322: boolean | undefined not assignable to
    // boolean). useForm's `defaultValues` already seeds this to `false`,
    // so the zod default was redundant anyway.
    isCustomBrand: z.boolean(),
    images: z
        .array(watchImageEntrySchema)
        .min(1, 'At least one image is required')
        .max(4, 'A maximum of 4 images can be uploaded')
        .refine(
            (imgs) => imgs.filter((img) => img.isPrimary).length === 1,
            'Exactly one image must be set as the primary image',
        ),
});

export type WatchRegistrationValues = z.infer<typeof watchRegistrationSchema>;