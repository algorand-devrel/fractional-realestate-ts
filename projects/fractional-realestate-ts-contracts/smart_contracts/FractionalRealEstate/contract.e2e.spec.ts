import { Config, algo, AlgorandClient, microAlgo } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { ABIUintType, Address } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { FractionalRealEstateFactory } from '../artifacts/FractionalRealEstate/FractionalRealEstateClient'

// Helper to wait for asset opt-in
// Algorand accounts (including smart contracts) must explicitly opt in to an ASA (Algorand Standard Asset)
// before they can hold or transfer it. This helper ensures the given account is opted in to the asset.
async function ensureOptedInToAsset(algorand: AlgorandClient, account: Address, assetId: bigint) {
  const info = await algorand.account.getInformation(account)
  if (!info.assets?.some((asset) => asset.assetId === assetId)) {
    await algorand.send.assetOptIn({ sender: account, assetId: assetId })
  }
}

describe('FractionalRealEstate contract', () => {
  const localnet = algorandFixture()
  beforeAll(() => {
    Config.configure({ debug: true })
    registerDebugEventHandlers()
  })
  beforeEach(localnet.newScope)

  const deploy = async (account: Address) => {
    // Deploy the FractionalRealEstate contract as the given account (lister)
    // The deployer will be the initial property lister/owner
    const factory = localnet.algorand.client.getTypedAppFactory(FractionalRealEstateFactory, {
      defaultSender: account,
    })

    const { appClient } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })

    // Fund the app account so it can pay for inner transactions (asset creation, transfers, etc.)
    await localnet.algorand.send.payment({
      amount: algo(1),
      sender: account,
      receiver: appClient.appAddress,
    })

    return { client: appClient }
  }

  function createBoxReference(appId: bigint, prefix: string, key: bigint) {
    // Algorand box keys for BoxMap are constructed as: prefix + uint64(key) (big-endian)
    // This helper encodes the key for use in boxReferences
    const uint64Type = new ABIUintType(64)
    const encodedKey = uint64Type.encode(key)
    const boxName = new Uint8Array([...new TextEncoder().encode(prefix), ...encodedKey])

    return {
      appId,
      name: boxName,
    }
  }

  test('can list a property and purchase shares', async () => {
    // --- SETUP ---
    // testAccount will act as the property lister/owner
    // generateAccount creates a new buyer account with initial funds
    const { testAccount, generateAccount } = localnet.context
    const lister = testAccount
    const buyer = (await generateAccount({ initialFunds: algo(1000000) })).addr
    const { client } = await deploy(lister)

    // --- PROPERTY LISTING ---
    // The lister creates a new property listing, which creates an ASA representing property shares
    // The contract creates the asset, but does NOT automatically opt in to it (Algorand protocol rule)
    const propertyAddress = '123 Main St'
    const totalShares = 100n
    const pricePerShare = 1_000_000n // 1 Algo per share
    const createResult = await client.send.createPropertyListing({
      args: {
        propertyAddress,
        shares: totalShares,
        pricePerShare,
      },
      // BoxMap for listed properties uses the prefix 'properties', but asset ID is not known until after creation
      boxReferences: ['properties'], // Only the prefix is needed for creation
      extraFee: microAlgo(1000), // Pay for the inner transaction which creates the property asset
    })

    const propertyId = createResult.return

    if (!propertyId) {
      throw new Error('Failed to create property listing')
    }

    // --- PURCHASING SHARES ---
    // The buyer must opt in to the asset before they can receive shares
    await ensureOptedInToAsset(localnet.algorand, buyer, propertyId)
    // The buyer sends a payment and calls the contract to purchase shares in a single atomic group
    const sharesToBuy = 10n
    const paymentAmount = sharesToBuy * pricePerShare
    // Create a payment transaction from the buyer to the app account for the correct amount
    const paymentTransaction = await localnet.algorand.createTransaction.payment({
      sender: buyer,
      amount: microAlgo(paymentAmount),
      receiver: client.appAddress,
    })

    // For grouped ABI calls, pass the payment transaction as the 'payment' argument
    // The boxReferences must include the full box key for the property (prefix + assetId)
    // accountReferences and assetReferences help the contract access external accounts/assets
    const group = client.newGroup().purchaseFromLister({
      sender: buyer,
      args: {
        propertyId,
        shares: sharesToBuy,
        payment: paymentTransaction,
      },
      boxReferences: [createBoxReference(client.appId, 'properties', propertyId)],
      accountReferences: [buyer, lister], // Buyer and lister may be referenced in contract logic
      assetReferences: [propertyId], // The property ASA must be referenced for asset transfer
      extraFee: microAlgo(2000), // Pay for the inner transactions (asset transfer, payment to lister)
    })

    // Execute the group and check the result
    const result = await group.send()
    expect(result.returns[0]).toBe(true)

    // --- ASSERTIONS ---
    // Check that the buyer received the correct number of shares
    const buyerAssetInfo = await localnet.algorand.asset.getAccountInformation(buyer, propertyId)
    expect(buyerAssetInfo.balance).toBe(sharesToBuy)

    // Check that the property info is updated correctly in the contract
    const propertyInfo = await client.getPropertyInfo({ args: { propertyId } })
    expect(propertyInfo.availableShares).toBe(totalShares - sharesToBuy)
    expect(propertyInfo.ownerAddress).toBe(lister.toString())
    expect(propertyInfo.pricePerShare).toBe(pricePerShare)
    expect(propertyInfo.address).toBe(propertyAddress)

    // Check the BoxMap state directly for completeness
    const listedPropertiesMap = await client.state.box.listedProperties.getMap()
    const listedProperties = Array.from(listedPropertiesMap.entries())
    expect(listedProperties.length).toBe(1)
    expect(listedProperties[0][0]).toBe(propertyId)
    expect(listedProperties[0][1].availableShares).toBe(totalShares - sharesToBuy)
    expect(listedProperties[0][1].ownerAddress).toBe(lister.toString())
    expect(listedProperties[0][1].pricePerShare).toBe(pricePerShare)
    expect(listedProperties[0][1].address).toBe(propertyAddress)
  })
})
