import { config as dotEnvConfig } from "dotenv";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet } from "zksync-ethers";
import * as hre from "hardhat";

// Before executing a real deployment, be sure to set these values as appropriate for the environment being deployed
// to. The values used in the script at the time of deployment can be checked in along with the deployment artifacts
// produced by running the scripts.
const contractName = "ZkProtocolGovernor";
const tokenAddress = "0x99E12239CBf8112fBB3f7Fd473d0558031abcbb5";  // TODO: We'll need to deploy this contract first to get the actual address
const timeLockAddress = "0x55bE1B079b53962746B2e86d12f158a41DF294A6"; // TODO: We'll need to deploy this contract first to get the actual address
const votingDelay = 60 * 60 * 24; // Initially 1 days worth of seconds
const votingPeriod = 60 * 60 * 24 * 7; // Initially 7 days worth of seconds
const proposalThreshold = 1100; // TODO: need real values for these
const initialQuorum = 1200;
const initialLateQuorum = 60 * 60 * 24; // Initially 1 days worth of seconds

async function main() {
  dotEnvConfig();

  const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!deployerPrivateKey) {
    throw "Please set DEPLOYER_PRIVATE_KEY in your .env file";
  }

  console.log("Deploying " + contractName + "...");

  const zkWallet = new Wallet(deployerPrivateKey);
  const deployer = new Deployer(hre, zkWallet);

  const contract = await deployer.loadArtifact(contractName);
  const constructorArgs = [contractName, tokenAddress, timeLockAddress, votingDelay, votingPeriod, proposalThreshold, initialQuorum, initialLateQuorum];
  const protocolGovernor = await deployer.deploy(contract, constructorArgs);

  console.log("constructor args:" + protocolGovernor.interface.encodeDeploy(constructorArgs));

  const contractAddress = await protocolGovernor.getAddress();
  console.log(`${contractName} was deployed to ${contractAddress}`);

  const theToken = await protocolGovernor.token();
  console.log(`The Token is set to: ${theToken}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
