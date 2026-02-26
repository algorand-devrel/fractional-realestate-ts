// This context provider gives the rest of the app access to the smart contract's client.
// The client lets us call methods on the FractionalRealEstate smart contract directly on the Algorand blockchain.
// Any component in the app can use this context to interact with the contract (for example, to list a property or buy shares).

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'
// These imports allow us to interact with the FractionalRealEstate smart contract on the Algorand blockchain
import { FractionalRealEstateFactory, FractionalRealEstateClient } from '../contracts/FractionalRealEstate'
// This utility helps us connect to the Algorand blockchain network
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
// useWallet is a React hook that lets us connect to the user's Algorand wallet (like Pera or Lute)
// It gives us access to the user's address and a function to sign transactions
import { useWallet } from '@txnlab/use-wallet-react'
// These helpers get the necessary configuration to connect to Algorand nodes from our environment
import {
  getAlgodConfigFromViteEnvironment,
  getIndexerConfigFromViteEnvironment,
  getAppIdFromViteEnvironment,
} from '../utils/getAlgorandConfigs'

// Get the smart contract app ID from the environment
const APP_ID = getAppIdFromViteEnvironment()

type AppClientContextType = {
  appClient: FractionalRealEstateClient | null
  error: Error | null
}

const AppClientContext = createContext<AppClientContextType>({
  appClient: null,
  error: null,
})

export const AppClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // useWallet gives us the user's wallet address and a function to sign transactions
  // transactionSigner: used to sign blockchain transactions
  // activeAddress: the user's current Algorand address
  const { transactionSigner, activeAddress } = useWallet()
  // stableSigner ensures we always use the correct signer for the current address
  const stableSigner = useMemo(() => transactionSigner, [activeAddress])

  const [appClient, setAppClient] = useState<FractionalRealEstateClient | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // This effect sets up the connection to the Algorand blockchain and the smart contract client
    if (!activeAddress || !stableSigner) {
      setAppClient(null)
      return
    }

    setError(null)

    try {
      // Here we create a client for the Algorand blockchain using configuration from our environment
      const algodConfig = getAlgodConfigFromViteEnvironment()
      const indexerConfig = getIndexerConfigFromViteEnvironment()
      const algorand = AlgorandClient.fromConfig({ algodConfig, indexerConfig })

      // The factory pattern lets us easily create a client for our specific smart contract
      // The factory knows how to connect to the blockchain and which account to use
      const factory = new FractionalRealEstateFactory({
        defaultSender: activeAddress, // The user's wallet address
        algorand, // The Algorand client instance
      })

      // The client returned by the factory is how we actually interact with the smart contract
      // It knows the contract's app ID, the user's address, and how to sign transactions
      const client = factory.getAppClientById({
        appId: APP_ID, // The unique ID of the contract on Algorand
        defaultSender: activeAddress, // The account that will send transactions
        defaultSigner: stableSigner, // The function that will sign transactions
      })

      // Set the default signer for the Algorand client, so it knows how to sign transactions as well
      client.algorand.setDefaultSigner(stableSigner)

      setAppClient(client)
    } catch (e) {
      setError(e as Error)
      setAppClient(null)
    }
  }, [activeAddress, stableSigner])

  return <AppClientContext.Provider value={{ appClient, error }}>{children}</AppClientContext.Provider>
}

export const useAppClient = () => useContext(AppClientContext)
