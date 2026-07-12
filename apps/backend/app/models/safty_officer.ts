import { BaseModel, column } from "@adonisjs/lucid/orm";
import { DateTime } from "luxon";

export default class SafetyOfficer extends BaseModel {

    @column({ isPrimary: true })
    declare id: number

    @column()
    declare safetyOfficerName: string

    @column()
    declare safetyOfficerEmail: string

    @column()
    declare safetyOfficerPhone: string

    @column()
    declare safetyOfficerAddress: string

    @column()
    declare safetyOfficerCity: string

    @column()
    declare safetyOfficerState: string

    @column()
    declare safetyOfficerCountry: string

    @column()
    declare safetyOfficerPassword: string

    @column()
    declare safetyOfficerRole: string

    @column()
    declare isActive: boolean

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime 

    @column.dateTime()
    declare deletedAt: DateTime

}