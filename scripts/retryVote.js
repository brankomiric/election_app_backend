require("dotenv").config();

const { utils } = require("ethers"); 
const Vote = require("../models/vote");
const { connect, disconnect } = require("../mongo/connection");
const { Ethereum } = require("../services/ethereum");
const { electionAbi, tokenAbi } = require("../config/abis");

(async () => {
  await connect();

  const votes = await Vote.find({ status: "errored-retryable" });

  if (votes.length != 0) {
    const conn = new Ethereum();

    for (let vote of votes) {
      try {
        await conn.connect(vote.userPK);
        const tokenContract = conn.getContractInstance(
          process.env.TOKEN_ADDR,
          tokenAbi
        );

        const tokenAmount = utils.parseUnits(vote.amount.toString(), "ether"); 

        // Transfer the Token to the voted Candidate
        console.log("Starting token transfer");
        await tokenContract["transfer"](vote.candidate, tokenAmount);
        console.log("Token transfer completed");

        const electionContract = conn.getContractInstance(
          process.env.ELECTION_CONTRACT_ADDR,
          electionAbi
        );

        // Vote
        console.log("Starting invocation of voting function");
        await electionContract["vote"](vote.candidate);
        console.log("Voting completed");

        vote.status = "completed";
        await vote.save();
      } catch (err) {
        console.error(err);
        err = err.toString();
        const isNetworkError =
          err.includes("code: 'NETWORK_ERROR'") &&
          err.includes("reason: 'could not detect network'");
        vote.status = isNetworkError ? "errored-retryable" : "errored";
        await vote.save();
      }
    }
  }

  await disconnect();
})();
