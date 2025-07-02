import { useState, useCallback } from 'react'
import { FractionalRealEstateClient } from '../contracts/FractionalRealestate'

// Property type for listed properties
export type Property = {
  address: string
  totalShares: bigint
  availableShares: bigint
  pricePerShare: bigint
  propertyAssetId: bigint
  ownerAddress: string
}

/**
 * Custom hook to fetch all listed properties from the smart contract.
 * @param appClient The FractionalRealEstateClient instance
 */
export function useProperties(appClient: FractionalRealEstateClient | null) {
  const [properties, setProperties] = useState<[bigint, Property][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch properties from the contract
  const fetchProperties = useCallback(async () => {
    if (!appClient) return

    setLoading(true)
    setError(null)

    try {
      const listed = await appClient.state.box.listedProperties.getMap()
      setProperties(Array.from(listed.entries()) as [bigint, Property][])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch properties')
    } finally {
      setLoading(false)
    }
  }, [appClient])

  return { properties, loading, error, refresh: fetchProperties }
}
