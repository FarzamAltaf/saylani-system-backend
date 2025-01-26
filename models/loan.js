import mongoose from "mongoose";
const { Schema } = mongoose;

const LoanSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String },
    maxLoan: { type: Number },
    loanPeriod: { type: String },
}, { timestamps: true })

const Loan = mongoose.model("Loans", LoanSchema, 'loans');
export default Loan;