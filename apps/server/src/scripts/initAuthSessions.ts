import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AuthSession } from '../models/AuthSession.model';

dotenv.config();

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (
        args.some((arg) => !['--apply', '--dry-run'].includes(arg)) ||
        (args.includes('--apply') && args.includes('--dry-run'))
    ) {
        throw new Error('Use --dry-run or --apply');
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is required');

    // Prevent connecting from implicitly creating indexes during a dry run.
    await mongoose.connect(uri, { autoIndex: false, autoCreate: false });

    const apply = args.includes('--apply');

    console.log(
        `${apply ? 'APPLY' : 'DRY RUN'}: database=${mongoose.connection.name}`,
    );

    if (!apply) {
        console.log(
            'Would create AuthSession indexes. No user records are changed.',
        );
        return;
    }

    await AuthSession.createIndexes();
    console.log('AuthSession indexes created.');
}

main()
    .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : 'Setup failed');
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
