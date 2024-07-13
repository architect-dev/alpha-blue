import { ethers } from "ethers";

export const generateWalletAddress = () =>
    ethers.Wallet.createRandom().address.toLowerCase();
