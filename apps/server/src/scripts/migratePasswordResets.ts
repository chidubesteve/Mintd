import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { PasswordReset } from '../models/PasswordReset.model';

dotenv.config();

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (
        args.some((arg) => !['--apply', '--dry-run'].includes(arg)) ||
        (args.includes('--apply') && args.includes('--dry-run'))
    ) {
        throw new Error('Use --dry-run or --apply');
    }
    const apply = args.includes('--apply');
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(
        `${apply ? 'APPLY' : 'DRY RUN'}: database=${mongoose.connection.name}`,
    );

    // Remove only legacy TTL indexes on the permanent user collection.
    for (const index of await User.collection.indexes()) {
        const fields = Object.keys(index.key);
        if (
            index.expireAfterSeconds !== undefined &&
            fields.length === 1 &&
            [
                'emailVerificationTokenExpiry',
                'passwordResetTokenExpiry',
            ].includes(fields[0])
        ) {
            console.log(
                `${apply ? 'Removing' : 'Would remove'} TTL index: ${index.name}`,
            );
            if (apply && index.name)
                await User.collection.dropIndex(index.name);
        }
    }

    const legacyFields = {
        $or: [
            { passwordResetToken: { $exists: true } },
            { passwordResetTokenExpiry: { $exists: true } },
        ],
    };
    const count = await User.collection.countDocuments(legacyFields);
    console.log(
        `${apply ? 'Removing' : 'Would remove'} legacy reset fields from ${count} user(s)`,
    );
    if (apply) {
        // Native collection update can remove fields no longer declared in the schema.
        await User.collection.updateMany(legacyFields, {
            $unset: { passwordResetToken: '', passwordResetTokenExpiry: '' },
        });
        await PasswordReset.createIndexes();
        console.log(
            'Migration complete. Existing reset links are invalid; request a new link.',
        );
    } else {
        console.log('No changes made. Rerun with --apply to migrate.');
    }
}

main()
    .catch((error: unknown) => {
        console.error(
            error instanceof Error ? error.message : 'Migration failed',
        );
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
