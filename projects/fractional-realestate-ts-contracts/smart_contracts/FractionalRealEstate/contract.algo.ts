import {
  Contract,
  abimethod,
  arc4,
  BoxMap,
  Global,
  Txn,
  itxn,
  Asset,
  assert,
  assertMatch,
  type uint64,
  gtxn,
  Bytes,
  clone,
} from '@algorandfoundation/algorand-typescript'

class PropertyStruct extends arc4.Struct<{
  address: arc4.Str
  totalShares: arc4.Uint64
  availableShares: arc4.Uint64
  pricePerShare: arc4.Uint64
  propertyAssetId: arc4.Uint64
  ownerAddress: arc4.Address
}> {}

export default class FractionalRealEstate extends Contract {
  public listedProperties = BoxMap<uint64, PropertyStruct>({ keyPrefix: 'properties' })

  /**
   * List a new property for fractional ownership. Creates an ASA representing shares
   * and stores property details in a BoxMap.
   *
   * @param mbrPayment Covers the Minimum Balance Requirement for box storage
   */
  public createPropertyListing(
    mbrPayment: gtxn.PaymentTxn,
    propertyAddress: string,
    shares: uint64,
    pricePerShare: uint64,
  ): uint64 {
    assert(shares > 0, 'Shares must be greater than 0')
    assert(pricePerShare > 0, 'Price per share must be greater than 0')

    // MBR = 2500 + 400 * (boxNameLen + boxValueLen) microAlgos
    // Box name: 'properties' prefix (10) + uint64 key (8) = 18 bytes
    // Box value is ARC4-encoded (see https://arc.algorand.foundation/ARCs/arc-0004#encoding):
    //   Structs encode as tuples. Static fields go inline in the head; dynamic fields
    //   (like Str) get a 2-byte offset in the head, with data appended in the tail.
    //   Head: Str offset (2) + Uint64 x4 (32) + Address (32) = 66 bytes
    //   Tail: Str length prefix (2) + string bytes
    //   Total: 68 + propertyAddress length
    const boxMbrCost: uint64 = 2500 + 400 * (18 + 68 + Bytes(propertyAddress).length)
    assert(mbrPayment.amount >= boxMbrCost, 'MBR payment amount is insufficient')
    assert(mbrPayment.receiver === Global.currentApplicationAddress, 'MBR payment must be to the app')
    assert(mbrPayment.sender === Txn.sender, 'MBR payment must be from the caller')

    const assetId = this.createPropertyAsset(propertyAddress, shares)

    const propertyStruct = new PropertyStruct({
      address: new arc4.Str(propertyAddress),
      totalShares: new arc4.Uint64(shares),
      availableShares: new arc4.Uint64(shares),
      pricePerShare: new arc4.Uint64(pricePerShare),
      propertyAssetId: new arc4.Uint64(assetId),
      ownerAddress: new arc4.Address(Txn.sender),
    })

    this.listedProperties(assetId).value = clone(propertyStruct)

    return assetId
  }

  /** Creates an ASA for the property. Asset name is truncated to 32 bytes (AVM limit). */
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

  /** Purchase shares from the original lister. Buyer must opt in to the ASA beforehand. */
  public purchaseFromLister(propertyId: uint64, shares: uint64, payment: gtxn.PaymentTxn): boolean {
    assert(shares > 0, 'Must purchase at least one share')
    assert(this.listedProperties(propertyId).exists, 'Property not listed')
    const property = clone(this.listedProperties(propertyId).value)

    assertMatch(payment, {
      amount: shares * property.pricePerShare.asUint64(),
      receiver: Global.currentApplicationAddress,
      sender: Txn.sender,
      closeRemainderTo: Global.zeroAddress,
      rekeyTo: Global.zeroAddress,
    })
    assert(shares <= property.availableShares.asUint64(), 'Not enough shares')

    // Transfer shares and pay owner atomically
    const asset = Asset(property.propertyAssetId.asUint64())
    itxn.submitGroup(
      itxn.assetTransfer({
        xferAsset: asset,
        assetReceiver: Txn.sender,
        assetAmount: shares,
        fee: 0,
      }),
      itxn.payment({
        amount: payment.amount,
        receiver: property.ownerAddress.bytes,
        fee: 0,
      }),
    )

    this.updateAvailableShares(propertyId, property.availableShares.asUint64() - shares)

    return true
  }

  /** Delist a property. Only the owner can delist, and no shares can have been sold.
   *  Deleting the box reclaims the MBR. */
  public delistProperty(propertyId: uint64): void {
    assert(this.listedProperties(propertyId).exists, 'Property not listed')
    const property = clone(this.listedProperties(propertyId).value)
    assert(Txn.sender === property.ownerAddress.native, 'Only the owner can delist')
    assert(
      property.availableShares.asUint64() === property.totalShares.asUint64(),
      'Cannot delist property with sold shares',
    )
    this.listedProperties(propertyId).delete()
  }

  // clone() is required because BoxMap values are references -- mutating without clone
  // would silently fail to persist changes
  private updateAvailableShares(propertyId: uint64, newAvailableShares: uint64) {
    const propertyStruct = clone(this.listedProperties(propertyId).value)
    const updatedStruct = new PropertyStruct({
      ...propertyStruct,
      availableShares: new arc4.Uint64(newAvailableShares),
    })

    this.listedProperties(propertyId).value = clone(updatedStruct)
  }

  @abimethod({ readonly: true })
  public getPropertyInfo(propertyId: uint64): PropertyStruct {
    assert(this.listedProperties(propertyId).exists, 'Property not listed')
    return this.listedProperties(propertyId).value
  }
}
