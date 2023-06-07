import { Contract } from "ethers";
import { Network, Token } from "./types";
import { ERC20_ABI, TOKEN_ADDRESS } from "./constants";
import { providers } from "./utils";

export async function getBalance(network: Network, address: string) {
  const provider = providers.get(network);
  const balance = await provider.getBalance(address);

  return balance;
}

export async function getErc20Balance(
  network: Network,
  address: string,
  token: Token,
) {
  const provider = providers.get(network);
  const target = TOKEN_ADDRESS[token][network];
  const contract = new Contract(target, ERC20_ABI, provider);
  const balance = await contract.balanceOf(address);

  return balance;
}
