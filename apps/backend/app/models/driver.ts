import { BaseModel, beforeSave, column, scope } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";
import hash from '@adonisjs/core/services/hash'
export default class Driver extends BaseModel {
  public static table = 'drivers'

  static softDeletes = scope((query) => {
    query.whereNull('deleted_at')
  })

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare driverName: string

  @column()
  declare driverEmail: string

  @column()
  declare driverPhone: string

  @column()
  declare driverLicenseNumber: string

  @column()
  declare driverLicenseExpiryDate: string

  @column()
  declare driverPassword: string

  @column()
  declare driverRole: string

  @column()
  declare driverAddress: string

  @column()
  declare driverCity: string

  @column()
  declare driverState: string

  @column()
  declare driverCountry: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime

  @beforeSave()
  public static async hashPassword(driver: Driver) {
    if (driver.$dirty.driverPassword) {
      driver.driverPassword = await hash.make(driver.driverPassword)
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await hash.verify(this.driverPassword, password)
  }
}