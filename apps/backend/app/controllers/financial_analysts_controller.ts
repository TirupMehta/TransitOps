// app/controllers/financial_analysts_controller.ts

import { inject } from '@adonisjs/core'
import FinancialAnalystService from '#services/financial_analyst'

@inject()
export default class FinancialAnalystsController {
  constructor(private service: FinancialAnalystService) { }

  async index(input: { page: number; perPage: number; search?: string }) {
    return this.service.list(input)
  }

  async store(input: any) {
    return this.service.create(input)
  }

  async show(input: { id: number }) {
    return this.service.getById(input.id)
  }

  async update(input: any) {
    const { id, ...data } = input
    return this.service.update({ id, ...data })
  }

  async delete(input: { id: number }) {
    return this.service.delete(input.id)
  }

  async restore(input: { id: number }) {
    return this.service.restore(input.id)
  }
}
