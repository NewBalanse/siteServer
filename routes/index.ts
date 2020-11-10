import {Router} from "express";
import homePageRouter from "./home/home.router";
import adminRouter from "./admin/admin.router";

const routes = Router();

routes.use('/', homePageRouter);
routes.use('/admin', adminRouter)

export default routes;
