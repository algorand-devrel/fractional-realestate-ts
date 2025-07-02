import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { FractionalRealEstateFactory } from '../artifacts/FractionalRealEstate/FractionalRealEstateClient'

// Below is a showcase of various deployment options you can use in TypeScript Client
export async function deploy() {
  console.log('=== Deploying Contract ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  const factory = algorand.client.getTypedAppFactory(FractionalRealEstateFactory, {
    defaultSender: deployer.addr,
  })

  const { appClient, result } = await factory.deploy({ onUpdate: 'append', onSchemaBreak: 'append' })

  // If app was just created fund the app account
  if (['create', 'replace'].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  }

  // Get deployment details and display in a table
  const { appId, appAddress, appName } = appClient

  console.table({
    name: appName,
    id: appId.toString(),
    address: appAddress.toString(),
    deployer: deployer.addr.toString(),
  })
}
