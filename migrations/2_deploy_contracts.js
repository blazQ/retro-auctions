var GameAuction = artifacts.require("./GameAuction.sol");

module.exports = function(deployer) {
    deployer.deploy(GameAuction);
}
