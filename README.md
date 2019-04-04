# Drug Supply Chain DAPP

This DAPP is a model of a supply chain in the pharmaceutical industry.
It gives users an opportunity to store information about current status of a drug and involved transactions. All the information is stored on the Rinkeby Ethereum Network.

## Roles involved:

  - Pharmaceutical Companies
  - Medicines Verification Organization (MVO)
  - Wholesalers
  - Pharmacies
  - Clients

## States of the product (drug):

  - Discovered
  - Approved (by MVO)
  - Produced
  - ForWholeSale
  - ForRetail (*owned by a wholesaler*)
  - ForSale (*owned by a pharmacy*)
  - Sold (*owned by a client*)

## Installation

1. Download the repository to your local drive
2. Navigate to the `./app` folder
3. Run the following command in order to download all the dependencies required by the front end app
```sh
$ npm install
```
4. Run the following command in order to start a local web server that will give access to the front end app
```sh
$ npm run dev
```
## Running the DAPP
The front end is served on http://localhost:8080/
Users are advised to use *Metamask* browser plugin in order to connect to Rinkeby TestNet

After choosing an account with valid Ether a user can choose to log in as one of the roles described before.
The full supply chain looks as follows:

1. **PharmaCompany** discovers a drug
2. **MVO** approves it and creates a unique hash out of drug details
3. **PharmaCompany** send the drug to mass production
4. **PharmaCompany** sends the drug to wholesale
5. **Wholesaler** buys the drug and sends it to retail
6. **Pharmacy** buys the drug and sets it on sale
7. **Client** buys the drug

After logging in a user (acocunt) cannot change the previously chosen role.
There is a 1 to 1 relation between an ethereum account and a role in the supply chain DAPP.
A user should refresh the browser after every transaction in order to see all the changes
The

## Technical details

- Contract address: 0xCdA33BE4E620869d934Fd807ceBBcF1a00B20A64
- Deployment transaction hash: 0x31348180fad207bc9eaa7a427b0b9d802b577868a75038de9b6f189d4ac3ddcf

Currently there is only one drug produced that finished the full supply chain

Current owner of the drug:

0x3dAb1badCd25eEb393646da073590C752ca354b2

**Status List and txHashes**

1	Discovered
    0x03dd8cee7a4f9ba8a87b1f887b62be2122f46a55cf7cfd7dfdc21247af792dd6	       

2	Approved
    0xe1ba0f8327d7513a657ea617c380e096b2b9e61e441523601cfb6201bf95e14f

3	Produced
    0x656e1391644ee11d54acbf9efb3114dd2fb09e029c80718b14c0fbacfb732026

4	ForWholeSale
    0xfa7669c0e7689691514bf76622816eee78203107d6fe929426ad877a6d92b9f1

5	ForRetail
    0x694284f24cabda0b3217a297452eb2a28e65798f1a958790905fca7b2b5f8cde

6	ForSale
    0x77314de57f5b0b73a02bbe90004275351200e935d0d80fcd3d3d063b319c68e4

7	Sold
    0xc4109eb7d5ffdf46951291d1989e548da8b7935814618c58d7cfd6090975a1ad

There were no libraries nor IPFS used in this project
