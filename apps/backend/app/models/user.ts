import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { ACCESS_TOKENS, USER_ROLES, USERS } from '#database/constant/table_name'
import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from './role.ts'
import Driver from './driver.ts'
import env from '#start/env'
import FinancialAnalyst from './financial_analist.ts'
import FleetManager from './fleet_manager.ts'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(UserSchema, AuthFinder) {
  public static table = USERS

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userType:'financial_analyst' | 'fleet_manager' | 'driver'| 'safety_officer' 

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare mobile: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare isActive: boolean

  @column()
  declare fleetManagerId: number | null

  @column()
  declare driverId: number | null

  @column()
  declare financialAnalystId: number | null

  @column()
  declare safetyOfficerId: number | null

   @belongsTo(() => Driver, )
    declare driver: BelongsTo<typeof Driver>

    @belongsTo(() => FinancialAnalyst, {
      foreignKey: 'financialAnalystId',
    })
    declare financialAnalyst: BelongsTo<typeof FinancialAnalyst>

    @belongsTo(() => FleetManager, {
      foreignKey: 'fleetManagerId',
    })
    declare fleetManager: BelongsTo<typeof FleetManager>
  @manyToMany(() => Role, {
    pivotTable: USER_ROLES,
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare userRoles: ManyToMany<typeof Role>
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    table: ACCESS_TOKENS,
    expiresIn: env.get('ACCESS_TOKEN_EXPIRES_IN'),
  })

  isFleetManager(): boolean {
    return this.userType === 'fleet_manager'
  }

  isFinancialAnalyst(): boolean {
    return this.userType === 'financial_analyst'
  }

  isSafetyManager(): boolean {
    return this.userType === 'safety_officer'
  }

  isDriver(): boolean {
    return this.userType === 'driver'
  }


  static async hasPermission(userId: number, permissionKey: string): Promise<boolean> {
    const user = await User.query()
      .where('id', userId)
      .preload('userRoles', (query) => {
        query.preload('permissions')
      })
      .first()

    if (!user) return false

    if (user.userType === 'fleet_manager') {
      return true
    }

    return user.userRoles.some((role) =>
      role.permissions.some((permission) => permission.permissionKey === permissionKey)
    )
  }
}
