import { useWallet } from '@txnlab/use-wallet-react'
import React, { useEffect } from 'react'
import HeroSection from './components/HeroSection'
import ListPropertyForm from './components/ListPropertyForm'
import Navbar from './components/Navbar'
import PropertyGrid from './components/PropertyGrid'
import OwnedPropertyGrid from './components/OwnedPropertyGrid'
import { useAppClient } from './context/AppClientContext'
import { useBuyShares } from './hooks/useBuyShares'
import { useListProperty } from './hooks/useListProperty'
import { useOwnedProperties } from './hooks/useOwnedProperties'
import { useProperties } from './hooks/useProperties'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  // --- Hooks for Algorand contract and wallet ---
  const { appClient } = useAppClient()
  const { activeAddress } = useWallet()

  // --- Hooks for contract logic ---
  const { properties, loading: propertiesLoading, error: propertiesError, refresh: refreshProperties } = useProperties(appClient)
  const { listProperty, loading: listingLoading, error: listingError, success: listingSuccess } = useListProperty(appClient, activeAddress)
  const { buyShares, loading: buyLoading, error: buyError, success: buySuccess, buyingPropertyId } = useBuyShares(appClient, activeAddress)
  const { ownedProperties, loading: ownedLoading, error: ownedError, refresh: refreshOwned } = useOwnedProperties(appClient, activeAddress)

  // --- Refresh properties when a property is listed or shares are bought ---
  useEffect(() => {
    refreshProperties()
    refreshOwned()
  }, [appClient, listingSuccess, buySuccess, activeAddress, refreshProperties, refreshOwned])

  // --- Handle property listing form submit ---
  const handleListProperty = async (propertyAddress: string, shares: string, pricePerShare: string) => {
    await listProperty(propertyAddress, shares, pricePerShare)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      {/* --- Hero and Listing Form Section --- */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 flex-1 w-full">
        {/* --- Hero Section --- */}
        <HeroSection />
        {/* --- Property Listing Form --- */}
        <div className="px-6 pt-16 pb-12 sm:pb-24 lg:px-8 lg:py-32 flex items-center">
          <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg w-full">
            <ListPropertyForm
              listingLoading={listingLoading}
              listingError={listingError}
              listingSuccess={listingSuccess}
              activeAddress={activeAddress}
              handleListProperty={handleListProperty}
            />
          </div>
        </div>
      </div>
      {/* --- Property Grid Section --- */}
      <div className="mx-auto max-w-7xl w-full px-6 pb-16">
        <div className="rounded-xl shadow-md p-6 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Listed Properties</h2>
          {propertiesLoading ? (
            <div className="text-center text-gray-500">Loading properties...</div>
          ) : propertiesError ? (
            <div className="text-red-500 text-center">{propertiesError}</div>
          ) : properties.length === 0 ? (
            <div className="text-center text-gray-400">No properties listed yet.</div>
          ) : (
            <PropertyGrid
              properties={properties}
              activeAddress={activeAddress}
              buyingPropertyId={buyingPropertyId}
              buyLoading={buyLoading}
              buyError={buyError}
              buySuccess={buySuccess}
              handleBuyShares={buyShares}
            />
          )}
        </div>
      </div>
      {/* --- Owned Properties Section --- */}
      <div className="mx-auto max-w-7xl w-full px-6 pb-16">
        <div className="rounded-xl shadow-md p-6 bg-white">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Properties You Own Shares In</h2>
          <OwnedPropertyGrid ownedProperties={ownedProperties} loading={ownedLoading} error={ownedError} />
        </div>
      </div>
    </div>
  )
}

export default Home
