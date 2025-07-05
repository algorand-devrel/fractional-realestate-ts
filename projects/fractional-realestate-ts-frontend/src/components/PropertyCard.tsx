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
          <div className="w-full bg-gray-50 rounded-lg p-4 flex flex-col gap-2 border border-gray-100">
            <label className="text-xs font-semibold text-gray-700 mb-1" htmlFor={`buy-shares-${propertyId}`}>
              Buy a share for {Number(property.pricePerShare) / 1000000} Algo
            </label>
            <div className="flex gap-2 w-full items-center">
              <input
                id={`buy-shares-${propertyId}`}
                className="block w-24 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition"
                type="number"
                min={1}
                max={property.availableShares.toString()}
                value={localBuyAmount}
                onChange={(e) => setLocalBuyAmount(e.target.value)}
                disabled={isBuying}
                placeholder="Amount"
              />
              <button
                className="inline-flex items-center gap-1 rounded-md bg-teal-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:bg-teal-200 disabled:cursor-not-allowed transition"
                disabled={isBuying || !isValid}
                onClick={() => {
                  handleBuyShares(propertyId, BigInt(property.pricePerShare), property.ownerAddress, localBuyAmount)
                }}
              >
                {isBuying ? (
                  <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : null}
                {isBuying ? 'Buying...' : 'Buy Shares'}
              </button>
            </div>
            {!isValid && (
              <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
                Enter a valid amount (1 - {property.availableShares.toString()})
              </div>
            )}
            {buyError && buyingPropertyId === propertyId && (
              <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                  />
                </svg>
                {buyError}
              </div>
            )}
            {buySuccess && !buyError && isValid && (
              <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {buySuccess}
              </div>
            )}
          </div>
        ) : property.ownerAddress === activeAddress ? (
          <div className="flex justify-center">
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-xs text-gray-700 font-medium border border-gray-100">
              You own this property
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Connect wallet</span>
        )}
      </div>
    </li>
  )
}

export default PropertyCard
