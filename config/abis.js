module.exports = {
  electionAbi: [
    "function vote(address candidate)",
    "function getScoreboard() view returns (tuple(address electeeAddr, uint256 score)[] electees)",
  ],
  tokenAbi: [
    "function symbol() public view returns (string)",
    "function name() public view returns (string)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint)",
    "function balanceOf(address usr) public view returns (uint)",
    "function transfer(address dst, uint wad) returns (bool)",
    "function getOneToken(address to)",
  ],
};
