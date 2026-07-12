import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'safety_officers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('safety_officer_name', 100).notNullable()
      table.string('safety_officer_email', 254).notNullable()
      table.string('safety_officer_phone', 15).notNullable()
      table.string('safety_officer_password').notNullable()
      table.string('safety_officer_role', 50).nullable()
      table.string('safety_officer_address', 255).nullable()
      table.string('safety_officer_city', 100).nullable()
      table.string('safety_officer_state', 100).nullable()
      table.string('safety_officer_country', 100).nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
