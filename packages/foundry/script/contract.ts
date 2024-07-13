import {
	Abi,
	AbiParameter,
	AbiParameterToPrimitiveType,
	AbiParametersToPrimitiveTypes,
	ExtractAbiEvent,
	ExtractAbiEventNames,
	ExtractAbiFunction,
} from 'abitype'
import type { ExtractAbiFunctionNames } from 'abitype'
import { Address, Block, GetEventArgs, GetTransactionReceiptReturnType, GetTransactionReturnType, Log, TransactionReceipt, WriteContractErrorType } from 'viem'

export type InheritedFunctions = { readonly [key: string]: string }

export type GenericContract = {
	address: Address
	abi: Abi
	inheritedFunctions?: InheritedFunctions
	external?: true
}

export type GenericContractsDeclaration = {
	[chainId: number]: {
		[contractName: string]: GenericContract
	}
}
