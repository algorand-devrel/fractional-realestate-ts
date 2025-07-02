import React from 'react'
import PropertyCard from './PropertyCard'

interface Property {
  address: string
  totalShares: bigint
  availableShares: bigint
  pricePerShare: bigint
  propertyAssetId: bigint
  ownerAddress: string
}

interface PropertyGridProps {
  properties: [bigint, Property][]
  activeAddress: string | null | undefined
  buyingPropertyId: bigint | null
  buyLoading: boolean
  buyError: string | null
  buySuccess: string | null
  handleBuyShares: (propertyId: bigint, pricePerShare: bigint, ownerAddress: string, buyAmount: string) => void
}

const PropertyGrid: React.FC<PropertyGridProps> = ({
  properties,
  activeAddress,
  buyingPropertyId,
  buyLoading,
  buyError,
  buySuccess,
  handleBuyShares,
}) => (
  <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3 xl:gap-x-8">
    {properties.map(([propertyId, property]) => (
      <PropertyCard
        key={propertyId.toString()}
        propertyId={propertyId}
        property={property}
        activeAddress={activeAddress}
        buyingPropertyId={buyingPropertyId}
        buyLoading={buyLoading}
        buyError={buyError}
        buySuccess={buySuccess}
        handleBuyShares={handleBuyShares}
      />
    ))}
  </ul>
)

export default PropertyGrid
