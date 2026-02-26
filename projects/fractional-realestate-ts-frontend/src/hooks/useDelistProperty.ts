import { useState } from 'react'
import { FractionalRealEstateClient } from '../contracts/FractionalRealEstate'

/**
 * Helper to create a box reference for a BoxMap in Algorand smart contracts.
 */
function createBoxReference(appId: bigint, prefix: string, key: bigint) {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setBigUint64(0, key, false)
  const encodedKey = new Uint8Array(buffer)
  const boxName = new Uint8Array([...new TextEncoder().encode(prefix), ...encodedKey])
  return { appId, name: boxName }
}

/**
 * Custom hook to delist a property (remove from the contract).
 * Only the owner can delist, and all shares must still be available.
 */
export function useDelistProperty(appClient: FractionalRealEstateClient | null, activeAddress: string | null | undefined) {
  const [delistingPropertyId, setDelistingPropertyId] = useState<bigint | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const delistProperty = async (propertyId: bigint, onTx?: (txId?: string) => void) => {
    if (!appClient) {
      setError('App is not ready. Please try again in a moment.')
      return
    }
    if (!activeAddress) {
      setError('Please connect your wallet to delist.')
      return
    }
    setDelistingPropertyId(propertyId)
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const boxReference = createBoxReference(appClient.appId, 'properties', propertyId)

      const result = await appClient.send.delistProperty({
        args: { propertyId },
        boxReferences: [boxReference],
      })

      setSuccess('Property delisted!')
      if (onTx && result.txIds && result.txIds.length > 0) {
        onTx(result.txIds[0])
      } else if (onTx) {
        onTx(undefined)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delist property')
      if (onTx) onTx(undefined)
    } finally {
      setLoading(false)
      setDelistingPropertyId(null)
    }
  }

  return { delistProperty, loading, error, success, delistingPropertyId, setSuccess, setError }
}
