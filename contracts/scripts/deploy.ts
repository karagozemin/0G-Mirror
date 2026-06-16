import { ethers } from "hardhat";

async function main() {
  const MirrorRegistry = await ethers.getContractFactory("MirrorRegistry");
  const registry = await MirrorRegistry.deploy();
  await registry.waitForDeployment();

  console.log(`MirrorRegistry deployed to ${await registry.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
