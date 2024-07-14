import {
    BaseEventModel,
    FillCreatedEvent,
    FillDeadlinedEvent,
    FillFailedEvent,
    FillXFilledEvent,
    OfferCancelledEvent,
    OfferDeadlinedEvent,
    OfferFilledEvent,
    OrderCreatedEvent,
} from "src/core/models/chain-event-models";

export const eventToModelType: Record<string, typeof BaseEventModel> = {};

export const OfferCreated_EVENT_NAME = "OfferCreated";
export const OfferFilled_EVENT_NAME = "OfferFilled";
export const OfferCancelled_EVENT_NAME = "OfferCancelled";
export const OfferDeadlined_EVENT_NAME = "OfferDeadlined";

export const FillDeadlined_EVENT_NAME = "FillDeadlined";
export const FillFailed_EVENT_NAME = "FillFailed";
export const FillXFilled_EVENT_NAME = "FillXFilled";
export const FillCreated_EVENT_NAME = "FillCreated";

eventToModelType[OfferCreated_EVENT_NAME] = OrderCreatedEvent;
eventToModelType[OfferFilled_EVENT_NAME] = OfferFilledEvent;
eventToModelType[OfferCancelled_EVENT_NAME] = OfferCancelledEvent;
eventToModelType[OfferDeadlined_EVENT_NAME] = OfferDeadlinedEvent;

eventToModelType[FillDeadlined_EVENT_NAME] = FillDeadlinedEvent;
eventToModelType[FillFailed_EVENT_NAME] = FillFailedEvent;
eventToModelType[FillXFilled_EVENT_NAME] = FillXFilledEvent;
eventToModelType[FillCreated_EVENT_NAME] = FillCreatedEvent;
