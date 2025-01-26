import express from "express";
import Joi from "joi";
import "dotenv/config";
import { sendEmail } from "../../utils/email.js";
import Loan from "../../models/loan.js";

const router = express.Router();

const loanSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().optional(),
    maxloan: Joi.number().required(),
    loanperiod: Joi.string().required(),
});

router.post("/addloan", async (req, res) => {
    const { error } = loanSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { title, description, maxloan, loanperiod } = req.body;

    try {
        const newLoan = new Loan({
            title,
            description,
            maxLoan: maxloan,
            loanPeriod: loanperiod,
        });

        const savedLoan = await newLoan.save();
        res.status(201).json({ success: true, data: savedLoan });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Failed to add loan" });
    }
});


router.get("/getloans", async (req, res) => {
    try {
        const loans = await Loan.find(); // Fetch all loans from the database
        if (loans.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No loans found.",
            });
        }
        res.status(200).json({
            success: true,
            data: loans, // Return the list of loans
        });
    } catch (error) {
        console.error("Error fetching loans: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message,
        });
    }
});



export default router;