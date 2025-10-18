;; Toycoin - A Simple Fungible Token Smart Contract
;; Implements SIP-010 Fungible Token Standard

;; Define the token
(define-fungible-token toycoin)

;; Define constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))
(define-constant err-insufficient-balance (err u102))
(define-constant err-invalid-amount (err u103))

;; Define data variables
(define-data-var token-name (string-ascii 32) "Toycoin")
(define-data-var token-symbol (string-ascii 10) "TOY")
(define-data-var token-decimals uint u6)
(define-data-var total-supply uint u0)

;; SIP-010 Standard Functions

;; Transfer function
(define-public (transfer (amount uint) (from principal) (to principal) (memo (optional (buff 34))))
  (begin
    (asserts! (or (is-eq from tx-sender) (is-eq from contract-caller)) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (ft-transfer? toycoin amount from to)
  )
)

;; Get token name
(define-read-only (get-name)
  (ok (var-get token-name))
)

;; Get token symbol  
(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

;; Get token decimals
(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

;; Get balance of a principal
(define-read-only (get-balance (who principal))
  (ok (ft-get-balance toycoin who))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

;; Get token URI (optional)
(define-read-only (get-token-uri)
  (ok none)
)

;; Administrative Functions

;; Mint new tokens (only contract owner)
(define-public (mint (amount uint) (to principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-mint? toycoin amount to))
    (var-set total-supply (+ (var-get total-supply) amount))
    (print {action: "mint", amount: amount, to: to})
    (ok true)
  )
)

;; Burn tokens
(define-public (burn (amount uint) (from principal))
  (begin
    (asserts! (or (is-eq from tx-sender) (is-eq tx-sender contract-owner)) err-not-token-owner)
    (asserts! (> amount u0) err-invalid-amount)
    (try! (ft-burn? toycoin amount from))
    (var-set total-supply (- (var-get total-supply) amount))
    (print {action: "burn", amount: amount, from: from})
    (ok true)
  )
)

;; Update token metadata (only owner)
(define-public (set-token-name (new-name (string-ascii 32)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set token-name new-name)
    (ok true)
  )
)

(define-public (set-token-symbol (new-symbol (string-ascii 10)))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set token-symbol new-symbol)
    (ok true)
  )
)

;; Utility Functions

;; Send tokens (wrapper around transfer)
(define-public (send (amount uint) (to principal) (memo (optional (buff 34))))
  (transfer amount tx-sender to memo)
)

;; Get contract info
(define-read-only (get-contract-info)
  {
    name: (var-get token-name),
    symbol: (var-get token-symbol),
    decimals: (var-get token-decimals),
    total-supply: (var-get total-supply),
    contract-owner: contract-owner
  }
)

;; Initialize with initial supply for contract owner
(define-private (initialize)
  (begin
    (try! (ft-mint? toycoin u1000000 contract-owner))
    (var-set total-supply u1000000)
    (ok true)
  )
)

;; Initialize the contract
(initialize)

