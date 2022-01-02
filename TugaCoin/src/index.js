const {Blockchain, Transaction} = require(__dirname+'/blockchain/Blockchain');
const Wallet = require("./blockchain/Wallet");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const PORT = 80;

//  ===========================================================================================

const tugaCoin= new Blockchain();
const menus= ['Wallets', 'Transactions', 'Blockchain', 'Settings']
let activeMenu= menus[0];
let availableWallets= [], inUse_Wallet= undefined;
let viewingBlockTransactions= [];

//  ===========================================================================================
//  RESOURCES ROUTES
//  ===========================================================================================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', express.static(__dirname));
app.use('/', express.static(__dirname+'/views/stylesheet'));
app.use('/', express.static(__dirname+'/blockchain'));


//  ===========================================================================================
//	FRONT END RENDERING
//  ===========================================================================================
app.get("/", async (req, res) => {
	if (!tugaCoin.isChainValid()) return res.render('pages/error', {error: 'Blockchain was corrupted!'});
	return res.render("pages/index", {
		activeMenu: activeMenu,
		menus: menus,
		availableWallets: availableWallets,
		activeWalletAddress: inUse_Wallet ? inUse_Wallet.myaddress : '',
		balance: inUse_Wallet ? inUse_Wallet.getBalance() : 0,
		tugaCoin: tugaCoin,
		blockTransactions: viewingBlockTransactions
	})
});

//	==========================================================================================
//	MENUS ROUTES
//	==========================================================================================

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));

app.post(`/${menus[0]}`, function(req, res) {
	activeMenu= menus[0]
	res.redirect("/");
});
app.post(`/${menus[1]}`, function(req, res) {
	activeMenu= menus[1]
	res.redirect("/");
});
app.post(`/${menus[2]}`, function(req, res) {
	activeMenu= menus[2]
	res.redirect("/");
});
app.post(`/${menus[3]}`, function(req, res) {
	activeMenu= menus[3]
	res.redirect("/");
});

//	==========================================================================================
//	ACTIONS ROUTES
//	==========================================================================================


//	MENU 0: MY WALLET
app.post('/generateNewKey', function(req, res) {
	availableWallets.push(new Wallet());
	res.redirect("/");
});
app.post('/selectWallet', function(req, res) {
	inUse_Wallet= getWalletByAddress(req.body['selectedWallet'])
	res.redirect("/");
});


//	MENU 1: TRANSACTIONS
app.post('/addTransaction', function(req, res) {
	const amount= req.body['amount'] ? Number(req.body['amount']) : undefined;
	const selectedWallet= req.body['selectedWallet']!='Send To' ? req.body['selectedWallet'] : undefined;
	if (amount && selectedWallet) {
		const transaction= new Transaction(inUse_Wallet.myaddress, selectedWallet, amount);
		try { transaction.signTransaction(inUse_Wallet.mysignature); }
		catch (error) { return res.send('<script>alert("Not signed wallet!")</script>'); }
		tugaCoin.addTransaction(transaction);
		return res.redirect("/");
	} return res.send('<script>alert("Please fill all the fields!")</script>')
});

app.post('/minePendingTransactions', function(req, res) {
	availableWallets= tugaCoin.minePendingTransactions(inUse_Wallet.myaddress, availableWallets);
	res.redirect("/");
});


//	MENU 2: BLOCKCHAIN
app.get('/viewTransactions', function(req, res) {
	viewingBlockTransactions= req.query['index'] ? tugaCoin.chain[Number(req.query['index'])].transactions : [];
	res.redirect("/");
});


//	MENU 3: SETTINGS
app.post('/changeSettings', function(req, res) {
	const newDifficulty= req.body['newDifficulty'] ? Number(req.body['newDifficulty']) : tugaCoin.difficulty;
	const newMiningReward= req.body['newMiningReward'] ? req.body['newMiningReward'] : tugaCoin.miningReward;
	tugaCoin.difficulty= newDifficulty;
	tugaCoin.miningReward= newMiningReward;
	res.redirect("/");
});

function getWalletByAddress(address) {
	for (const wallet of availableWallets) {
		if (wallet.myaddress == address) return wallet;
	} return undefined;
}
