//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface AlphaBlueEvents {
    // EVENTS
    event OfferCreated(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event OfferCancelled(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event OfferDeadlined(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event OfferFilled(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event FillFailed(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );
    event FillXFilled(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );
    event FillDeadlined(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );
    event FillCreated(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );
}
