import React from 'react'
import { OwnedProperty } from '../hooks/useOwnedProperties'
import { HomeIcon } from '@heroicons/react/24/outline'

interface OwnedPropertyGridProps {
  ownedProperties: OwnedProperty[]
  loading: boolean
  error: string | null
}

const OwnedPropertyGrid: React.FC<OwnedPropertyGridProps> = ({ ownedProperties, loading, error }) => {
  if (loading) {
    return <div className="text-center text-gray-500">Loading your owned properties...</div>
  }
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }
  if (ownedProperties.length === 0) {
    return <div className="text-center text-gray-400">You don't own shares in any properties yet.</div>
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {ownedProperties.map(({ assetId, sharesOwned, property }) => (
        <li key={assetId.toString()} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
          <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-4">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-100 ring-1 ring-gray-900/10">
              <HomeIcon className="h-6 w-6 text-teal-500" />
            </span>
            <div className="text-base font-medium text-gray-900 truncate flex-1">{property.address}</div>
          </div>
          <dl className="divide-y divide-gray-100 px-4 py-4 text-sm">
            <div className="flex justify-between gap-x-4 py-2">
              <dt className="text-gray-500">Asset ID</dt>
              <dd className="text-gray-700 font-mono">{assetId.toString()}</dd>
            </div>
            <div className="flex justify-between gap-x-4 py-2">
              <dt className="text-gray-500">Shares Owned</dt>
              <dd className="text-green-600 font-bold">{sharesOwned.toString()}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}

export default OwnedPropertyGrid
