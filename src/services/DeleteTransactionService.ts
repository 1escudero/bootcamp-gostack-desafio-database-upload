import { getCustomRepository } from 'typeorm';


import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request) {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const findTransaction = await transactionsRepository.findOne({ where: { id } });

    if (findTransaction){
      await transactionsRepository.remove(findTransaction)
      return;
    }
    throw new AppError('Transaction not found', 400);
  }
}

export default DeleteTransactionService;
