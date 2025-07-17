import {
  Controller,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
} from "@nestjs/common";
import { TransactionService } from "./transaction.service";
import { InitiateTransactionDto } from "./dto/initiate-transaction.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../user/user.entity";
import { GetUser } from "src/auth/get-user.decorator";

// TransactionController handles routes related to transactions
@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post("initiate")
  @UseGuards(JwtAuthGuard) // Protect this route
  initiate(
    @Body(new ValidationPipe())
    initiateTransactionDto: InitiateTransactionDto,
    @GetUser() user: User
  ) {
    return this.transactionService.initiate(initiateTransactionDto, user);
  }

  // New webhook endpoint for Paystack
  @Post("webhook/paystack")
  @HttpCode(200) // Respond with 200 OK to acknowledge receipt of the webhook
  handlePaystackWebhook(@Body() payload: any) {
    // This endpoint is public, but in a real app, you MUST verify the signature
    // from the 'x-paystack-signature' header to ensure it's a legitimate request.
    return this.transactionService.processWebhook(payload);
  }
}
