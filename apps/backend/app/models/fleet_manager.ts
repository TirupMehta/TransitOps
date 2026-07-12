import { BaseModel, beforeSave, column, scope } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
export default class FleetManager extends BaseModel {
  static softDeletes = scope((query) => {
    query.whereNull('deleted_at')
  })
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare phoneNumber: string

  @column()
  declare address: string

  @column()
  declare city: string

  @column()
  declare state: string

  @column()
  declare country: string

  @column()
  declare role: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare deletedAt: DateTime

   @beforeSave()
   public static async hashPassword( fleetManager: FleetManager) {
    if (fleetManager.$dirty.password) {
      fleetManager.password = await hash.make(fleetManager.password) 
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await hash.verify(this.password, password) 
  }
}
