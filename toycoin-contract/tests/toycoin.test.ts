import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Toycoin Smart Contract Tests", () => {
  
  describe("Contract Initialization", () => {
    it("should initialize with correct token metadata", () => {
      const name = simnet.callReadOnlyFn("toycoin", "get-name", [], deployer);
      const symbol = simnet.callReadOnlyFn("toycoin", "get-symbol", [], deployer);
      const decimals = simnet.callReadOnlyFn("toycoin", "get-decimals", [], deployer);
      const totalSupply = simnet.callReadOnlyFn("toycoin", "get-total-supply", [], deployer);
      
      expect(name.result).toBeOk("Toycoin");
      expect(symbol.result).toBeOk("TOY");
      expect(decimals.result).toBeOk(6);
      expect(totalSupply.result).toBeOk(1000000);
    });

    it("should allocate initial supply to contract deployer", () => {
      const balance = simnet.callReadOnlyFn("toycoin", "get-balance", [deployer], deployer);
      expect(balance.result).toBeOk(1000000);
    });

    it("should return correct contract info", () => {
      const contractInfo = simnet.callReadOnlyFn("toycoin", "get-contract-info", [], deployer);
      expect(contractInfo.result).toBeTuple({
        name: "Toycoin",
        symbol: "TOY",
        decimals: 6,
        "total-supply": 1000000,
        "contract-owner": deployer
      });
    });
  });

  describe("Token Transfers", () => {
    it("should allow valid transfers", () => {
      const transferAmount = 1000;
      const transfer = simnet.callPublicFn(
        "toycoin",
        "transfer",
        [transferAmount, deployer, wallet1, "none"],
        deployer
      );

      expect(transfer.result).toBeOk(true);
      
      // Check balances after transfer
      const deployerBalance = simnet.callReadOnlyFn("toycoin", "get-balance", [deployer], deployer);
      const wallet1Balance = simnet.callReadOnlyFn("toycoin", "get-balance", [wallet1], deployer);
      
      expect(deployerBalance.result).toBeOk(999000);
      expect(wallet1Balance.result).toBeOk(1000);
    });

    it("should fail when transferring more than balance", () => {
      const transferAmount = 2000000; // More than total supply
      const transfer = simnet.callPublicFn(
        "toycoin",
        "transfer",
        [transferAmount, deployer, wallet1, "none"],
        deployer
      );

      expect(transfer.result).toBeErr(1); // Insufficient balance error
    });

    it("should fail when transferring zero amount", () => {
      const transfer = simnet.callPublicFn(
        "toycoin",
        "transfer",
        [0, deployer, wallet1, "none"],
        deployer
      );

      expect(transfer.result).toBeErr(103); // Invalid amount error
    });

    it("should fail when non-owner tries to transfer from another account", () => {
      const transfer = simnet.callPublicFn(
        "toycoin",
        "transfer",
        [100, deployer, wallet2, "none"],
        wallet1
      );

      expect(transfer.result).toBeErr(101); // Not token owner error
    });
  });

  describe("Send Function", () => {
    it("should allow sending tokens using convenience function", () => {
      const sendAmount = 500;
      const send = simnet.callPublicFn(
        "toycoin",
        "send",
        [sendAmount, wallet2, "none"],
        deployer
      );

      expect(send.result).toBeOk(true);
      
      const wallet2Balance = simnet.callReadOnlyFn("toycoin", "get-balance", [wallet2], deployer);
      expect(wallet2Balance.result).toBeOk(500);
    });
  });

  describe("Administrative Functions", () => {
    it("should allow owner to mint new tokens", () => {
      const mintAmount = 5000;
      const mint = simnet.callPublicFn(
        "toycoin",
        "mint",
        [mintAmount, wallet1],
        deployer
      );

      expect(mint.result).toBeOk(true);
      
      // Check updated balances and total supply
      const wallet1Balance = simnet.callReadOnlyFn("toycoin", "get-balance", [wallet1], deployer);
      const totalSupply = simnet.callReadOnlyFn("toycoin", "get-total-supply", [], deployer);
      
      expect(wallet1Balance.result).toBeOk(6500); // 1000 from previous test + 5000 minted
      expect(totalSupply.result).toBeOk(1005500); // Original + minted - transferred
    });

    it("should fail when non-owner tries to mint", () => {
      const mint = simnet.callPublicFn(
        "toycoin",
        "mint",
        [1000, wallet1],
        wallet1
      );

      expect(mint.result).toBeErr(100); // Owner only error
    });

    it("should fail when minting zero amount", () => {
      const mint = simnet.callPublicFn(
        "toycoin",
        "mint",
        [0, wallet1],
        deployer
      );

      expect(mint.result).toBeErr(103); // Invalid amount error
    });

    it("should allow token holders to burn their tokens", () => {
      const burnAmount = 500;
      const burn = simnet.callPublicFn(
        "toycoin",
        "burn",
        [burnAmount, wallet1],
        wallet1
      );

      expect(burn.result).toBeOk(true);
      
      const wallet1Balance = simnet.callReadOnlyFn("toycoin", "get-balance", [wallet1], deployer);
      const totalSupply = simnet.callReadOnlyFn("toycoin", "get-total-supply", [], deployer);
      
      expect(wallet1Balance.result).toBeOk(6000); // 6500 - 500 burned
      expect(totalSupply.result).toBeOk(1005000); // Total supply reduced
    });

    it("should allow owner to burn tokens from any account", () => {
      const burnAmount = 100;
      const burn = simnet.callPublicFn(
        "toycoin",
        "burn",
        [burnAmount, wallet1],
        deployer
      );

      expect(burn.result).toBeOk(true);
      
      const wallet1Balance = simnet.callReadOnlyFn("toycoin", "get-balance", [wallet1], deployer);
      expect(wallet1Balance.result).toBeOk(5900);
    });

    it("should fail when non-owner/non-holder tries to burn", () => {
      const burn = simnet.callPublicFn(
        "toycoin",
        "burn",
        [100, wallet1],
        wallet2
      );

      expect(burn.result).toBeErr(101); // Not token owner error
    });
  });

  describe("Metadata Management", () => {
    it("should allow owner to update token name", () => {
      const newName = "NewToycoin";
      const updateName = simnet.callPublicFn(
        "toycoin",
        "set-token-name",
        [newName],
        deployer
      );

      expect(updateName.result).toBeOk(true);
      
      const name = simnet.callReadOnlyFn("toycoin", "get-name", [], deployer);
      expect(name.result).toBeOk(newName);
    });

    it("should allow owner to update token symbol", () => {
      const newSymbol = "NTOY";
      const updateSymbol = simnet.callPublicFn(
        "toycoin",
        "set-token-symbol",
        [newSymbol],
        deployer
      );

      expect(updateSymbol.result).toBeOk(true);
      
      const symbol = simnet.callReadOnlyFn("toycoin", "get-symbol", [], deployer);
      expect(symbol.result).toBeOk(newSymbol);
    });

    it("should fail when non-owner tries to update metadata", () => {
      const updateName = simnet.callPublicFn(
        "toycoin",
        "set-token-name",
        ["HackedCoin"],
        wallet1
      );

      const updateSymbol = simnet.callPublicFn(
        "toycoin",
        "set-token-symbol",
        ["HACK"],
        wallet1
      );

      expect(updateName.result).toBeErr(100); // Owner only error
      expect(updateSymbol.result).toBeErr(100); // Owner only error
    });
  });

  describe("Balance Queries", () => {
    it("should return zero balance for accounts with no tokens", () => {
      const balance = simnet.callReadOnlyFn(
        "toycoin",
        "get-balance",
        [accounts.get("wallet_3")!],
        deployer
      );
      expect(balance.result).toBeOk(0);
    });

    it("should return correct token URI (none)", () => {
      const uri = simnet.callReadOnlyFn("toycoin", "get-token-uri", [], deployer);
      expect(uri.result).toBeOk("none");
    });
  });
});
