# Toybit (Clarinet)

A simple fungible token on Stacks, built with Clarinet. The contract lives at `contracts/toybit.clar` and exposes a SIP-010-like interface: `get-name`, `get-symbol`, `get-decimals`, `get-total-supply`, `get-balance-of`, `transfer`, `mint`, `burn`, plus `initialize` and `set-admin`.

## Prerequisites
- Clarinet CLI: https://docs.hiro.so/clarinet

## Quick start
- Check the project:
  ```bash
  clarinet check
  ```
- Open a REPL and try it out:
  ```bash
  clarinet console
  ```
  In the console:
  ```
  :: (contract-call? .toybit get-name)
  :: (contract-call? .toybit initialize tx-sender)  ; one-time admin setup
  :: (contract-call? .toybit mint u1000 tx-sender none)
  :: (contract-call? .toybit get-balance-of tx-sender)
  :: (contract-call? .toybit transfer u250 tx-sender 'ST3J2GVMMM2R07ZFBJDWTYEYAR8FZH5WKDTFJ9AHA none)
  ```

Notes:
- `initialize` must be called once to set the admin; thereafter only the admin can `mint` and `burn`.
- Decimals are `u6`; a balance of `u1000000` equals 1.000000 TOY.

## Files
- `Clarinet.toml` – Clarinet project config
- `contracts/toybit.clar` – token contract
