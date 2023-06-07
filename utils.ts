import { Presets, SingleBar } from "cli-progress";
import fs from "fs/promises";
import { formatUnits, JsonRpcProvider } from "ethers";
import cli from "cli";
import { KEYS_FILENAME, MAX_GAS_GWEI, RPC_URL, TX_SCAN } from "./constants";
import { Native, Network } from "./types";

const providers = new Map<Network, JsonRpcProvider>();

for (const [key, value] of Object.entries(RPC_URL)) {
  providers.set(key as Network, new JsonRpcProvider(value));
}

export { providers };

export const delay = (seconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, seconds * 1000));

export const delayProgress = (seconds: number) => {
  return new Promise<void>((resolve) => {
    const bar = new SingleBar({
      format: "Delay [{bar}] {value}/{total}",
    }, Presets.shades_classic);

    bar.start(seconds, 0);
    let counter = 0;

    const timer = setInterval(() => {
      counter = counter + 1;
      bar.update(counter);
      if (counter === seconds) {
        clearInterval(timer);
        bar.stop();
        resolve();
      }
    }, 1000);
  });
};

export async function loadKeys() {
  const file = await fs.readFile(KEYS_FILENAME, { encoding: "utf8" });

  return file.split("\n").filter(Boolean).map((item) => item.trim());
}

export function getTxLink(network: Network, txHash: string) {
  const url = TX_SCAN[network];
  return `${url}${txHash}`;
}

export async function getUSDTQuotes() {
  const native = [
    Native.AVAX,
    Native.BNB,
    Native.ETH,
    Native.FTM,
    Native.MATIC,
  ];

  const result = new Map<Native, number>();

  for (let item of native) {
    const response = await fetch(
      `https://min-api.cryptocompare.com/data/price?fsym=${item}&tsyms=USDT`,
    );
    const json = await response.json();
    result.set(item, json.USDT);
  }

  return result;
}

async function getBaseGas() {
  const provider = providers.get(Network.ETHEREUM);
  const { gasPrice } = await provider.getFeeData();
  return formatUnits(gasPrice, "gwei");
}

export async function waitGas(network: Network) {
  if ([Network.BSC, Network.AVALANCHE, Network.FANTOM].includes(network)) {
    return;
  }

  while (true) {
    const gas = parseInt(await getBaseGas());

    cli.spinner(`L1 gas : ${gas}`, true);

    if (gas > MAX_GAS_GWEI) {
      cli.spinner(
        `Gas price is higher than ${MAX_GAS_GWEI} GWEI, waiting 1 minute`,
      );
      await delay(60);
    } else {
      break;
    }
  }
}
