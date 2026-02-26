import { useState } from 'react'
import { FractionalRealEstateClient } from '../contracts/FractionalRealEstate'
import { microAlgo } from '@algorandfoundation/algokit-utils'

/**
 * Custom hook to list a new property for fractional ownership.
 * @param appClient The FractionalRealEstateClient instance
 * @param activeAddress The address of the user listing the property
 */
export function useListProperty(appClient: FractionalRealEstateClient | null, activeAddress: string | null | undefined) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  /**
   * List a property on the contract
   * @param propertyAddress The address or name of the property
   * @param shares The total number of shares
   * @param pricePerShare The price per share in microAlgos
   * @param onTx (optional) callback to receive the transaction ID
   */
  const listProperty = async (propertyAddress: string, shares: string, pricePerShare: string, onTx?: (txId?: string) => void) => {
    if (!appClient || !activeAddress) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Create an MBR payment transaction to fund the contract's box storage costs.
      // MBR formula: 2500 + 400 * (boxNameLen + boxValueLen) microAlgos.
      const mbrPayment = await appClient.algorand.createTransaction.payment({
        sender: activeAddress,
        amount: microAlgo(100_000), // Generous estimate to cover box MBR
        receiver: appClient.appAddress,
      })

      const result = await appClient.send.createPropertyListing({
        args: {
          mbrPayment,
          propertyAddress,
          shares: BigInt(shares),
          pricePerShare: BigInt(pricePerShare),
        },
        boxReferences: ['properties'],
        extraFee: microAlgo(1000),
      })
      setSuccess(`Property listed! Asset ID: ${result.return}`)
      if (onTx && result.txIds && result.txIds.length > 0) {
        onTx(result.txIds[0])
      } else if (onTx) {
        onTx(undefined)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to list property')
      if (onTx) onTx(undefined)
    } finally {
      setLoading(false)
    }
  }

  return { listProperty, loading, error, success, setSuccess, setError }
}
