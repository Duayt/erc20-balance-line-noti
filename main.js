const config = require("./config.json");
const notifier = require("line-notify-nodejs");
const Web3 = require("web3");
const standardCoinABI = require("./ABI/coin.json");

async function notify(data) {
  const msg =
    "🎉 Balance increase!!!!" +
    "\nurl: " +
    String(data.url) +
    "\ntoken url: " +
    String(data.tokenUrl) +
    "\ntoken change: " +
    String(data.tokenDiff);
  console.log(msg);
  await notifier(config.notification_key).notify({
    message: msg,
  });
}

const timer = (ms) => new Promise((res) => setTimeout(res, ms));
async function main() {
  console.log("starting");
  web3 = new Web3(
    new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
  );

  const walletAddress = config.wallet_address ;
  const walletUrl = `https://bscscan.com/address/${walletAddress}`;
  const tokenAddress = config.token_address;
  const tokenUrl = `https://bscscan.com/token/${tokenAddress}`;
  const tokenContract = new web3.eth.Contract(standardCoinABI, tokenAddress);
  //   const decimals = 18 //tokenContract.methods.decimals().call({});
  let prevBalance = await tokenContract.methods
    .balanceOf(walletAddress)
    .call({});
  console.log("starting balance", prevBalance);
  while (true) {
    let balance = await tokenContract.methods.balanceOf(walletAddress).call({});
    let tokenDiff = balance - prevBalance;
    if (tokenDiff != 0) {
      if (tokenDiff > 0) {
        const data = {
          url: walletUrl,
          tokenDiff: web3.utils.fromWei(String(tokenDiff)),
          tokenUrl: tokenUrl,
        };
        console.log("balance added!", tokenDiff);
        notify(data);
      } else {
        console.log("balance reduced!", tokenDiff);
      }
      prevBalance = balance;
    } else {
      console.log("checking");
    }
    await timer(5000);
  }
}

main();
