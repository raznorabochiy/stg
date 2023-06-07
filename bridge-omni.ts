import cli from "cli";
import {
  Contract,
  formatUnits,
  JsonRpcProvider,
  solidityPacked,
  Wallet,
} from "ethers";
import {
  DST_CHAIN_ID,
  ENDPOINT_ABI,
  ENDPOINT_ADDRESS,
  ERC20_OMNI_ABI,
  RPC_URL,
  TOKEN_ADDRESS,
} from "./constants";
import { Network, Token } from "./types";
import { getTxLink } from "./utils";

export async function bridgeOmni(
  key: string,
  token: Token,
  fromNetwork: Network,
  toNetwork: Network,
) {
  if (fromNetwork === toNetwork) {
    throw new Error("Same network");
  }

  const rpcUrl = RPC_URL[fromNetwork];
  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(key, provider);
  const dstChainId = DST_CHAIN_ID[toNetwork];
  const endpointAddress = ENDPOINT_ADDRESS[fromNetwork];
  const endpointContract = new Contract(endpointAddress, ENDPOINT_ABI, wallet);
  const tokenAddress = TOKEN_ADDRESS[token][fromNetwork];
  const tokenContract = new Contract(tokenAddress, ERC20_OMNI_ABI, wallet);
  const { address } = wallet;

  const balance = await tokenContract.balanceOf(address);

  if (balance === 0n) {
    throw new Error(`No balance: ${address}, ${key}`);
  }

  const decimals = await tokenContract.decimals();
  const symbol = await tokenContract.symbol();
  const amount = balance;
  const payload =
    "0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000001000000000000000000000000";
  const adapterParams = solidityPacked(
    ["uint16", "uint256"],
    [1, 85_000n],
  );

  const fees = await endpointContract.estimateFees(
    dstChainId,
    tokenAddress,
    payload,
    false,
    adapterParams,
  );

  const [value] = fees;

  const txArgs = [
    dstChainId,
    address,
    amount,
    "0x0000000000000000000000000000000000000000",
    adapterParams,
  ];

  let gasLimit = 2_000_000n;

  // Почему-то в Avalanche иногда выдаёт ошибку вызов estimateGas
  try {
    gasLimit = await tokenContract.sendTokens.estimateGas(...txArgs, {
      value,
    });
  } catch (e) {
    console.log("Can't estimate gas");
  }

  const unsignedTx = await tokenContract.sendTokens.populateTransaction(
    ...txArgs,
    { value },
  );

  const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await provider
    .getFeeData();

  console.log(
    `Bridge ${
      formatUnits(balance, decimals)
    } ${symbol} ${fromNetwork} -> ${toNetwork}`,
  );

  if (
    [Network.POLYGON, Network.FANTOM].includes(fromNetwork)
  ) {
    unsignedTx.gasPrice = gasPrice;
  } else {
    unsignedTx.maxFeePerGas = maxFeePerGas;
    unsignedTx.maxPriorityFeePerGas = maxPriorityFeePerGas;
  }

  cli.spinner("Send transaction");
  const tx = await wallet.sendTransaction({
    ...unsignedTx,
    gasLimit,
  });

  await provider.waitForTransaction(tx.hash);

  cli.spinner(getTxLink(fromNetwork, tx.hash), true);
  console.log(`https://layerzeroscan.com/tx/${tx.hash}`);
}
