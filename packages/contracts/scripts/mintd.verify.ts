import hre from 'hardhat';
import { verifyContract } from '@nomicfoundation/hardhat-verify/verify';

async function verifyMintd(contractAddress: string, args: any[] = []) {
    const network = await hre.network.connect();

    console.log(
        `Verifying Mintd contract at ${contractAddress} on ${network.networkName}...`,
    );

    try {
        await verifyContract(
            {
                address: contractAddress,
                constructorArgs: args,
                provider: 'etherscan',
            },
            hre,
        );

        console.log('Verification submitted successfully!');
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.toLowerCase().includes('already verified')) {
                console.log('Contract is already verified.');
            } else {
                console.error('Verification failed:', error);
            }
        }
    }
}

/**
 * Run if executed directly
 * (ESM replacement for require.main === module)
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    const address = process.argv[2];

    if (!address) {
        console.error(
            'Usage: npx hardhat run scripts/mintd.verify.ts --network amoy <contract-address>',
        );
        process.exit(1);
    }

    verifyMintd(address).catch((error) => {
        console.error('Error in verification script:', error);
        process.exitCode = 1;
    });
}

export { verifyMintd };
