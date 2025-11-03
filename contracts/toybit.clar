;; Toybit fungible token (simple SIP-010-like interface)

(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-ALREADY-INITIALIZED u101)
(define-constant ERR-NOT-INITIALIZED u102)
(define-constant ERR-INSUFFICIENT-BALANCE u103)

(define-constant TOKEN-NAME "Toybit")
(define-constant TOKEN-SYMBOL "TOY")
(define-constant TOKEN-DECIMALS u6)

(define-data-var admin (optional principal) none)
(define-data-var total-supply uint u0)
(define-map balances principal uint)

(define-read-only (get-name)
  (ok TOKEN-NAME))

(define-read-only (get-symbol)
  (ok TOKEN-SYMBOL))

(define-read-only (get-decimals)
  (ok TOKEN-DECIMALS))

(define-read-only (get-total-supply)
  (ok (some (var-get total-supply))))

(define-read-only (get-balance-of (who principal))
  (ok (default-to u0 (map-get? balances who))))

(define-private (only-admin)
  (let ((adm (var-get admin)))
    (if (is-some adm)
        (if (is-eq (some tx-sender) adm)
            (ok true)
            (err ERR-NOT-AUTHORIZED))
        (err ERR-NOT-INITIALIZED))))

(define-public (initialize (owner principal))
  (if (is-none (var-get admin))
      (begin
        (var-set admin (some owner))
        (ok true))
      (err ERR-ALREADY-INITIALIZED)))

(define-public (set-admin (new-owner principal))
  (begin
    (try! (only-admin))
    (var-set admin (some new-owner))
    (ok true)))

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (if (not (is-eq tx-sender sender))
      (err ERR-NOT-AUTHORIZED)
      (let (
        (sender-bal (default-to u0 (map-get? balances sender)))
      )
        (if (< sender-bal amount)
            (err ERR-INSUFFICIENT-BALANCE)
            (begin
              (map-set balances sender (- sender-bal amount))
              (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
              (ok true))))))

(define-public (mint (amount uint) (recipient principal) (memo (optional (buff 34))))
  (begin
    (try! (only-admin))
    (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
    (var-set total-supply (+ (var-get total-supply) amount))
    (ok true)))

(define-public (burn (amount uint) (holder principal) (memo (optional (buff 34))))
  (begin
    (try! (only-admin))
    (let ((bal (default-to u0 (map-get? balances holder))))
      (if (< bal amount)
          (err ERR-INSUFFICIENT-BALANCE)
          (begin
            (map-set balances holder (- bal amount))
            (var-set total-supply (- (var-get total-supply) amount))
            (ok true))))))
