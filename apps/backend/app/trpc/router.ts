// app/trpc/router.ts

import { router } from './trpc.ts'
import { fleetManagerRouter } from './routers/fleet_manager.router.ts'
import { driverRouter } from './routers/driver.router.ts'
import { safetyManagerRouter } from './routers/safety_manager.router.ts'
import { financialAnalystRouter } from './routers/financial_analyst.router.ts'
import { userRouter } from './routers/user.router.ts'

export const appRouter = router({
  fleetManager: fleetManagerRouter,
  driver: driverRouter,
  safetyManager: safetyManagerRouter,
  financialAnalyst: financialAnalystRouter,
  user: userRouter,
})

export type AppRouter = typeof appRouter