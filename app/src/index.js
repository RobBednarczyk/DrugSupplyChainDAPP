import Web3 from "web3";
import drugSupplyChain from "../../build/contracts/DrugSupplyChain.json";
import {ingredientsList} from "./data.js";
import {statusList} from "./data.js";

const App = {
    web3: null,
    account: null,
    meta:null,

    start: async function() {
        const {web3} = this;

        // get the network id and address of the contract
        try {
            let networkId = await web3.eth.net.getId();
            let address = drugSupplyChain.networks[networkId].address;
            // create an interface and attach it to the meta property of App
            this.meta = new web3.eth.Contract(drugSupplyChain.abi, address);

            // get the currently chosen account
            let account = await web3.eth.getCoinbase();
            App.account = account

            // display the chosen account in the paragraph
            let accountParagraph = document.getElementById("currentAddress");
            accountParagraph.innerHTML = this.account;

            // check the assigned role
            const {currentRole} = this.meta.methods;
            let roleParagraph = document.getElementById("currentRole");
            let role = await currentRole(this.account).call();
            role = Number(role);
            switch (role) {
                case 0:
                    roleParagraph.innerHTML = "Pharmaceutical Company";
                    break;
                case 1:
                    roleParagraph.innerHTML = "Medicines Verification Organization (MVO)";
                    break;
                case 2:
                    roleParagraph.innerHTML = "Wholesale Company";
                    break;
                case 3:
                    roleParagraph.innerHTML = "Pharmacy";
                    break;
                case 4:
                    roleParagraph.innerHTML = "Client";
                    break;
                case 99:
                    roleParagraph.innerHTML = "No role assigned";
                    break;
            }

        } catch(err) {
            console.log("Could not connect to contract or chain");
        }
    },

    signInAs: async function() {
        const {currentRole} = this.meta.methods;
        let role = await currentRole(this.account).call();
        role = Number(role);
        if (role == 99) {
            let chosenRole = document.getElementById("signInRole").value;
            const {signInAs} = this.meta.methods;
            await signInAs(this.account, chosenRole).send({from:this.account});
        } else {
            alert("Role already assigned! Please change the account and retry");
        }

    },

    updateDrugsList: async function() {
        const {howManyDrugs} = this.meta.methods;
        const {fetchItemBufferOne} = this.meta.methods;
        const {fetchItemBufferTwo} = this.meta.methods;
        let numDrugs = await howManyDrugs().call();
        let tableElement = document.getElementById("drugsListTable");
        tableElement.innerHTML = `
            <tr><th>UPC</th>
            <th>Name</th>
            <th>MVO Code</th>
            <th>Price (wei)</th>
            <th>Action</th>
        </tr>`;

        for (var i = 0; i < numDrugs; i++) {
            // UPC codes are equal to i+1
            let drugInfo1 = await fetchItemBufferOne(i+1).call();
            let drugInfo2 = await fetchItemBufferTwo(i+1).call();
            // fetch all the info pieces
            let upc = drugInfo1[0];
            let drugName = drugInfo1[6];
            let mvoCode = drugInfo1[1];
            let price = drugInfo2[3];
            // create table rows and data
            let tableRow = document.createElement("tr");
            let tabledata1 = document.createElement("td");
            let tabledata2 = document.createElement("td");
            let tabledata3 = document.createElement("td");
            let tabledata4 = document.createElement("td");
            let tabledata5 = document.createElement("td");
            let detailBtn = document.createElement("button");
            detailBtn.innerHTML = "Show details";
    		detailBtn.setAttribute("id", i+1);
    		detailBtn.addEventListener("click", function() {
                App.showTxHistory(upc);
            });
            tabledata1.innerHTML = upc;
    		tabledata2.innerHTML = drugName;
    		tabledata3.innerHTML = mvoCode;
            tabledata4.innerHTML = price;
    		tabledata5.appendChild(detailBtn);
    		tableRow.appendChild(tabledata1);
    		tableRow.appendChild(tabledata2);
    		tableRow.appendChild(tabledata3);
    		tableRow.appendChild(tabledata4);
            tableRow.appendChild(tabledata5);
    		tableElement.appendChild(tableRow);
        }


    },

    showTxHistory: async function(upc) {
        // console.log("Placeholder for tx history");
        // alert("Placeholder for tx history");
        const {drugsHistory} = this.meta.methods;
        //const {ownersHistory} = this.meta.methods;
        const {getTxHistoryLength} = this.meta.methods;
        const {fetchItemBufferOne} = this.meta.methods;
        //console.log(ownersHistory);
        //let upc = Number(this.getAttribute("id"));
        let txHistoryLength = await getTxHistoryLength(upc).call();
        let table = document.getElementById("drugDetailsTable");
        let drugInfo1 = await fetchItemBufferOne(upc).call();
        let currentOwner = drugInfo1[2];
        table.innerHTML = `<tr>
            <th>#</th>
            <th>Status</th>
            <th>Tx Hash</th>
            <th>Current Owner</th>
        </tr>`;
        for (var i = 0; i < txHistoryLength; i++) {
            let txHash = await drugsHistory(upc, i).call();
            //console.log(txHash);
            //let currentOwner = await ownersHistory(upc, i).call();
            let tableRow = document.createElement("tr");
    		let tabledata1 = document.createElement("td");
    		let tabledata2 = document.createElement("td");
    		let tabledata3 = document.createElement("td");
            let tabledata4 = document.createElement("td");
            tabledata1.innerHTML = i+1;
            tabledata2.innerHTML = statusList[i];
            tabledata3.innerHTML = txHash;
            tabledata4.innerHTML = currentOwner;
            tableRow.appendChild(tabledata1);
    		tableRow.appendChild(tabledata2);
    		tableRow.appendChild(tabledata3);
    		tableRow.appendChild(tabledata4);
            table.appendChild(tableRow);
        }
    },

    discoverDrug: async function() {
        const {discoverDrug} = this.meta.methods;
        const {howManyDrugs} = this.meta.methods;
        const {setTxHistory} = this.meta.methods;
        let drugName = document.getElementById("drugName").value;
        let pharmaCompanyName = document.getElementById("origPharmaName").value;
        let pharmaCompanyInfo = document.getElementById("origPharmaInfo").value;
        let activeIngredient = document.getElementById("activeIngredient").value;

        if (drugName == "" || pharmaCompanyInfo == "" || pharmaCompanyName == "" || activeIngredient == "") {
            alert("Please fill in all the four data input fields and retry");
        } else if (document.getElementById("currentRole").innerHTML != "Pharmaceutical Company") {
            alert("Please log in as a Pharmaceutical Company to use this function");
        } else {
            let txObject = await discoverDrug(drugName, pharmaCompanyName, pharmaCompanyInfo, activeIngredient).send({from:this.account});
            let upc = await howManyDrugs().call();
            await setTxHistory(upc, txObject.transactionHash).send({from:this.account});
            alert(`Drug no. ${upc} discovered!`);
        }
    },

    addUniqueID: async function() {
        const {addUniqueID} = this.meta.methods;
        const {setTxHistory} = this.meta.methods;
        let upc = document.getElementById("UPCaddCode").value;
        if (upc == "") {
            alert("Please provide a valid UPC and retry");
        } else if(document.getElementById("currentRole").innerHTML != "Medicines Verification Organization (MVO)") {
            alert("Please log in as an MVO to use this function");
        } else {
            upc = Number(upc);
            let txObject = await addUniqueID(upc).send({from:this.account});
            await setTxHistory(upc, txObject.transactionHash).send({from:this.account});
            alert(`MVO code added for a drug with ID: ${upc}`);
        }

    },

    produceDrug: async function() {
        const {web3} = this;
        const {produceDrug} = this.meta.methods;
        const {setTxHistory} = this.meta.methods;
        let upc = document.getElementById("UPCproduce").value;
        let drugPrice = document.getElementById("drugPrice").value;
        let drugNotes = document.getElementById("drugNotes").value;
        if (upc == "" || drugPrice == "" || drugNotes == "") {
            alert("Please provide a valid UPC and retry");
        } else if (document.getElementById("currentRole").innerHTML != "Pharmaceutical Company") {
            alert("Please log in as a Pharmaceutical Company to use this function");
        } else {
            upc = Number(upc);
            //let price = await web3.utils.toWei(drugPrice, "ether");
            drugPrice = Number(drugPrice);
            let txObject = await produceDrug(upc, drugPrice, drugNotes).send({from:this.account});
            await setTxHistory(upc, txObject.transactionHash).send({from:this.account});
            alert(`Drug with ID: ${upc} scheduled for mass production!`);
        }
    },

    setForWholeSale: async function() {
        const {setForWholeSale} = this.meta.methods;
        const {setTxHistory} = this.meta.methods;
        let upc = document.getElementById("UPCforWholeSale").value;

        if (upc == "") {
            alert("Please provide a valid UPC and retry");
        } else if (document.getElementById("currentRole").innerHTML != "Pharmaceutical Company") {
            alert("Please log in as a Pharmaceutical Company to use this function");
        } else {
            upc = Number(upc);
            let txObject = await setForWholeSale(upc).send({from:this.account});
            await setTxHistory(upc, txObject.transactionHash).send({from:this.account});
            alert(`Drug with ID: ${upc} sent to whole sale`);;
        }
    },

    buyDrug: async function() {
        const {web3} = this;
        const {buyDrugItem} = this.meta.methods;
        const {setTxHistory} = this.meta.methods;
        let upc = document.getElementById("drugUPCToBuy").value;
        let pricePaid = document.getElementById("valueToPay").value;
        if (upc == "" || pricePaid == "") {
            alert("Please provide a valid UPC and retry");
        } else {
            upc = Number(upc);
            //let valuePaid = await web3.utils.toWei(price, "ether");
            pricePaid = Number(pricePaid);
            let txObject = await buyDrugItem(upc).send({from:this.account, value:pricePaid});
            await setTxHistory(upc, txObject.transactionHash).send({from:this.account});
            alert(`Drug with ID: ${upc} successfully bought`);
        }
    }

};

// attach the wrapper to the window object
window.App = App;
window.addEventListener("load", async function() {
    let selectElement = document.getElementById("activeIngredient");
    for (var i = 0; i<=ingredientsList.length; i++) {
        let option = document.createElement("option");
        option.text = ingredientsList[i];
        option.value = ingredientsList[i];
        selectElement.appendChild(option);
    }

});

window.addEventListener("load", async function() {
    //"The Ethereum provider injected by MetaMask and other dapp browsers
    // will now be available at window.ethereum"
    if (window.ethereum) {
        App.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
    } else {
        console.warn("No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",);
        App.web3 = new Web3("http://127.0.0.1:9545");
    };

    App.start();
});

// added for fun - new event listener
// window.addEventListener("Transfer", async function() {
//     let statusBox = document.getElementById("status");
//     App.setStatus("A new token has just been minted!");
//
// })
