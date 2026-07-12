import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'drivers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('driver_name', 100).notNullable()
      table.string('driver_email', 254).notNullable()
      table.string('driver_phone', 15).notNullable()
      table.string('driver_license_number', 50).notNullable()
      table.string('driver_license_expiry_date', 20).notNullable()
      table.string('driver_password').notNullable()
      table.string('driver_role', 50).nullable()
      table.string('driver_address', 255).nullable()
      table.string('driver_city', 100).nullable()
      table.string('driver_state', 100).nullable()
      table.string('driver_country', 100).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
