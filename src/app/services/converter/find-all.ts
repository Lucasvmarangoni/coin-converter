import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Transactions, Transaction } from "../../models/transactions";
import { ResponseData } from "./converter";

@Injectable()
export class FindAllService {

    constructor(
        @InjectModel('TransactionModel')
        private transactionsModel: Model<Transaction>) { }

    execute(): Promise<ResponseData[]> {        
        return this.transactionsModel.find();
    }
}
