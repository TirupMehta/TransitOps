import { BaseModel, beforeSave, column } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";
import hash from '@adonisjs/core/services/hash'
export default class FinancialAnalyst extends BaseModel{
    public static table = 'financial_analists'

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare financialAnalistName: string

    @column()
    declare financialAnalistEmail: string

    @column()
    declare financialAnalistPhone: string

    @column()
    declare financialAnalistAddress: string

    @column()
    declare financialAnalistCity: string

    @column()
    declare financialAnalistState: string

    @column()
    declare financialAnalistCountry: string

    @column()
    declare financialAnalistPassword: string

    @column()
    declare financialAnalistRole: string

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @column.dateTime()
    declare deletedAt: DateTime

    @beforeSave()
   public static async hashPassword( financialAnalyst: FinancialAnalyst) {
    if (financialAnalyst.$dirty.financialAnalistPassword) {
      financialAnalyst.financialAnalistPassword = await hash.make(financialAnalyst.financialAnalistPassword) 
    }
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await hash.verify(this.financialAnalistPassword, password) 
  }
}