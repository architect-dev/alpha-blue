// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20Burnable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import { ERC20Pausable } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract BasicERC20 is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, Ownable {
	constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) ERC20Permit(name) {}

	function pause() external onlyOwner {
		_pause();
	}

	function unpause() external onlyOwner {
		_unpause();
	}

	function mint(address to, uint256 amount) external onlyOwner {
		_mint(to, amount);
	}

	function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
		super._update(from, to, value);
	}
}

contract BasicERC20WithDecimals is ERC20, ERC20Burnable, ERC20Pausable, ERC20Permit, Ownable {
	uint8 dec = 18;
	constructor(
		string memory name,
		string memory symbol,
		uint8 _decimals
	) ERC20(name, symbol) Ownable(msg.sender) ERC20Permit(name) {
		dec = _decimals;
	}

	function decimals() public view override returns (uint8) {
		return dec;
	}

	function pause() external onlyOwner {
		_pause();
	}

	function unpause() external onlyOwner {
		_unpause();
	}

	function mint(address to, uint256 amount) external onlyOwner {
		_mint(to, amount);
	}

	function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) {
		super._update(from, to, value);
	}
}
