import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { EmailService } from "./email.service";
import {
  EmailVerificationInput,
  EmailVerificationOutput,
} from "./dtos/email.verification.dto";
import { INPUT_ARG } from "src/baseData/consts/base.consts";
import { EmailVerification } from "./entities/email.verification.entity";

@Resolver((of) => EmailVerification)
export class EmailResolver {
  constructor(private readonly emailService: EmailService) {}

  @Mutation((returns) => EmailVerificationOutput)
  verifierEmailCode(
    @Args(INPUT_ARG) { verificationCode }: EmailVerificationInput
  ) {
    return this.emailService.verifierEmailCode(verificationCode);
  }
}
