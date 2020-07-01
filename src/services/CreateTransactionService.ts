import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';


interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category }: Request ): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    let findCategory = await categoriesRepository.findOne({ where: { title: category } });

    if(type == 'income') {
      if(findCategory) {
        const transaction = transactionsRepository.create({ title: title, value: value, type: type, category: findCategory });
        await transactionsRepository.save(transaction)
        return transaction;
      }

      findCategory = categoriesRepository.create({ title: category })
      await categoriesRepository.save(findCategory)

      const transaction = transactionsRepository.create({ title: title, value: value, type: type, category: findCategory });
      await transactionsRepository.save(transaction)

      return transaction;
    }

    //Se for outcome, fazer um reduce nas transacoes do banco de dados somando os incomes e os outcomes e retornando o balance.
    const balance = await transactionsRepository.getBalance();

    if(balance.total >= value){
      if(findCategory) {
        const transaction = transactionsRepository.create({ title: title, value: value, type: type, category: findCategory });
        await transactionsRepository.save(transaction)
        return transaction;
      }
      findCategory = categoriesRepository.create({ title: category })
      await categoriesRepository.save(findCategory)

      const transaction = transactionsRepository.create({ title: title, value: value, type: type, category: findCategory });
      await transactionsRepository.save(transaction)

      return transaction;
    }
      throw new AppError('Not enough balance', 400);
  }
}

export default CreateTransactionService;
