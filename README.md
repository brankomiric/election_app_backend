# Description
Application is contained in three repositories:

## Frontend: 
[https://github.com/brankomiric/election_app_frontend]
Is a SPA app created in Angular. It contains no styling - it's all HTML. Homepage has links to three components:
*Register for voting* - User inputs an Ethereum address and gets funded with 1 Token from the Contract itself. Gas fees are covered by the Contract instantiator, that is the derived address 0 from the mnemonic in the environment file. This address should have some Rinkeby Ether, or these transaction will be submitted with very low gas amount and will take forever to be picked up. 

*Vote* - User needs to select the candidate he wishes to vote for from the dropdown, enter the token amount he wishes to send and enter the private key of the address that contains the token. Voting will cost gas so the address should have some Rinkeby Eth. User can click _List_ button to get the ranking of candidates. This was implemented different that in the Task Requirements - all voting records are fetched and sorted in the Frontend as it didn't make sense to me to do this in the Smart Contract. It's simpler and more gas efficient.

I also appended an Eth address to every candidate as the list lacked a unique identifier and these addresses are also used to receive voting tokens.

*Vote Through a Proxy Server* - Does the same as the *Vote* component without directly communication with the blockchain. Instead the data is relayed through a node.js server and transactions are executed there. 

## Backend 
[https://github.com/brankomiric/election_app_backend]
Is a Node and Express app with endpoints needed for the Frontend. It stores all votes in Mongo DB. It also has a cron job running every 5 minutes checking for votes failed due to a network error and retries those.

You will need a Mongo instance running in order to use the Backend. A simple way to start Mongo server using Docker: 
```
docker run --name <your_mongo_container_name> -p 27017:27017 mongo
```

## Smart Contracts
[https://github.com/brankomiric/election_app_smart_contracts]
Are created using the Hardhat framework. More info in the repo readme

## Lolčina
[https://github.com/brankomiric/election_app_backend/blob/main/response_to_review.png]
Are. You. Serious???
[https://github.com/brankomiric/election_app_backend/blob/main/response_to_review.png]
