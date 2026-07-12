import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fleet_managers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('full_name', 100).notNullable().defaultTo('')
      table.string('email', 254).notNullable().defaultTo('')
      table.string('password').notNullable().defaultTo('')
      table.string('phone_number', 15).notNullable().defaultTo('')
      table.string('address', 255).nullable()
      table.string('city', 100).nullable()
      table.string('state', 100).nullable()
      table.string('country', 100).nullable()
      table.string('role', 50).nullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns(
        'full_name', 'email', 'password', 'phone_number',
        'address', 'city', 'state', 'country', 'role', 'deleted_at'
      )
    })
  }
}
