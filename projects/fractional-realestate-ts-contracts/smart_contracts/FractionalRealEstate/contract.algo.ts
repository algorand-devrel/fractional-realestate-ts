/**
 * FractionalRealEstate Contract
 *
 * This smart contract allows users to tokenize real estate properties as Algorand Standard Assets (ASAs).
 * Users can list properties, and others can purchase fractional shares of those properties.
 *
 * Key Algorand concepts demonstrated:
 * - Asset creation and transfer using inner transactions (the contract itself creates new assets)
 * - Scalable per-asset storage using BoxMap and custom structs
 * - Subroutines (private methods) for composability and code reuse
 * - Defensive programming using assert statements
 *
 */
import {
  Account,
  Contract,
  abimethod,
  BoxMap,
  Global,
  Txn,
  itxn,
  Asset,
  assert,
  type uint64,
  gtxn,
  Bytes,
  clone
} from '@algorandfoundation/algorand-typescript'

/**
 * PropertyStruct
 *
 * Represents all the details about a property that is listed for fractional ownership.
 * This struct is stored in a BoxMap, allowing efficient lookup and update by property asset ID.
 *
 * Fields:
 * - address: The physical address of the property (as a string)
 * - totalShares: Total number of shares created for this property
 * - availableShares: Number of shares still available for purchase
 * - pricePerShare: Price per share in microAlgos
 * - propertyAssetId: The Algorand asset ID representing this property
 * - ownerAddress: The account address of the user who listed the property
 */
type PropertyStruct = {
  address: string
  totalShares: uint64
  availableShares:uint64
  pricePerShare: uint64
  propertyAssetId: uint64
  ownerAddress: Account
}

export default class FractionalRealEstate extends Contract {
  /**
   * BoxMap for listed properties (key: property asset ID, value: PropertyStruct)
   */
  public listedProperties = BoxMap<uint64, PropertyStruct>({ keyPrefix: 'properties' })

  /**
   * List a new property for fractional ownership.
   *
   * Steps:
   * 1. Creates a new Algorand Standard Asset (ASA) to represent shares in the property.
   * 2. Constructs a PropertyStruct with all relevant details.
   * 3. Stores the struct in a BoxMap, using the asset ID as the key.
   *
   * @param propertyAddress The physical address of the property (string)
   * @param shares Total number of shares to be created (uint64)
   * @param pricePerShare Price per share in microAlgos (uint64)
   * @returns The asset ID of the created property token (uint64)
   */
  
  public createPropertyListing(propertyAddress: string, shares: uint64, pricePerShare: uint64): uint64 {
    // Create the property asset (Algorand Standard Asset, ASA) using an inner transaction
    const assetId = this.createPropertyAsset(propertyAddress, shares)

    // Create a struct with all property details
    const propertyStruct = {
      address: propertyAddress,
      totalShares: shares,
      availableShares: shares,
      pricePerShare: pricePerShare,
      propertyAssetId:assetId,
      ownerAddress: Txn.sender,
    }

    // Store the property struct in the BoxMap, keyed by property asset ID
    this.listedProperties(assetId).value = clone(propertyStruct)

    return assetId
  }

  /**
   * Creates an Algorand Standard Asset (ASA) for the property and returns its asset ID.
   * This uses an inner transaction to create the asset. The contract (app account) will be the manager and reserve.
   *
   * @param propertyAddress The physical address of the property (used as asset name)
   * @param shares Total number of shares to be created (asset total)
   * @returns The asset ID of the created ASA
   */
  private createPropertyAsset(propertyAddress: string, shares: uint64): uint64 {
    const txnResult = itxn
      .assetConfig({
        assetName: Bytes(propertyAddress).slice(0, 32).toString(),
        unitName: 'PROP',
        total: shares,
        decimals: 0,
        manager: Global.currentApplicationAddress,
        reserve: Global.currentApplicationAddress,
        fee: 0,
      })
      .submit()
    return txnResult.createdAsset.id
  }

  /**
   * Purchase shares of a listed property from the original lister.
   *
   * This method:
   * 1. Validates the purchase (checks payment, share availability, etc.).
   * 2. Transfers the requested number of shares to the buyer using an inner asset transfer.
   * 3. Pays the property owner using an inner payment transaction.
   * 4. Updates the available shares in the BoxMap.
   *
   * @param propertyId The asset ID of the property to buy shares of
   * @param shares Number of shares to buy
   * @param payment The payment transaction (must be grouped with the app call)
   * @returns True if the purchase is successful
   */
  
  public purchaseFromLister(propertyId: uint64, shares: uint64, payment: gtxn.PaymentTxn): boolean {
    // Ensure the property is listed
    assert(this.listedProperties(propertyId).exists, 'Property not listed')
    const property = clone(this.listedProperties(propertyId).value)

    // Ensure the payment amount matches the total price for the requested shares
    assert(payment.amount === shares * property.pricePerShare, 'Invalid payment amount')
    // Ensure the payment is sent to the contract
    assert(payment.receiver === Global.currentApplicationAddress, 'Invalid payment receiver')
    // Ensure the payment is sent by the buyer
    assert(payment.sender === Txn.sender, 'Invalid payment sender')
    // Ensure the buyer has enough shares available
    assert(shares <= property.availableShares, 'Not enough shares')

    // Transfer shares to the buyer
    const asset = Asset(property.propertyAssetId)
    this.transferSharesToBuyer(Txn.sender, asset, shares)

    // Pay the property owner
    this.payPropertyOwner(payment.amount, property.ownerAddress)

    // Update the available shares
    this.updateAvailableShares(propertyId, property.availableShares - shares)

    return true
  }

  /**
   * Transfer property shares from the app account to the buyer (Txn.sender).
   * Uses an inner asset transfer transaction.
   *
   * @param asset The property asset to transfer
   * @param shares Number of shares to transfer
   */
  private transferSharesToBuyer(receiver: Account, asset: Asset, shares: uint64) {
    itxn
      .assetTransfer({
        xferAsset: asset,
        assetReceiver: receiver, // Buyer
        assetAmount: shares,
        fee: 0,
      })
      .submit()
  }

  /**
   * Pay the property owner the purchase amount in microAlgos.
   * Uses an inner payment transaction to send funds to the lister.
   *
   * @param amount The amount to pay (in microAlgos)
   * @param ownerAddress The address of the property owner
   */
  private payPropertyOwner(amount: uint64, ownerAddress: Account) {
    itxn
      .payment({
        amount,
        receiver: ownerAddress.bytes,
        fee: 0,
      })
      .submit()
  }

  /**
   * Update the available shares for a property in the BoxMap.
   * Copies the existing struct, updates availableShares, and stores it back.
   *
   * @param propertyId The asset ID of the property to update
   * @param newAvailableShares The new number of available shares
   */
  private updateAvailableShares(propertyId: uint64, newAvailableShares: uint64) {
    // The struct is copied to avoid mutating the original struct
    const propertyStruct = clone(this.listedProperties(propertyId).value)
    const updatedStruct = {
      ...propertyStruct,
      availableShares: newAvailableShares,
    }

    this.listedProperties(propertyId).value = clone(updatedStruct)
  }

  /**
   * Get information about a listed property.
   *
   * @param propertyId The asset ID of the property
   * @returns The PropertyStruct containing the property's information
   */
  @abimethod({ readonly: true })
  public getPropertyInfo(propertyId: uint64): PropertyStruct {
    assert(this.listedProperties(propertyId).exists, 'Property not listed')

    return this.listedProperties(propertyId).value
  }
}
