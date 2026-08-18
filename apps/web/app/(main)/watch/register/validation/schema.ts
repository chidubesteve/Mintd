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

export const watchRegistrationSchema = z.object({
    brand: z
        .string()
        .trim()
        .min(1, { message: 'Brand is required' })
        .max(50, { message: 'Brand must be less than 50 characters' }),
    watchModel: z.string().min(1, 'Model is required').trim(),
    serialNumber: z
        .string()
        .min(1, 'Serial number is required')
        .trim()
        .toUpperCase(),
    referenceNo: z.string().trim().toUpperCase(),
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