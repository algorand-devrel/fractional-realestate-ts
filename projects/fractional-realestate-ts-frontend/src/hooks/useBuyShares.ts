import { useState } from 'react'
import { FractionalRealEstateClient } from '../contracts/FractionalRealestate'
import { microAlgo } from '@algorandfoundation/algokit-utils'

/**
 * Helper to create a box reference for a BoxMap in Algorand smart contracts.
 * Algorand box keys for BoxMap are constructed as: prefix + uint64(key) (big-endian)
 * This helper encodes the key for use in boxReferences.
 *
 * @param appId The application ID
 * @param prefix The string prefix for the BoxMap (e.g., 'properties')
 * @param key The bigint key (e.g., propertyId)
 * @returns An object with appId and name (Uint8Array) for use in boxReferences
 */
function createBoxReference(appId: bigint, prefix: string, key: bigint) {
  // Encode the key as a big-endian uint64
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setBigUint64(0, key, false) // false = big-endian
  const encodedKey = new Uint8Array(buffer)
  // Concatenate prefix and encoded key
  const boxName = new Uint8Array([...new TextEncoder().encode(prefix), ...encodedKey])
  return {
    appId,
    name: boxName,
  }
}

/**
 * Custom hook to buy shares of a listed property.
 * @param appClient The FractionalRealEstateClient instance
 * @param activeAddress The address of the user buying shares
 */
export function useBuyShares(appClient: FractionalRealEstateClient | null, activeAddress: string | null | undefined) {
  const [buyingPropertyId, setBuyingPropertyId] = useState<bigint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  /**
   * Buy shares of a property
   * @param propertyId The asset ID of the property
   * @param pricePerShare The price per share in microAlgos
   * @param ownerAddress The address of the property owner
   * @param buyAmount The number of shares to buy (string)
   */
  const buyShares = async (propertyId: bigint, pricePerShare: bigint, ownerAddress: string, buyAmount: string) => {
    if (!appClient) {
      setError('App is not ready. Please try again in a moment.')
      return
    }
    if (!activeAddress) {
      setError('Please connect your wallet to buy shares.')
      return
    }
    setBuyingPropertyId(propertyId)
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const sharesToBuy = BigInt(buyAmount)
      const paymentAmount = sharesToBuy * pricePerShare

      // Opt-in to the property asset
      const optInTxn = await appClient.algorand.createTransaction.assetOptIn({
        sender: activeAddress,
        assetId: propertyId,
      })

      // Create a payment transaction to pay the lister
      // This transaction is sent as a parameter to the purchaseFromLister transaction
      const paymentTxn = await appClient.algorand.createTransaction.payment({
        sender: activeAddress,
        amount: microAlgo(Number(paymentAmount)),
        receiver: appClient.appAddress,
      })

      // Use the helper to create the correct box reference for the properties BoxMap
      const boxReference = createBoxReference(appClient.appId, 'properties', propertyId)

      // Create a group transaction to purchase shares from the lister
      const group = appClient
        .newGroup()
        .addTransaction(optInTxn)
        .purchaseFromLister({
          sender: activeAddress,
          args: {
            propertyId,
            shares: sharesToBuy,
            payment: paymentTxn,
          },
          boxReferences: [boxReference],
          accountReferences: [activeAddress],
          assetReferences: [propertyId],
          extraFee: microAlgo(2000),
        })

      const result = await group.send()
      if (result.returns[0]) {
        setSuccess('Shares purchased!')
      } else {
        setError('Purchase failed')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to buy shares')
    } finally {
      setLoading(false)
      setBuyingPropertyId(null)
    }
  }

  return { buyShares, loading, error, success, buyingPropertyId, setSuccess, setError }
}
