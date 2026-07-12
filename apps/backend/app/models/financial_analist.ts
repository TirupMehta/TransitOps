import { BaseModel, column } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";

export default class FinancialAnalyst extends BaseModel{
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
}