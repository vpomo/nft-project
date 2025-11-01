const SGAA_NFT = artifacts.require("SGAA_NFT");

module.exports = function(deployer) {
    deployer.deploy(SGAA_NFT);
};
