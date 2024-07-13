/* eslint-disable @typescript-eslint/ban-types */
import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Offer, OfferFill, Fill } from '../generated/schema'
import {
	OfferCreated as OfferCreatedEvent,
	OfferCancelled as OfferCancelledEvent,
	OfferDeadlined as OfferDeadlinedEvent,
	OfferFilled as OfferFilledEvent,
	FillCreated as FillCreatedEvent,
	FillFailed as FillFailedEvent,
	FillXFilled as FillXFilledEvent,
	FillDeadlined as FillDeadlinedEvent,
} from '../generated/AlphaBlue/AlphaBlue'
import { AlphaBlue } from '../generated/AlphaBlue/AlphaBlue'

// ENTITIES

function getOffer(offerChain: BigInt, offerId: BigInt): Offer {
	const id = offerChain.toString().concat('_').concat(offerId.toString())

	let offerEntity = Offer.load(id)

	if (offerEntity == null) {
		offerEntity = new Offer(id)
	}

	return offerEntity
}

function getFill(fillChain: BigInt, fillId: BigInt): Fill {
	const id = fillChain.toString().concat('_').concat(fillId.toString())
	let fillEntity = Fill.load(id)

	if (fillEntity == null) {
		fillEntity = new Fill(id)
	}

	return fillEntity
}

function getOfferFill(offerChain: BigInt, offerId: BigInt, fillChain: BigInt, fillId: BigInt): OfferFill {
	const id = offerChain.toString().concat('_').concat(offerId.toString()).concat(fillChain.toString()).concat('_').concat(fillId.toString())

	let offerFillEntity = OfferFill.load(id)

	if (offerFillEntity == null) {
		offerFillEntity = new OfferFill(id)
	}

	return offerFillEntity
}

export function handleOfferCreated(event: OfferCreatedEvent): void {
	let alphaBlue = AlphaBlue.bind(event.address)
	const createdOffer = alphaBlue.getOffer(event.params.offerId)

	let offerEntity = getOffer(event.params.chainId, event.params.offerId)

	offerEntity.owner = createdOffer.owner
	offerEntity.tokenAddress = createdOffer.tokenAddress
	offerEntity.tokenAmount = createdOffer.tokenAmount
	offerEntity.nftAddress = createdOffer.nftAddress
	offerEntity.nftId = createdOffer.nftId
	offerEntity.allowPartialFills = createdOffer.allowPartialFills
	offerEntity.created = createdOffer.created
	offerEntity.expiration = createdOffer.expiration
	// offerEntity.fillOptions = createdOffer.fillOptions
	offerEntity.depositTokenAddress = createdOffer.depositTokenAddress
	offerEntity.depositAmount = createdOffer.depositAmount
	offerEntity.filledBP = createdOffer.filledBP
	offerEntity.pendingBP = createdOffer.pendingBP
	offerEntity.status = createdOffer.status
	offerEntity.offerFills = []

	offerEntity.save()
}

export function handleOfferCancelled(event: OfferCancelledEvent): void {
	let offerEntity = getOffer(event.params.chainId, event.params.offerId)

	offerEntity.status = 2

	offerEntity.save()
}

export function handleOfferDeadlined(event: OfferDeadlinedEvent): void {
	let offerEntity = getOffer(event.params.chainId, event.params.offerId)

	offerEntity.status = 1

	offerEntity.save()
}

export function handleOfferFilled(event: OfferFilledEvent): void {
	let offerEntity = getOffer(event.params.chainId, event.params.offerId)

	let alphaBlue = AlphaBlue.bind(event.address)
	const updatedOffer = alphaBlue.getOffer(event.params.offerId)

	offerEntity.pendingBP = updatedOffer.pendingBP
	offerEntity.filledBP = updatedOffer.filledBP
	offerEntity.status = updatedOffer.status
	offerEntity.status = updatedOffer.status

	offerEntity.save()

	// TODO: figure this out
	let offerFillEntity = getOfferFill(event.params.chainId, event.params.offerId, BigInt.fromI32(0), BigInt.fromI32(0))

	offerFillEntity.pending = false

	offerFillEntity.save()
}

export function handleFillCreated(event: FillCreatedEvent): void {
	let fillEntity = getFill(event.params.chainId, event.params.fillId)

	let alphaBlue = AlphaBlue.bind(event.address)
	const createdFill = alphaBlue.getFill(event.params.fillId)

	fillEntity.owner = createdFill.owner
	fillEntity.offerChain = createdFill.offerChain
	fillEntity.offerId = createdFill.offerId
	fillEntity.fillTokenAddress = createdFill.fillTokenAddress
	fillEntity.fillTokenAmount = createdFill.fillTokenAmount
	fillEntity.deadline = createdFill.deadline
	fillEntity.partialBP = createdFill.partialBP
	fillEntity.status = createdFill.status
	fillEntity.errorType = createdFill.errorType

	fillEntity.save()

	let offerFillEntity = getOfferFill(event.params.chainId, event.params.fillId, createdFill.offerChain, createdFill.offerId)

	offerFillEntity.fillId = event.params.fillId
	offerFillEntity.fillChain = event.params.chainId
	offerFillEntity.fillTokenAddress = createdFill.fillTokenAddress
	offerFillEntity.fillTokenAmount = createdFill.fillTokenAmount
	offerFillEntity.partialBP = createdFill.partialBP
	offerFillEntity.deadline = createdFill.deadline
	offerFillEntity.adaDestAddress = createdFill.adaDestAddress
	offerFillEntity.bobDestAddress = Address.zero()
	offerFillEntity.pending = true

	offerFillEntity.save()
}

export function handleFillFailed(event: FillFailedEvent): void {
	let fillEntity = getFill(event.params.chainId, event.params.fillId)

	let alphaBlue = AlphaBlue.bind(event.address)
	const updatedFill = alphaBlue.getFill(event.params.fillId)

	fillEntity.status = updatedFill.status
	fillEntity.errorType = updatedFill.errorType

	fillEntity.save()
}

export function handleFillXFilled(event: FillXFilledEvent): void {
	let fillEntity = getFill(event.params.chainId, event.params.fillId)

	fillEntity.status = 2

	fillEntity.save()
}

export function handleFillDeadlined(event: FillDeadlinedEvent): void {
	let fillEntity = getFill(event.params.chainId, event.params.fillId)

	fillEntity.status = 3

	fillEntity.save()
}
