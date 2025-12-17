import hre, { network } from 'hardhat';
import { verifyMintd } from './mintd.verify.js';

async function main() {
    // Establish a single connection to the network
    const connection = await hre.network.connect();
    const { ethers } = connection;
    const [deployer] = await ethers.getSigners();

    console.log('Deploying with:', deployer.address);

    const Mintd = await ethers.getContractFactory('Mintd');
    const mintd = await Mintd.deploy(deployer.address);

    await mintd.waitForDeployment();

    const contractAddress = await mintd.getAddress();
    console.log('Contract deployed at:', contractAddress);

    //Identify connected chain
    const networkName = connection.networkName;

    if (!['hardhat', 'localhost'].includes(networkName)) {
        console.log(`Waiting additional time for Etherscan indexing...`);

        console.log(`Verifying on network: ${networkName}`);
        const deployTx = mintd.deploymentTransaction();
        await deployTx?.wait(5);
        await verifyMintd(contractAddress, [deployer.address]);
    } else {
        console.log('Local network detected, skipping verification.');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });


        // const deployTx = mintd.deploymentTransaction(); // this tell you the low level stuff that happened in deploy the contract instance. resolves to a ts receipt, used to get things like hash, gas used, etc.
    // console.log('Waiting for deployment transaction:', deployTx?.hash);

    // waitForDeployment() this returns the contract instance after deployment and ensure you can interact with the contract straight away.