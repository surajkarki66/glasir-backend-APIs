import { Router } from "express";

import { UserController } from "../controllers/index";
import { userSchema } from "../helpers/index";
import dataValidation from "../middlewares/data-validation";

const router = new Router();
router
  .route("/signup")
  .post(dataValidation(userSchema.userSIGNUP, "body"))
  .post(UserController.signup);

router
  .route("/activate/:token")
  .get(dataValidation(userSchema.userACTIVATION, "params"))
  .get(UserController.activation);

router
  .route("/verify-email/:id")
  .get(dataValidation(userSchema.userACTIVATIONEMAIL, "params"))
  .get(UserController.verifyEmail);
export default router;
