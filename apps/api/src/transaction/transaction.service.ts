import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction, TransactionStatus } from "./transaction.entity";
import { InitiateTransactionDto } from "./dto/initiate-transaction.dto";
import { User } from "../user/user.entity";
import { Invoice, InvoiceStatus } from "../finance/invoice.entity";


// TransactionService contains the business logic for handling transactions
// It interacts with the database to create and manage transaction records
// and processes webhooks from payment gateways like Paystack.
@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>
  ) {}

  async initiate(
    initiateTransactionDto: InitiateTransactionDto,
    user: any
  ): Promise<any> {
    const { invoiceId } = initiateTransactionDto;

    const invoice = await this.invoicesRepository.findOne({
      where: { id: invoiceId },
      relations: ["feeStructure"],
    });

    if (!invoice) {
      throw new NotFoundException("Invoice not found");
    }

    const reference = `EDC-${Date.now()}`;
    const amount = invoice.feeStructure.amount;

    const transaction = this.transactionsRepository.create({
      amount,
      reference,
      status: TransactionStatus.PENDING,
      gateway: "paystack",
      invoiceId: invoice.id,
      paidById: user.userId,
    });

    await this.transactionsRepository.save(transaction);

    return {
      message: "Transaction initiated successfully",
      authorization_url: `https://checkout.paystack.com/${reference}`,
      reference: reference,
    };
  }

  // This method handles incoming webhooks from the payment gateway
  async processWebhook(event: any): Promise<void> {
    // In a real app, you would verify the event signature here for security
    const { event: eventType, data } = event;

    if (eventType === "charge.success") {
      const reference = data.reference;

      // Find the transaction in our database
      const transaction = await this.transactionsRepository.findOneBy({
        reference,
      });
      if (!transaction) {
        // If we don't find the transaction, we can ignore the event
        console.log(
          `Webhook Error: Transaction with reference ${reference} not found.`
        );
        return;
      }

      // Update the transaction status
      transaction.status = TransactionStatus.SUCCESSFUL;
      await this.transactionsRepository.save(transaction);

      // Find and update the related invoice
      const invoice = await this.invoicesRepository.findOneBy({
        id: transaction.invoiceId,
      });
      if (invoice) {
        invoice.status = InvoiceStatus.PAID;
        invoice.paidAt = new Date().toISOString().split("T")[0]; // Set paid date
        await this.invoicesRepository.save(invoice);
      }
    }
    // You could also handle other events like 'charge.failed'
  }
}
