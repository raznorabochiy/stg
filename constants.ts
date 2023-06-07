import { Native, Network, Token } from "./types";

export const KEYS_FILENAME = "keys.txt";

export const MIN_NATIVE_IN_DOLLARS = 2;

export const DELAY_FROM_SEC = 300;
export const DELAY_TO_SEC = 600;

export const MAX_GAS_GWEI = 40;

export const RPC_URL = {
  [Network.ARBITRUM]: "https://arb1.arbitrum.io/rpc",
  [Network.AVALANCHE]: "https://avalanche.blockpi.network/v1/rpc/public",
  [Network.BSC]: "https://bsc.publicnode.com",
  [Network.ETHEREUM]: "https://eth.llamarpc.com",
  [Network.FANTOM]: "https://rpc.ftm.tools",
  [Network.OPTIMISM]: "https://endpoints.omniatech.io/v1/op/mainnet/public",
  [Network.POLYGON]: "https://polygon-bor.publicnode.com",
};

export const TOKEN_ADDRESS = {
  [Token.STG]: {
    [Network.ARBITRUM]: "0x6694340fc020c5e6b96567843da2df01b2ce1eb6",
    [Network.AVALANCHE]: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
    [Network.BSC]: "0xB0D502E938ed5f4df2E681fE6E419ff29631d62b",
    [Network.FANTOM]: "0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590",
    [Network.OPTIMISM]: "0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97",
    [Network.POLYGON]: "0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590",
  },
};

export const ENDPOINT_ADDRESS = {
  [Network.ARBITRUM]: "0x3c2269811836af69497e5f486a85d7316753cf62",
  [Network.AVALANCHE]: "0x3c2269811836af69497e5f486a85d7316753cf62",
  [Network.BSC]: "0x3c2269811836af69497e5f486a85d7316753cf62",
  [Network.FANTOM]: "0xb6319cc6c8c27a8f5daf0dd3df91ea35c4720dd7",
  [Network.OPTIMISM]: "0x3c2269811836af69497e5f486a85d7316753cf62",
  [Network.POLYGON]: "0x3c2269811836af69497e5f486a85d7316753cf62",
};

export const ENDPOINT_ABI = [
  "function estimateFees(uint16 _dstChainId, address _userApplication, bytes _payload, bool _payInZRO, bytes _adapterParams) view returns (uint256 nativeFee, uint256 zroFee)",
];

export const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function symbol() view returns (string)",
];

export const ERC20_OMNI_ABI = [
  ...ERC20_ABI,
  "function sendTokens(uint16 _dstChainId, bytes _to, uint256 _qty, address zroPaymentAddress, bytes adapterParam) payable",
];

export const DST_CHAIN_ID = {
  [Network.ARBITRUM]: 110,
  [Network.AVALANCHE]: 106,
  [Network.BSC]: 102,
  [Network.FANTOM]: 112,
  [Network.OPTIMISM]: 111,
  [Network.POLYGON]: 109,
};

export const TX_SCAN = {
  [Network.ARBITRUM]: "https://arbiscan.io/tx/",
  [Network.AVALANCHE]: "https://snowtrace.io/tx/",
  [Network.BSC]: "https://bscscan.com/tx/",
  [Network.FANTOM]: "https://ftmscan.com/tx/",
  [Network.OPTIMISM]: "https://optimistic.etherscan.io/tx/",
  [Network.POLYGON]: "https://polygonscan.com/tx/",
};

export const NATIVE_TOKENS = {
  [Network.ARBITRUM]: Native.ETH,
  [Network.AVALANCHE]: Native.AVAX,
  [Network.BSC]: Native.BNB,
  [Network.FANTOM]: Native.FTM,
  [Network.OPTIMISM]: Native.ETH,
  [Network.POLYGON]: Native.MATIC,
};
