import { useState } from 'react'
import { FractionalRealEstateClient } from '../contracts/FractionalRealestate'
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
   */
  const listProperty = async (propertyAddress: string, shares: string, pricePerShare: string) => {
    if (!appClient || !activeAddress) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await appClient.send.createPropertyListing({
        args: {
          propertyAddress,
          shares: BigInt(shares),
          pricePerShare: BigInt(pricePerShare),
        },
        boxReferences: ['properties'],
        extraFee: microAlgo(1000),
      })
      setSuccess(`Property listed! Asset ID: ${result.return}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to list property')
    } finally {
      setLoading(false)
    }
  }

  return { listProperty, loading, error, success, setSuccess, setError }
}
