const DrugSupplyChain = artifacts.require("DrugSupplyChain");

module.exports = function(deployer) {
    deployer.deploy(DrugSupplyChain, {gas: 6500000});
};
