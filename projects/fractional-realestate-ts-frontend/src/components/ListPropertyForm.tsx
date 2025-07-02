import { PlusCircleIcon } from '@heroicons/react/24/outline'
import React, { useState } from 'react'

interface ListPropertyFormProps {
  listingLoading: boolean
  listingError: string | null
  listingSuccess: string | null
  activeAddress: string | null | undefined
  handleListProperty: (propertyAddress: string, shares: string, pricePerShare: string) => void
}

const ListPropertyForm: React.FC<ListPropertyFormProps> = ({
  listingLoading,
  listingError,
  listingSuccess,
  activeAddress,
  handleListProperty,
}) => {
  const [propertyAddress, setPropertyAddress] = useState('')
  const [shares, setShares] = useState('100')
  const [pricePerShare, setPricePerShare] = useState('1000000') // 1 Algo in microAlgos

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleListProperty(propertyAddress, shares, pricePerShare)
    setPropertyAddress('')
    setShares('100')
    setPricePerShare('1000000')
  }

  return (
    <form className="bg-white border border-gray-200 rounded-2xl shadow p-8 space-y-6" onSubmit={onSubmit}>
      <div className="flex items-center mb-1">
        <PlusCircleIcon className="h-7 w-7 text-teal-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">List a Property</h2>
      </div>
      <p className="text-gray-500 text-sm mb-4">Fill out the details below to tokenize and list a new property for fractional ownership.</p>

      <div className="space-y-2">
        <label htmlFor="property-address" className="block text-sm font-medium text-gray-700">
          Property Address
        </label>
        <input
          id="property-address"
          className="input input-bordered w-full"
          type="text"
          placeholder="e.g. 123 Main St, Springfield"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          required
        />
        <p className="text-xs text-gray-400">Enter the physical address or a unique name for the property.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="total-shares" className="block text-sm font-medium text-gray-700">
          Total Shares
        </label>
        <input
          id="total-shares"
          className="input input-bordered w-full"
          type="number"
          placeholder="e.g. 100"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          min={1}
          required
        />
        <p className="text-xs text-gray-400">How many fractional shares to create for this property?</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="price-per-share" className="block text-sm font-medium text-gray-700">
          Price Per Share (microAlgos)
        </label>
        <input
          id="price-per-share"
          className="input input-bordered w-full"
          type="number"
          placeholder="e.g. 1000000 (1 Algo)"
          value={pricePerShare}
          onChange={(e) => setPricePerShare(e.target.value)}
          min={1}
          required
        />
        <p className="text-xs text-gray-400">Set the price for each share in microAlgos (1 Algo = 1,000,000 microAlgos).</p>
      </div>

      <button className="btn btn-primary w-full mt-4 font-semibold text-base" type="submit" disabled={listingLoading || !activeAddress}>
        {listingLoading ? 'Listing...' : 'List Property'}
      </button>
      {listingError && <div className="text-red-500 text-sm text-center mt-2">{listingError}</div>}
      {listingSuccess && <div className="text-green-600 text-sm text-center mt-2">{listingSuccess}</div>}
    </form>
  )
}

export default ListPropertyForm
