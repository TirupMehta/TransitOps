import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'financial_analists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('financial_analist_name', 100).notNullable()
      table.string('financial_analist_email', 254).notNullable()
      table.string('financial_analist_phone', 15).notNullable()
      table.string('financial_analist_password').notNullable()
      table.string('financial_analist_role', 50).nullable()
      table.string('financial_analist_address', 255).nullable()
      table.string('financial_analist_city', 100).nullable()
      table.string('financial_analist_state', 100).nullable()
      table.string('financial_analist_country', 100).nullable()
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
