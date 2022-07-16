const express = require("express");
require("isomorphic-fetch");
const { validationResult, body } = require("express-validator");
const { utils } = require("ethers"); 
const cors = require("cors");

require("dotenv").config();
const { HDWallet } = require("./services/hd_wallet");
const { Ethereum } = require("./services/ethereum");
const { electionAbi, tokenAbi } = require("./config/abis");
const { arrayToObj } = require("./utils/util");
const Vote = require("./models/vote");

const app = express();

app.use(cors());
app.use(express.json());

const routePrefix = "/election/api/v1";

const candidatesApi = "https://wakanda-task.3327.io/list";

app.get(`${routePrefix}/candidates/list`, async (req, res) => {
  try {
    const candidates = await fetchCandidates();
    return res.status(200).send(candidates);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.get(`${routePrefix}/scoreboard`, async (req, res) => {
  try {
    const conn = new Ethereum();

    const wallet = new HDWallet();
    const secrets = wallet.restoreAddressesFromMnemonic(
      process.env.MNEMONIC,
      1
    );

    await conn.connect(secrets.keys[0].privateKey);
    const contract = conn.getContractInstance(
      process.env.ELECTION_CONTRACT_ADDR,
      electionAbi
    );

    const scoreboard = await contract["getScoreboard"]();

    let candidates = await fetchCandidates(true);
    candidates = arrayToObj(candidates, "address");

    scoreboard.forEach((item) => {
      const c = candidates[item.electeeAddr];
      if (c) {
        c.votes = parseInt(item.score.toString());
      }
    });

    candidates = Object.values(candidates).sort(compare);

    return res.status(200).send(candidates);
  } catch (err) {
    return res.status(500).send(err);
  }
});

app.post(
  `${routePrefix}/vote`,
  [
    body(["candidate", "amount", "userPK"])
      .notEmpty()
      .withMessage("missing required propery"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const input = req.body;
    let vote = await Vote.findOne({ userPK: input.userPK });
    try {
      console.log("Processing vote request")
      if (vote) {
        return res.status(400).send("Only one vote is allowed");
      }

      vote = new Vote({
        ...input,
        status: "in-progress",
      });
      await vote.save();

      const conn = new Ethereum();

      await conn.connect(input.userPK);
      const tokenContract = conn.getContractInstance(
        process.env.TOKEN_ADDR,
        tokenAbi
      );

      const tokenAmount = utils.parseUnits(input.amount.toString(), "ether");

      // Transfer the Token to the voted Candidate
      await tokenContract["transfer"](input.candidate, tokenAmount);

      const electionContract = conn.getContractInstance(
        process.env.ELECTION_CONTRACT_ADDR,
        electionAbi
      );

      // Vote
      await electionContract["vote"](input.candidate);

      vote.status = "completed";
      await vote.save();

      return res.status(200).send("ok");
    } catch (err) {
      const isNetworkError =
        err.includes("code: 'NETWORK_ERROR'") &&
        err.includes("reason: 'could not detect network'");
      vote.status = isNetworkError ? "errored-retryable" : "errored";
      await vote.save();
      return res.status(500).send(err);
    }
  }
);

const fetchCandidates = async (setVotes = false) => {
  const response = await fetch(candidatesApi);

  if (response.status == 200) {
    const body = await response.json();
    let candidates = body.candidates;

    // These items don't have a unique identifier, so appending here a random Ethereum address to each
    // This can also be used later to transfer the voting token to
    return addAddressesToCandidates(candidates, setVotes);
  } else {
    throw new Error("Unable to fetch candidates data");
  }
};

const addAddressesToCandidates = (candidates, setVotes) => {
  const wallet = new HDWallet();
  const keys = wallet.restoreAddressesFromMnemonic(process.env.MNEMONIC, 10);
  return candidates.map((c, i) => {
    c.address = keys.keys[i].address;
    if (setVotes) {
      c.votes = 0;
    }
    return c;
  });
};

const compare = (a, b) => {
  if (a.votes > b.votes) {
    return -1;
  }
  if (a.votes < b.votes) {
    return 1;
  }
  return 0;
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Listening on ${PORT}`);
  const { connect } = require("./mongo/connection");
  await connect();
});
