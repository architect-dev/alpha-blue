import fs from 'fs'

import { Abi, Address, Chain, createClient, createPublicClient, createWalletClient, http, publicActions } from 'viem'
import {
	celo,
	celoAlfajores,
	foundry,
	mainnet,
	scroll,
	scrollSepolia,
	goerli,
	sepolia,
	optimism,
	optimismGoerli,
	optimismSepolia,
	arbitrum,
	arbitrumGoerli,
	arbitrumSepolia,
	polygon,
	polygonMumbai,
	polygonAmoy,
	astar,
	polygonZkEvm,
	polygonZkEvmTestnet,
	base,
	baseGoerli,
	baseSepolia,
	gnosisChiado,
} from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { GenericContractsDeclaration } from './contract'
import { PRIVATE_KEY } from './secrets'

const chains = [
	arbitrum as Chain,
	arbitrumSepolia as Chain,
	celo as Chain,
	celoAlfajores as Chain,
	base as Chain,
	baseSepolia as Chain,
	mainnet as Chain,
	polygon as Chain,
	polygonZkEvm as Chain,
	polygonZkEvmTestnet as Chain,
	polygonAmoy as Chain,
	scroll as Chain,
	scrollSepolia as Chain,
	sepolia as Chain,
	foundry as Chain,
	goerli as Chain,
	sepolia as Chain,
	optimism as Chain,
	optimismGoerli as Chain,
	optimismSepolia as Chain,
	arbitrum as Chain,
	arbitrumGoerli as Chain,
	arbitrumSepolia as Chain,
	polygon as Chain,
	polygonMumbai as Chain,
	polygonAmoy as Chain,
	astar as Chain,
	polygonZkEvm as Chain,
	polygonZkEvmTestnet as Chain,
	base as Chain,
	baseGoerli as Chain,
	baseSepolia as Chain,
]

const account = privateKeyToAccount(PRIVATE_KEY)

type oxString = `0x${string}`

type ChainData = {
	id: string
	chain: Chain
	valid: boolean
	alphaBlueContractAddress: oxString
	alphaBlueContractAbi: Abi
	tokens: {
		address: oxString
		valid: boolean
	}[]
}

const chainsToSync: Record<string, true> = {
	[baseSepolia.id]: true,
	[arbitrumSepolia.id]: true,
	[polygonAmoy.id]: true,
}

const tokenNames: Record<string, true> = {
	WETH: true,
	WBTC: true,
	USDC: true,
	BNB: true,
}

const sync = async () => {
	const chainData: ChainData[] = []

	const JSON_DIR = './script/'
	const deployedContracts = JSON.parse(fs.readFileSync(`${JSON_DIR}deployedContracts.json`).toString())

	Object.entries(deployedContracts as GenericContractsDeclaration).map(([chainId, chainContracts]) => {
		if (!chainsToSync[chainId]) return

		const chain = chains.find((c) => c.id.toString() === chainId)

		let alphaBlueContractAddress: oxString | null = null
		let alphaBlueContractAbi: any | null = null
		let tokens: { address: oxString; valid: boolean }[] = []

		Object.entries(chainContracts).map(([contractName, contractData]) => {
			if (contractName === 'alphaBlue') {
				alphaBlueContractAddress = contractData.address
				alphaBlueContractAbi = contractData.abi
			}
			if (tokenNames[contractName])
				tokens.push({
					address: contractData.address,
					valid: true,
				})
		})

		if (chain == null || alphaBlueContractAbi == null || alphaBlueContractAddress == null) return

		chainData.push({
			id: chainId,
			chain,
			valid: true,
			alphaBlueContractAddress,
			alphaBlueContractAbi,
			tokens,
		})
	})

	console.log({
		chainData,
	})

	for (let chainIndex = 0; chainIndex < chainData.length; chainIndex++) {
		const publicClient = createPublicClient({
			chain: chainData[chainIndex].chain,
			transport: http(),
		})
		const walletClient = createWalletClient({
			account,
			chain: chainData[chainIndex].chain,
			transport: http(),
		}).extend(publicActions)

		for (let tokenSetIndex = 0; tokenSetIndex < chainData.length; tokenSetIndex++) {
			console.log('FIRE', chainData[chainIndex].id, chainData[chainIndex].alphaBlueContractAddress, [
				chainData[tokenSetIndex].id,
				chainData[tokenSetIndex].valid,
				chainData[tokenSetIndex].alphaBlueContractAddress,
				chainData[tokenSetIndex].tokens.map((token) => token.address),
				chainData[tokenSetIndex].tokens.map((token) => token.valid),
			])
			const { request } = await publicClient.simulateContract({
				account,
				address: chainData[chainIndex].alphaBlueContractAddress,
				abi: chainData[chainIndex].alphaBlueContractAbi,
				functionName: 'setChainAndTokens',
				args: [
					chainData[tokenSetIndex].id,
					chainData[tokenSetIndex].valid,
					chainData[tokenSetIndex].alphaBlueContractAddress,
					chainData[tokenSetIndex].tokens.map((token) => token.address),
					chainData[tokenSetIndex].tokens.map((token) => token.valid),
				],
			})
			const hash = await walletClient.writeContract(request)
			const transaction = await publicClient.waitForTransactionReceipt({ hash })
			console.log({
				hash,
				transaction,
			})
		}
	}
}

sync()
