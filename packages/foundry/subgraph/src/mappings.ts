/* eslint-disable @typescript-eslint/ban-types */
import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Offer, OfferFill, Fill } from '../generated/schema'
import {
	OfferCreated as OfferCreatedEvent,
	OfferCancelled as OfferCancelledEvent,
	OfferDeadlined as OfferDeadlinedEvent,
	OfferFilled as OfferFilledEvent,
	FillFailed as FillFailedEvent,
	FillXFilled as FillXFilledEvent,
	FillDeadlined as FillDeadlinedEvent,
} from '../generated/Auctioneer/Auctioneer'

// ENTITIES

function getOffer(offerId: BigInt): Offer {
	let offerEntity = Offer.load(offerId.toString())

	if (offerEntity == null) {
		offerEntity = new Offer(offerId.toString())
	}

	return offerEntity
}

function getFill(fillId: BigInt): Fill {
	let fillEntity = Fill.load(fillId.toString())

	if (fillEntity == null) {
		fillEntity = new Fill(fillId.toString())
	}

	return fillEntity
}

function getOfferFill(offerFillId: BigInt): OfferFill {
	let offerFillEntity = OfferFill.load(offerFillId.toString())

	if (offerFillEntity == null) {
		offerFillEntity = new OfferFill(offerFillId.toString())
	}

	return offerFillEntity
}

export function handleOfferCreated(event: OfferCreatedEvent): void {}

// AUCTIONS

export function handleAuctionCreated(event: AuctionCreatedEvent): void {
	const lot = event.params._lot.toString()

	// Entity
	const auctionEntity = new Auction(lot)
	auctionEntity.lot = event.params._lot
	auctionEntity.eventIndex = 0
	auctionEntity.save()

	// Create info message
	const auctionCreatedEventEntity = new AuctionEvent(lot.concat('_').concat(auctionEntity.eventIndex.toString()))
	auctionCreatedEventEntity.type = 'State'
	auctionCreatedEventEntity.auction = auctionEntity.id
	auctionCreatedEventEntity.index = 0
	auctionCreatedEventEntity.message = 'CREATED'
	auctionCreatedEventEntity.timestamp = event.block.timestamp
	auctionCreatedEventEntity.save()
}

export function handleAuctionCancelled(event: AuctionCancelledEvent): void {
	const lot = event.params._lot.toString()

	const auctionEntity = Auction.load(lot)!
	auctionEntity.eventIndex += 1
	auctionEntity.save()

	const cancelledEventEntity = new AuctionEvent(lot.concat('_').concat(auctionEntity.eventIndex.toString()))
	cancelledEventEntity.type = 'State'
	cancelledEventEntity.index = auctionEntity.eventIndex
	cancelledEventEntity.auction = auctionEntity.id
	cancelledEventEntity.message = 'CANCELLED'
	cancelledEventEntity.timestamp = event.block.timestamp
	cancelledEventEntity.save()
}

// USER

export function handleUpdatedAlias(event: UpdatedAliasEvent): void {
	const userEntity = getUserEntity(event.params._user)
	if (userEntity.muted) return

	userEntity.alias = event.params._alias
	userEntity.save()
}

export function handleMutedUser(event: MutedUserEvent): void {
	const userEntity = getUserEntity(event.params._user)
	userEntity.muted = event.params._muted
	if (userEntity.muted) {
		userEntity.alias = ''
	}
	userEntity.save()
}

// ACTIONS

export function handleBid(event: BidEvent): void {
	const lot = event.params._lot.toString()
	const user = event.params._user

	const auctionEntity = Auction.load(lot)!
	auctionEntity.eventIndex += 1
	auctionEntity.save()

	const userEntity = getUserEntity(user)
	const participantEntity = getAuctionParticipantEntity(lot, user)

	// User Stats
	const isFirstBid = !participantEntity.hasBid

	userEntity.totalBidsCount = userEntity.totalBidsCount.plus(event.params._bidCount)
	if (isFirstBid) {
		const interactedAuctions = userEntity.interactedAuctions
		interactedAuctions.push(lot)
		userEntity.interactedAuctions = interactedAuctions

		userEntity.totalAuctionsParticipated += 1
	}

	userEntity.save()

	participantEntity.hasBid = true
	participantEntity.lastBidTimestamp = event.params._timestamp
	participantEntity.rune = event.params._rune
	participantEntity.muted = userEntity.muted
	participantEntity.alias = event.params._alias
	participantEntity.save()

	// Stats
	const switchedRunes = event.params._prevRune !== 0 && event.params._rune !== event.params._prevRune
	const message = userEntity.muted ? '' : event.params._message
	updateStats(event.params._bidCount, switchedRunes, message)

	const bidEventEntity = new AuctionEvent(lot.toString().concat('_').concat(auctionEntity.eventIndex.toString()))
	bidEventEntity.type = 'Bid'
	bidEventEntity.index = auctionEntity.eventIndex
	bidEventEntity.auction = auctionEntity.id
	bidEventEntity.user = user
	bidEventEntity.alias = userEntity.muted ? '' : userEntity.alias
	bidEventEntity.prevRune = event.params._prevRune
	bidEventEntity.rune = event.params._rune
	bidEventEntity.message = message
	bidEventEntity.bid = event.params._bid
	bidEventEntity.bidCount = event.params._bidCount
	bidEventEntity.timestamp = event.block.timestamp
	bidEventEntity.save()
}

