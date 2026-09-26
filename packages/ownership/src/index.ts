import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  type Signer,
} from "@solana/web3.js"
import {
  AuthorityType,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMintInstruction,
  createMintToCheckedInstruction,
  createSetAuthorityInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  getMintLen,
} from "@solana/spl-token"
import type { OwnershipApi } from "@proven/shared"

/** Re-export so Person 3 can build combined txs without digging into spl-token. */
export { TOKEN_2022_PROGRAM_ID }

export const PROVEN_ITEM = {
  id: "PROVEN-001",
  name: "Rolex Submariner",
  serialNumber: "126610LN-8472",
} as const

export type ProvenAssetInput = {
  connection: Connection
  payer: Signer
  seller: PublicKey
  itemId: string
  name: string
  serialNumber: string
}

export type CreateProvenAssetResult = {
  mint: PublicKey
  signature: string
  /** Off-chain identity recorded at mint time (demo MVP). */
  identity: {
    itemId: string
    name: string
    serialNumber: string
  }
}

/**
 * Creates a Token-2022 mint with decimals 0 and supply 1 held by the seller.
 * Mint authority is revoked so supply stays fixed.
 *
 * Note: on-chain Token Metadata extension is skipped for hackathon reliability
 * (local validator + Token-2022 metadata init was brittle). Item identity is
 * returned here and should be stored alongside the mint address by callers.
 */
export const createProvenAsset = async (
  input: ProvenAssetInput,
): Promise<CreateProvenAssetResult> => {
  const { connection, payer, seller, itemId, name, serialNumber } = input
  if (!itemId || !name || !serialNumber) {
    throw new Error("Item identity is required")
  }

  const mint = Keypair.generate()
  const mintSpace = getMintLen([])
  const rent = await connection.getMinimumBalanceForRentExemption(mintSpace)
  const sellerTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    seller,
    false,
    TOKEN_2022_PROGRAM_ID,
  )

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      lamports: rent,
      space: mintSpace,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mint.publicKey,
      0,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID,
    ),
    createAssociatedTokenAccountIdempotentInstruction(
      payer.publicKey,
      sellerTokenAccount,
      seller,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
    createMintToCheckedInstruction(
      mint.publicKey,
      sellerTokenAccount,
      payer.publicKey,
      1,
      0,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
    createSetAuthorityInstruction(
      mint.publicKey,
      payer.publicKey,
      AuthorityType.MintTokens,
      null,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  )

  const signature = await sendAndConfirmTransaction(connection, tx, [payer, mint], {
    commitment: "confirmed",
  })

  return {
    mint: mint.publicKey,
    signature,
    identity: { itemId, name, serialNumber },
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Reads the unique nonzero token account, then returns its on-chain authority. */
export const getItemOwner = async (
  connection: Connection,
  mint: PublicKey,
  options?: { retries?: number; delayMs?: number },
): Promise<PublicKey> => {
  const retries = options?.retries ?? 8
  const delayMs = options?.delayMs ?? 400
  let lastError: unknown

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const mintState = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID)
      if (
        mintState.decimals !== 0 ||
        mintState.supply !== 1n ||
        mintState.mintAuthority !== null
      ) {
        throw new Error("Mint is not a fixed-supply Proven ownership asset")
      }

      const holders = await connection.getTokenLargestAccounts(mint, "confirmed")
      const owners = holders.value.filter((account) => account.amount === "1")
      if (owners.length !== 1) {
        throw new Error("Expected exactly one token holder")
      }

      const account = await getAccount(
        connection,
        owners[0].address,
        "confirmed",
        TOKEN_2022_PROGRAM_ID,
      )
      if (!account.mint.equals(mint) || account.amount !== 1n) {
        throw new Error("Ownership changed during lookup; retry")
      }

      return account.owner
    } catch (error) {
      lastError = error
      if (attempt < retries - 1) {
        await sleep(delayMs)
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to resolve item owner from chain")
}

/** @deprecated Metadata extension removed for reliability — use createProvenAsset().identity */
export const getProvenAssetIdentity = async (_connection: Connection, _mint: PublicKey) => {
  return null
}

export type OwnershipTransferInput = {
  connection: Connection
  mint: PublicKey
  seller: PublicKey
  buyer: PublicKey
  /** Funds the buyer's ATA if it does not exist yet (usually buyer or marketplace fee-payer). */
  payer: PublicKey
}

/**
 * Returns composable Token-2022 instructions for Person 3 to merge with payment.
 * Does NOT submit a transaction.
 */
export const buildOwnershipTransferInstructions = async (
  input: OwnershipTransferInput,
): Promise<TransactionInstruction[]> => {
  const { connection, mint, seller, buyer, payer } = input
  if (seller.equals(buyer)) {
    throw new Error("Seller and buyer must differ")
  }

  const currentOwner = await getItemOwner(connection, mint)
  if (!currentOwner.equals(seller)) {
    throw new Error("Seller does not own this asset")
  }

  const sellerTokenAccount = getAssociatedTokenAddressSync(
    mint,
    seller,
    false,
    TOKEN_2022_PROGRAM_ID,
  )
  const buyerTokenAccount = getAssociatedTokenAddressSync(
    mint,
    buyer,
    false,
    TOKEN_2022_PROGRAM_ID,
  )
  const sellerAccount = await getAccount(
    connection,
    sellerTokenAccount,
    "confirmed",
    TOKEN_2022_PROGRAM_ID,
  )
  if (sellerAccount.amount !== 1n || !sellerAccount.owner.equals(seller)) {
    throw new Error("Seller's associated token account must hold the asset")
  }

  return [
    createAssociatedTokenAccountIdempotentInstruction(
      payer,
      buyerTokenAccount,
      buyer,
      mint,
      TOKEN_2022_PROGRAM_ID,
    ),
    createTransferCheckedInstruction(
      sellerTokenAccount,
      mint,
      buyerTokenAccount,
      seller,
      1,
      0,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  ]
}

/** Standalone demo wrapper. Atomic purchase flows should use the instruction builder. */
export const transferOwnership = async (
  input: Omit<OwnershipTransferInput, "seller" | "payer"> & {
    seller: Signer
    payer: Signer
  },
): Promise<string> => {
  const instructions = await buildOwnershipTransferInstructions({
    ...input,
    seller: input.seller.publicKey,
    payer: input.payer.publicKey,
  })
  const tx = new Transaction().add(...instructions)
  const signers = input.seller.publicKey.equals(input.payer.publicKey)
    ? [input.seller]
    : [input.payer, input.seller]

  return sendAndConfirmTransaction(input.connection, tx, signers, {
    commitment: "confirmed",
  })
}

export const ownership: OwnershipApi = {
  async registerItem() {
    throw new Error("Use createProvenAsset with a payer signer")
  },
  async getItem() {
    throw new Error("Item lookup requires a mint address")
  },
  async getItemOwner() {
    throw new Error("Use getItemOwner(connection, mint)")
  },
  async transferOwnership() {
    throw new Error(
      "Use buildOwnershipTransferInstructions or transferOwnership with signers",
    )
  },
}
