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

export type OwnedProperty = {
  assetId: bigint
  sharesOwned: bigint
  property: Property
}

/**
 * Custom hook to fetch all properties that the connected account owns shares in.
 *
 * This hook retrieves the list of all listed properties from the smart contract,
 * then fetches the asset holdings for the connected account, and filters the properties
 * to only those where the user owns at least one share (i.e., asset balance > 0).
 *
 * @param appClient The FractionalRealEstateClient instance
 * @param activeAddress The address of the connected user
 * @returns An object containing:
 *   - ownedProperties: Array of { assetId, sharesOwned, property } the user owns shares in
 *   - loading: Whether the fetch is in progress
 *   - error: Any error message encountered
 *   - refresh: Function to refresh the owned properties list
 */
export function useOwnedProperties(appClient: FractionalRealEstateClient | null, activeAddress: string | null | undefined) {
  const [ownedProperties, setOwnedProperties] = useState<OwnedProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all properties and filter for those owned by the connected account.
   */
  const fetchOwnedProperties = useCallback(async () => {
    if (!appClient) {
      setError('App is not ready. Please try again in a moment.')
      setOwnedProperties([])
      return
    }
    if (!activeAddress) {
      setError('Please connect your wallet to view your owned properties.')
      setOwnedProperties([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Fetch all listed properties from the contract
      const listed = await appClient.state.box.listedProperties.getMap()
      const allProperties = Array.from(listed.entries()) as [bigint, Property][]

      // Get account info (including asset holdings)
      const accountInfo = await appClient.algorand.account.getInformation(activeAddress)
      const assetHoldings = accountInfo.assets

      if (!assetHoldings) {
        setOwnedProperties([])
        setError('No asset holdings found for the active address.')
        return
      }

      // Build a list of properties the user owns shares in
      const owned: OwnedProperty[] = []
      for (const [assetId, property] of allProperties) {
        const holding = assetHoldings.find((h) => BigInt(h.assetId) === assetId)

        if (holding && holding.amount > 0) {
          owned.push({
            assetId,
            sharesOwned: BigInt(holding.amount),
            property,
          })
        }
      }

      setOwnedProperties(owned)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch owned properties')
      setOwnedProperties([])
    } finally {
      setLoading(false)
    }
  }, [appClient, activeAddress])

  // Fetch on mount and when dependencies change
  const refresh = fetchOwnedProperties

  return { ownedProperties, loading, error, refresh }
}
