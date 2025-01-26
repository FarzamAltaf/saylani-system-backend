import mongoose from "mongoose";
const { Schema } = mongoose;

const categorySchema = new Schema({
    title: { type: String, required: true, trim: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'loans' }
}, { timestamps: true })

const LoanCategory = mongoose.model("loanCategory", categorySchema, 'loanCategory');
export default LoanCategory;