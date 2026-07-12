// app/trpc/router.ts

import { fleetManagerRouter } from "./routers/fleet_manager.router.ts";
import { router } from "./trpc.ts";

export const appRouter = router({
    fleetManager: fleetManagerRouter,
})