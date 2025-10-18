# Toycoin Smart Contract

A simple fungible token smart contract built with Clarinet for the Stacks blockchain. Toycoin implements the SIP-010 fungible token standard, providing all the essential functionality for a token including minting, burning, and transfers.

## Features

- **SIP-010 Compliant**: Fully implements the Stacks Improvement Proposal 010 fungible token standard
- **Secure Transfers**: Safe token transfers with proper validation
- **Administrative Controls**: Owner-only functions for minting and metadata updates
- **Token Burning**: Ability to burn tokens to reduce supply
- **Balance Queries**: Easy balance checking for any principal
- **Metadata Management**: Configurable token name and symbol

## Token Details

- **Name**: Toycoin
- **Symbol**: TOY
- **Decimals**: 6
- **Initial Supply**: 1,000,000 TOY (allocated to contract deployer)

## Smart Contract Functions

### SIP-010 Standard Functions

#### `transfer(amount, from, to, memo)`
Transfers tokens between principals.
- `amount`: Number of tokens to transfer (uint)
- `from`: Sender's principal
- `to`: Recipient's principal  
- `memo`: Optional transaction memo (buff 34)

#### `get-name()`
Returns the token name ("Toycoin").

#### `get-symbol()`
Returns the token symbol ("TOY").

#### `get-decimals()`
Returns the number of decimals (6).

#### `get-balance(who)`
Returns the token balance for a given principal.

#### `get-total-supply()`
Returns the total token supply.

#### `get-token-uri()`
Returns the token URI (currently returns none).

### Administrative Functions

#### `mint(amount, to)` (Owner Only)
Mints new tokens to a specified principal.
- Only callable by contract owner
- Updates total supply

#### `burn(amount, from)`
Burns tokens from a principal's balance.
- Can be called by token owner or contract owner
- Reduces total supply

#### `set-token-name(new-name)` (Owner Only)
Updates the token name.

#### `set-token-symbol(new-symbol)` (Owner Only)
Updates the token symbol.

### Utility Functions

#### `send(amount, to, memo)`
Convenience function to send tokens from the caller to another principal.

#### `get-contract-info()`
Returns comprehensive contract information including name, symbol, decimals, total supply, and contract owner.

## Error Codes

- `u100`: Owner only operation
- `u101`: Not token owner
- `u102`: Insufficient balance
- `u103`: Invalid amount (must be greater than 0)

## Development Setup

### Prerequisites

1. Install [Clarinet](https://docs.hiro.so/clarinet)
2. Install [Node.js](https://nodejs.org/) (for testing)

### Getting Started

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd toycoin-contract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Check contract syntax:
   ```bash
   clarinet check
   ```

4. Run tests:
   ```bash
   npm test
   ```

### Project Structure

```
toycoin-contract/
├── contracts/
│   └── toycoin.clar          # Main token contract
├── tests/
│   └── toycoin.test.ts       # TypeScript test files
├── settings/
│   ├── Devnet.toml           # Development network settings
│   ├── Testnet.toml          # Testnet settings
│   └── Mainnet.toml          # Mainnet settings
├── Clarinet.toml             # Project configuration
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## Testing

The contract includes comprehensive tests covering:

- Token minting and initial supply
- Transfer functionality
- Balance queries
- Administrative functions
- Error conditions

Run the test suite:
```bash
npm test
```

## Deployment

### Local Development

1. Start the Clarinet console:
   ```bash
   clarinet console
   ```

2. Deploy and interact with the contract in the REPL.

### Testnet Deployment

1. Configure your testnet settings in `settings/Testnet.toml`
2. Deploy using Clarinet:
   ```bash
   clarinet deployments apply --devnet
   ```

### Mainnet Deployment

1. Configure your mainnet settings in `settings/Mainnet.toml`
2. Deploy using Clarinet:
   ```bash
   clarinet deployments apply --mainnet
   ```

## Usage Examples

### Checking Token Balance

```clarity
;; Check balance of a principal
(contract-call? .toycoin get-balance 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
```

### Transferring Tokens

```clarity
;; Transfer 100 TOY tokens
(contract-call? .toycoin transfer u100000 tx-sender 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7 none)
```

### Minting Tokens (Owner Only)

```clarity
;; Mint 500 TOY tokens
(contract-call? .toycoin mint u500000 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7)
```

## Security Considerations

- Contract owner has privileged access to mint tokens and update metadata
- All transfers are validated for sufficient balance and valid amounts
- The contract follows Clarity best practices for error handling
- Consider implementing additional access controls for production use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Resources

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language Guide](https://docs.stacks.co/clarity/)
- [SIP-010 Fungible Token Standard](https://github.com/stacksgov/sips/blob/main/sips/sip-010/sip-010-fungible-token-standard.md)
- [Clarinet Documentation](https://docs.hiro.so/clarinet/)