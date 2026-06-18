export class WalletRequiredError extends Error {
  constructor(message = "Connect your wallet to continue.") {
    super(message);
    this.name = "WalletRequiredError";
  }
}

export class WalletConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletConfigError";
  }
}

export class WalletTxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletTxError";
  }
}

export function formatWalletError(error: unknown): string {
  if (error instanceof WalletRequiredError || error instanceof WalletConfigError || error instanceof WalletTxError) {
    return error.message;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("user rejected") || message.includes("user denied")) {
      return "Transaction rejected in wallet.";
    }
    return error.message;
  }

  return "Wallet transaction failed.";
}

export function isWalletError(error: unknown): boolean {
  return (
    error instanceof WalletRequiredError ||
    error instanceof WalletConfigError ||
    error instanceof WalletTxError ||
    (error instanceof Error &&
      (error.message.toLowerCase().includes("user rejected") ||
        error.message.toLowerCase().includes("user denied")))
  );
}
