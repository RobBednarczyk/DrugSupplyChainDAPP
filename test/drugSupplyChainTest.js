const DrugSupplyChain = artifacts.require("DrugSupplyChain");

contract("DrugSupplyChain", async(accounts) => {
    const owner = accounts[0];

    it("checks if the creator of the contract is a pharmaceutical company", async() => {
        let instance = await DrugSupplyChain.deployed();
        let isPharmaCompany = await instance.isPharmaCompany.call(owner);
        assert(isPharmaCompany);
    });

    it("checks that the newly created contract does not have any drugs discovered", async() => {
        let instance = await DrugSupplyChain.deployed();
        let drugNo = await instance.howManyDrugs.call();
        assert.equal(drugNo, 0);
    });

    it("checks that the role cannot be changed", async() => {
        let instance = await DrugSupplyChain.deployed();
        var error;
        try {
            await instance.signInAs(owner, "MVO");
        } catch(err) {
            error = true;
        }
        assert(error);
    });

    it("checks if the drug is properly created", async() => {
        let instance = await DrugSupplyChain.deployed();
        let drugName = "Pollenix";
        let pharmaName = "ABCPharm";
        let pharmaInfo = "10 Redwood Drive, Pasadena";
        let activeIngredient = "Pheronaline";
        let upc = 1;
        await instance.discoverDrug(drugName, pharmaName, pharmaInfo, activeIngredient, {from: owner});

        let drugInfo = await instance.fetchItemBufferOne.call(upc);
        let storedOwnerAddr = drugInfo[2];
        let storedPharmaName = drugInfo[4];
        assert.equal(storedOwnerAddr, owner);
        assert.equal(storedPharmaName, pharmaName);
        let drugNo = await instance.howManyDrugs.call();
        assert.equal(drugNo, 1);
    });

    it("checks if the txHistory is updated", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        let firstTxHash = "testHash1";
        let secondTxHash = "testHash2";
        await instance.setTxHistory(upc, firstTxHash);
        await instance.setTxHistory(upc, secondTxHash);
        let storedTx1 = await instance.drugsHistory.call(upc, 0);
        let storedTx2 = await instance.drugsHistory.call(upc, 1);
        assert.equal(storedTx1, firstTxHash);
        assert.equal(storedTx2, secondTxHash);
    });

    it("checks that the drug cannot be discovered twice", async() => {
        let instance = await DrugSupplyChain.deployed();
        let drugNo = await instance.howManyDrugs.call();
        assert.equal(drugNo, 1);
        let drugName = "Pollenix";
        let pharmaName = "ABCPharm";
        let pharmaInfo = "10 Redwood Drive, Pasadena";
        let activeIngredient = "Pheronaline";
        var error;
        try {
            await instance.discoverDrug(drugName, pharmaName, pharmaInfo, activeIngredient, {from: owner});
        } catch(err) {
            error = true;
        }
        assert(error);
    });

    it("checks if a different user can sign in as a MVO and assign a unique code", async() => {
        let instance = await DrugSupplyChain.deployed();
        let mvoUser = accounts[1];
        //console.log(mvoUser);
        await instance.signInAs(mvoUser, "MVO", {from:mvoUser});
        let isMvo = await instance.isMVO.call(mvoUser);
        assert(isMvo);
        await instance.addUniqueID(1, {from: mvoUser});
        let drugInfo = await instance.fetchItemBufferTwo.call(1, {from:mvoUser});
        // console.log("univProdCode: ", drugInfo[0].toNumber());
        // console.log("productID: ", drugInfo[1]);
        // console.log("drugNotes: ", drugInfo[2]);
        // console.log("drugPrice: ", drugInfo[3].toNumber());
        // console.log("drugState: ", drugInfo[4].toNumber());
        // console.log("mvoID: ", drugInfo[5]);
        //let storedState = drugInfo[0];
        let storedMVOid = drugInfo[5];
        let storedState = drugInfo[4];
        //console.log(storedState);
        assert.equal(storedMVOid, mvoUser);
        assert.equal(storedState, 1);
    });

    it("checks if the pharma company that discovered the drug can produce it", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        let price = web3.utils.toWei("0.01", "ether");
        let drugNotes = "2 pills, 3 times per day";
        await instance.produceDrug(upc, price, drugNotes, {from:owner});
        let drugInfo = await instance.fetchItemBufferTwo.call(1, {from:owner});
        let storedNotes = drugInfo[2];
        let storedPrice = drugInfo[3];
        let storedState = drugInfo[4];
        assert.equal(storedNotes, drugNotes);
        assert.equal(storedPrice, price);
        assert.equal(storedState, 2);
    });

    it("checks that a pharma company that did not discover a drug cannot produce it", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        let pharma2user = accounts[2];
        await instance.signInAs(pharma2user, "Pharmaceutical Company", {from:pharma2user});
        let isPharma = await instance.isPharmaCompany.call(pharma2user);
        assert(isPharma);
        let price = await web3.utils.toWei("0.01", "ether");
        let drugNotes = "2 pills, 3 times per day";
        var error;
        try {
            await instance.produceDrug(upc, price, drugNotes, {from:pharma2user});
        } catch(err) {
            error = true;
        }
        assert(error);
        let drugInfo = await instance.fetchItemBufferOne.call(upc);
        let currentOwner = drugInfo[2];
        assert.notEqual(currentOwner, pharma2user);
    });

    it("checks that a pharma company can put a produced drug on wholeSale", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        await instance.setForWholeSale(upc, {from:owner});
        let drugInfo = await instance.fetchItemBufferTwo.call(upc);
        let storedState = drugInfo[4];
        assert.equal(storedState, 3);
    });

    it("checks if a wholesaler can buy a drug that was put on sale", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        let wholeSaleUser = accounts[3];
        await instance.signInAs(wholeSaleUser, "Wholesale Company", {from:wholeSaleUser});
        let isWholeSaleCompany = await instance.isWholeSaleCompany.call(wholeSaleUser);
        assert(isWholeSaleCompany);
        let drugInfo1Before = await instance.fetchItemBufferOne.call(upc);
        let drugOwnerBefore = drugInfo1Before[2];
        assert.equal(drugOwnerBefore, owner);

        let drugInfo2Before = await instance.fetchItemBufferTwo.call(upc);
        let drugPrice = drugInfo2Before[3];

        let buyerBalanceBefore = await web3.eth.getBalance(wholeSaleUser);
        let sellerBalanceBefore = await web3.eth.getBalance(owner);
        let valuePaid = await web3.utils.toWei("0.03", "ether");
        await instance.buyDrugItem(upc, {from:wholeSaleUser, value:valuePaid, gasPrice:0});
        let buyerBalanceAfter = await web3.eth.getBalance(wholeSaleUser);
        let sellerBalanceAfter = await web3.eth.getBalance(owner);
        assert.equal(Number(buyerBalanceBefore) - Number(buyerBalanceAfter), Number(drugPrice));
        assert.equal(Number(sellerBalanceAfter), Number(sellerBalanceBefore) + Number(drugPrice));

        let drugInfo1After = await instance.fetchItemBufferOne.call(upc);
        let drugOwnerAfter = drugInfo1After[2];
        assert.equal(drugOwnerAfter, wholeSaleUser);

        let drugInfo2After = await instance.fetchItemBufferTwo.call(upc);
        let drugStateAfter = drugInfo2After[4];
        let storedWholeSalerAddress = drugInfo2After[6];
        assert.equal(drugStateAfter, 4);
        assert.equal(storedWholeSalerAddress, wholeSaleUser);
    });

    it("checks if a pharmacy can buy a drug that was put on sale", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        let wholeSaleUser = accounts[3];
        let pharmacyUser = accounts[4];
        await instance.signInAs(pharmacyUser, "Pharmacy", {from:pharmacyUser});
        let isPharmacy = await instance.isPharmacy.call(pharmacyUser);
        assert(isPharmacy);
        let drugInfo1Before = await instance.fetchItemBufferOne.call(upc);
        let drugOwnerBefore = drugInfo1Before[2];
        assert.equal(drugOwnerBefore, wholeSaleUser);

        let drugInfo2Before = await instance.fetchItemBufferTwo.call(upc);
        let drugPrice = drugInfo2Before[3];

        let buyerBalanceBefore = await web3.eth.getBalance(pharmacyUser);
        let sellerBalanceBefore = await web3.eth.getBalance(wholeSaleUser);
        let valuePaid = await web3.utils.toWei("0.03", "ether");
        await instance.buyDrugItem(upc, {from:pharmacyUser, value:valuePaid, gasPrice:0});
        let buyerBalanceAfter = await web3.eth.getBalance(pharmacyUser);
        let sellerBalanceAfter = await web3.eth.getBalance(wholeSaleUser);
        assert.equal(Number(buyerBalanceBefore) - Number(buyerBalanceAfter), Number(drugPrice));
        assert.equal(Number(sellerBalanceAfter), Number(sellerBalanceBefore) + Number(drugPrice));

        let drugInfo1After = await instance.fetchItemBufferOne.call(upc);
        let drugOwnerAfter = drugInfo1After[2];
        assert.equal(drugOwnerAfter, pharmacyUser);

        let drugInfo2After = await instance.fetchItemBufferTwo.call(upc);
        let drugStateAfter = drugInfo2After[4];
        let storedPharmacyId = drugInfo2After[7];
        assert.equal(drugStateAfter, 5);
        assert.equal(storedPharmacyId, pharmacyUser);
    });

    it("checks if a client can buy a drug that was put on sale", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 1;
        let pharmacyUser = accounts[4];
        let clientUser = accounts[5];
        await instance.signInAs(clientUser, "Client", {from:clientUser});
        let isClient = await instance.isClient.call(clientUser);
        assert(isClient);
        let drugInfo1Before = await instance.fetchItemBufferOne.call(upc);
        let drugOwnerBefore = drugInfo1Before[2];
        assert.equal(drugOwnerBefore, pharmacyUser);

        let drugInfo2Before = await instance.fetchItemBufferTwo.call(upc);
        let drugPrice = drugInfo2Before[3];

        let buyerBalanceBefore = await web3.eth.getBalance(clientUser);
        let sellerBalanceBefore = await web3.eth.getBalance(pharmacyUser);
        let valuePaid = await web3.utils.toWei("0.03", "ether");
        await instance.buyDrugItem(upc, {from:clientUser, value:valuePaid, gasPrice:0});
        let buyerBalanceAfter = await web3.eth.getBalance(clientUser);
        let sellerBalanceAfter = await web3.eth.getBalance(pharmacyUser);
        assert.equal(Number(buyerBalanceBefore) - Number(buyerBalanceAfter), Number(drugPrice));
        assert.equal(Number(sellerBalanceAfter), Number(sellerBalanceBefore) + Number(drugPrice));

        let drugInfo1After = await instance.fetchItemBufferOne.call(upc);
        let drugOwnerAfter = drugInfo1After[2];
        assert.equal(drugOwnerAfter, clientUser);

        let drugInfo2After = await instance.fetchItemBufferTwo.call(upc);
        let drugStateAfter = drugInfo2After[4];
        let storedPharmacyId = drugInfo2After[8];
        assert.equal(drugStateAfter, 6);
        assert.equal(storedPharmacyId, clientUser);
    });

    it("checks if the price can be updated by the owner (only pharma companies, wholesalers and pharmacies)", async() => {
        let instance = await DrugSupplyChain.deployed();
        let upc = 2;
        let pharmaCompany2 = accounts[6];
        await instance.signInAs(pharmaCompany2, "Pharmaceutical Company", {from:pharmaCompany2});

        let drugName = "Refluxin";
        let pharmaName = "ClaxoMed";
        let pharmaInfo = "10 Oak Street, Newark";
        let activeIngredient = "Metadexyn";
        await instance.discoverDrug(drugName, pharmaName, pharmaInfo, activeIngredient, {from: pharmaCompany2});

        let mvoUser2 = accounts[7];
        await instance.signInAs(mvoUser2, "MVO", {from:mvoUser2});
        await instance.addUniqueID(2, {from: mvoUser2});

        let price = await web3.utils.toWei("0.02", "ether");
        let drugNotes = "1 pills, 2 times per day";
        await instance.produceDrug(upc, price, drugNotes, {from:pharmaCompany2});
        let drugInfo2Before = await instance.fetchItemBufferTwo.call(upc);
        let priceBefore = drugInfo2Before[3];
        let priceAfter = await web3.utils.toWei("0.025", "ether");

        await instance.updatePrice(upc, priceAfter, {from:pharmaCompany2});
        let drugInfo2After = await instance.fetchItemBufferTwo.call(upc);
        let priceStoredAfter = drugInfo2After[3];
        assert.equal(priceStoredAfter, priceAfter);
    });


});
