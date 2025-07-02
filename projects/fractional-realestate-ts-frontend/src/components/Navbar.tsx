import React from 'react'
import ConnectWallet from './ConnectWallet'
import { useWallet } from '@txnlab/use-wallet-react'
import { WalletIcon } from '@heroicons/react/24/outline'

const Navbar: React.FC = () => {
  const [openWalletModal, setOpenWalletModal] = React.useState(false)
  const toggleWalletModal = () => setOpenWalletModal((v) => !v)
  const { activeAddress } = useWallet()

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-4">
        <div className="text-xl font-bold">Fractional Real Estate</div>
        <button className="btn btn-primary flex items-center gap-2" onClick={toggleWalletModal} data-test-id="connect-wallet-navbar">
          {activeAddress ? <WalletIcon className="h-6 w-6" /> : 'Connect Wallet'}
        </button>
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
      </div>
    </nav>
  )
}

export default Navbar
