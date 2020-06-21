import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface BalanceDTO {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<BalanceDTO> {
    const transactions = await this.find();
    const balance = transactions.reduce(
      (accumulator: BalanceDTO, transaction: Transaction) => {
        if (transaction.type === 'income') {
          accumulator.income += Number(transaction.value);
        }
        if (transaction.type === 'outcome') {
          accumulator.outcome += Number(transaction.value);
        }

        accumulator.total = accumulator.income - accumulator.outcome;
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }
}

export default TransactionsRepository;
