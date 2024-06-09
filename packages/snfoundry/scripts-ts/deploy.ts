import { deployContract, deployer, exportDeployments } from "./deploy-contract";

const deployScript = async (): Promise<void> => {
  await deployContract(
    {
      // owner: deployer.address, // the deployer address is the owner of the contract
      default_admin:
        "0x046E9Ef2950C1f8fae698298C2E7bd572d4C2f083F15dCa8c7C43eFf943422a9",
    },
    "GizaWeatherGame"
  );
};

deployScript()
  .then(() => {
    exportDeployments();
    console.log("All Setup Done");
  })
  .catch(console.error);
