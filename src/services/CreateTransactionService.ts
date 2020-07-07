import { getCustomRepository, getRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  title: string;

  type: 'income' | 'outcome';

  value: number;

  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError(
        'Insuficient balance. Outcome is greater than current balance.',
      );
    }

    const categoriesRepository = getRepository(Category);
    const categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    let category_id;

    if (categoryExists) {
      category_id = categoryExists.id;
    }

    if (!categoryExists) {
      const newCategory = categoriesRepository.create({ title: category });
      await categoriesRepository.save(newCategory);
      category_id = newCategory.id;
    }

    const newTransaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
      category: categoryExists,
    });
    await transactionsRepository.save(newTransaction);
    return newTransaction;
  }
}

export default CreateTransactionService;
