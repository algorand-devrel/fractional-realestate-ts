import { HomeIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'

interface PropertyCardProps {
  propertyId: bigint
  property: {
    address: string
    totalShares: bigint
    availableShares: bigint
    pricePerShare: bigint
    propertyAssetId: bigint
    ownerAddress: string
  }
  activeAddress: string | null | undefined
  buyingPropertyId: bigint | null
  buyLoading: boolean
  buyError: string | null
  buySuccess: string | null
  handleBuyShares: (propertyId: bigint, pricePerShare: bigint, ownerAddress: string, buyAmount: string) => void
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  propertyId,
  property,
  activeAddress,
  buyingPropertyId,
  buyLoading,
  buyError,
  buySuccess,
  handleBuyShares,
}) => {
  const [localBuyAmount, setLocalBuyAmount] = useState('1')

  const sharesNum = Number(localBuyAmount)
  const isValid = !isNaN(sharesNum) && sharesNum >= 1 && sharesNum <= Number(property.availableShares)

  const isBuying = buyLoading && buyingPropertyId === propertyId

  return (
    <li className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
      <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal-100 ring-1 ring-gray-900/10">
          <HomeIcon className="h-7 w-7 text-teal-500" />
        </span>
        <div className="text-base font-medium text-gray-900 truncate flex-1">{property.address}</div>
      </div>
      <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm">
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Asset ID</dt>
          <dd className="text-gray-700 font-mono">{propertyId.toString()}</dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Shares</dt>
          <dd className="text-gray-700">{property.totalShares.toString()}</dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Available</dt>
          <dd className="text-gray-700">{property.availableShares.toString()}</dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Price/Share</dt>
          <dd className="text-gray-700">{property.pricePerShare.toString()}</dd>
        </div>
        <div className="flex justify-between gap-x-4 py-3">
          <dt className="text-gray-500">Owner</dt>
          <dd className="text-gray-700 truncate font-mono max-w-[8rem]">{property.ownerAddress}</dd>
        </div>
      </dl>
      <div className="px-6 pb-4 mt-auto">
        {activeAddress && property.ownerAddress !== activeAddress ? (
          <div className="flex flex-col gap-2 items-end w-full">
            <label className="text-xs text-gray-600 mb-1 self-start" htmlFor={`buy-shares-${propertyId}`}>
              Shares to Buy
            </label>
            <div className="flex gap-2 w-full items-center">
              <input
                id={`buy-shares-${propertyId}`}
                className="input input-bordered input-xs w-20"
                type="number"
                min={1}
                max={property.availableShares.toString()}
                value={localBuyAmount}
                onChange={(e) => setLocalBuyAmount(e.target.value)}
                disabled={isBuying}
              />
              <button
                className="btn btn-xs btn-success"
                disabled={isBuying || !isValid}
                onClick={() => {
                  handleBuyShares(propertyId, BigInt(property.pricePerShare), property.ownerAddress, localBuyAmount)
                }}
              >
                {isBuying ? 'Buying...' : 'Buy Shares'}
              </button>
            </div>
            {!isValid && (
              <div className="text-red-500 text-xs self-start">Enter a valid amount (1 - {property.availableShares.toString()})</div>
            )}
            {buyError && buyingPropertyId === propertyId && <div className="text-red-500 text-xs self-start">{buyError}</div>}
            {buySuccess && buyingPropertyId === propertyId && <div className="text-green-600 text-xs self-start">{buySuccess}</div>}
          </div>
        ) : property.ownerAddress === activeAddress ? (
          <span className="text-xs text-gray-500">You own this</span>
        ) : (
          <span className="text-xs text-gray-400">Connect wallet</span>
        )}
      </div>
    </li>
  )
}

export default PropertyCard
