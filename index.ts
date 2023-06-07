import random from "lodash/random";
import maxBy from "lodash/maxBy";
import filter from "lodash/filter";
import shuffle from "lodash/shuffle";
import { formatEther, formatUnits, Wallet } from "ethers";
import { Network } from "./types";
import { delayProgress, getUSDTQuotes, loadKeys, waitGas } from "./utils";
import { bridgeOmni } from "./bridge-omni";
import { Token } from "./types";
import { getBalance, getErc20Balance } from "./balance";
import {
  DELAY_FROM_SEC,
  DELAY_TO_SEC,
  MIN_NATIVE_IN_DOLLARS,
  NATIVE_TOKENS,
} from "./constants";

const keys = await loadKeys();

console.log("Get quotes");
const quotes = await getUSDTQuotes();
console.log(quotes);

const networks = [
  Network.ARBITRUM,
  Network.AVALANCHE,
  Network.BSC,
  Network.FANTOM,
  Network.OPTIMISM,
  Network.POLYGON,
];

for (let i = 0; i < keys.length; i++) {
  const key = keys[i];
  const count = i + 1;
  const { length } = keys;
  const last = i === keys.length - 1;
  const { address } = new Wallet(key);

  console.log(`${count}/${length} address: ${address}`);

  try {
    const stgBalances = await Promise.all(
      networks.map((network) => getErc20Balance(network, address, Token.STG)),
    );

    const mappedStgBalances = stgBalances.map((balance, index) => ({
      balance,
      network: networks[index],
    }));

    const maxStg = maxBy(mappedStgBalances, (item) => item.balance);

    const stgValue = formatUnits(maxStg.balance, 18);
    const fromNetwork = maxStg.network;

    if (stgValue === "0") {
      console.log("STG not found");
      continue;
    }

    console.log(`Found ${stgValue} STG on ${fromNetwork}`);

    const nativeBalance = await Promise.all(
      networks.map((network) => getBalance(network, address)),
    );

    const mappedNativeBalance = nativeBalance.map((balance, index) => {
      const network = networks[index];
      const native = NATIVE_TOKENS[network];
      const quote = quotes.get(native);

      return {
        balance,
        network,
        dollarValue: Number(formatEther(balance)) * quote,
      };
    });

    // console.log(mappedNativeBalance);

    const filteredNativeBalance = filter(
      mappedNativeBalance,
      (item) =>
        item.dollarValue > MIN_NATIVE_IN_DOLLARS &&
        item.network !== fromNetwork,
    );

    if (filteredNativeBalance.length === 0) {
      console.log("Networks with enough native tokens not found");
      continue;
    }

    const [to] = shuffle(filteredNativeBalance);
    const toNetwork = to.network;

    await waitGas(fromNetwork);

    await bridgeOmni(key, Token.STG, fromNetwork, toNetwork);
  } catch (e) {
    console.log("Error", e);
  }

  if (!last) {
    const delayTimeout = random(DELAY_FROM_SEC, DELAY_TO_SEC);
    await delayProgress(delayTimeout);
  }
}