export function handleSelectedRune(event: SelectedRuneEvent): void {
	const lot = event.params._lot.toString()
	const user = event.params._user

	const userEntity = getUserEntity(user)

	const participantEntity = getAuctionParticipantEntity(lot, user)
	participantEntity.alias = event.params._alias
	participantEntity.rune = event.params._rune
	participantEntity.muted = userEntity.muted
	participantEntity.save()

	// Stats
	const switchedRunes = event.params._prevRune !== 0 && event.params._rune !== event.params._prevRune
	const message = userEntity.muted ? '' : event.params._message
	updateStats(BigInt.zero(), switchedRunes, message)

	const auctionEntity = Auction.load(lot)!
	auctionEntity.eventIndex += 1
	auctionEntity.save()

	const selectedRuneEventEntity = new AuctionEvent(lot.toString().concat('_').concat(auctionEntity.eventIndex.toString()))
	selectedRuneEventEntity.type = 'SelectedRune'
	selectedRuneEventEntity.index = auctionEntity.eventIndex
	selectedRuneEventEntity.auction = auctionEntity.id
	selectedRuneEventEntity.user = user
	selectedRuneEventEntity.alias = userEntity.muted ? '' : userEntity.alias
	selectedRuneEventEntity.prevRune = event.params._prevRune
	selectedRuneEventEntity.rune = event.params._rune
	selectedRuneEventEntity.message = message
	selectedRuneEventEntity.save()
}

export function handleClaim(event: ClaimedEvent): void {
	const lot = event.params._lot.toString()
	const user = event.params._user

	// User Stats
	const userEntity = getUserEntity(user)
	userEntity.totalAuctionsWon = userEntity.totalAuctionsWon.plus(BigInt.fromI32(1))
	userEntity.save()

	// Stats
	const message = userEntity.muted ? '' : event.params._message
	updateStats(BigInt.zero(), false, message)

	const participantEntity = getAuctionParticipantEntity(lot, user)
	participantEntity.alias = event.params._alias
	participantEntity.muted = userEntity.muted
	participantEntity.save()

	const auctionEntity = Auction.load(lot)!
	auctionEntity.eventIndex += 1
	auctionEntity.save()

	// Create bid message entity
	const claimedEventEntity = new AuctionEvent(lot.concat('_').concat(auctionEntity.eventIndex.toString()))
	claimedEventEntity.type = 'Claimed'
	claimedEventEntity.index = auctionEntity.eventIndex
	claimedEventEntity.auction = auctionEntity.id
	claimedEventEntity.user = user
	claimedEventEntity.alias = userEntity.muted ? '' : userEntity.alias
	claimedEventEntity.rune = participantEntity.rune
	claimedEventEntity.message = userEntity.muted ? '' : event.params._message
	claimedEventEntity.save()
}

export function handleMessaged(event: MessagedEvent): void {
	const lot = event.params._lot.toString()
	const user = event.params._user

	const auctionEntity = Auction.load(lot)!
	if (auctionEntity == null) return

	auctionEntity.eventIndex = auctionEntity.eventIndex + 1
	auctionEntity.save()

	const userEntity = getUserEntity(user)
	const participantEntity = getAuctionParticipantEntity(lot, user)
	participantEntity.alias = event.params._alias
	participantEntity.muted = userEntity.muted
	participantEntity.save()

	// Stats
	const message = userEntity.muted ? '' : event.params._message
	updateStats(BigInt.zero(), false, message)

	// Event
	const messageEntity = new AuctionEvent(lot.toString().concat('_').concat(auctionEntity.eventIndex.toString()))
	messageEntity.type = 'Messaged'
	messageEntity.index = auctionEntity.eventIndex
	messageEntity.auction = auctionEntity.id
	messageEntity.user = user
	messageEntity.alias = userEntity.muted ? '' : userEntity.alias
	messageEntity.rune = participantEntity.rune
	messageEntity.message = userEntity.muted ? '' : event.params._message
	messageEntity.timestamp = event.block.timestamp
	messageEntity.save()
}
