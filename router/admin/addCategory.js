import express from "express";
import Joi from "joi";
import "dotenv/config";
// import { sendEmail } from "../../utils/email.js";
import LoanCategory from "../../models/loanCategory.js";

const router = express.Router();

const loanCategorySchema = Joi.object({
    title: Joi.string().required(),
    loanId: Joi.string().required(),
});


router.post("/addCategory", async (req, res) => {
    const { error } = loanCategorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { title, loanId } = req.body;

    try {
        const newLoanCategory = new LoanCategory({
            title,
            loanId,
        });

        const savedLoanCategory = await newLoanCategory.save();
        res.status(201).json({ success: true, data: savedLoanCategory });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: "Failed to add loan category" });
    }
});



router.get("/getCategory", async (req, res) => {
    const { loanId } = req.query;  // Get loanId from query parameters

    // If loanId is provided, filter categories by loanId
    const filter = loanId ? { loanId } : {};

    try {
        const loanCategories = await LoanCategory.aggregate([
            {
                $match: filter,  // Apply filter to match categories by loanId
            },
            {
                $lookup: {
                    from: "loans", // Name of the Loan collection
                    localField: "loanId", // Field in LoanCategory
                    foreignField: "_id", // Field in Loan
                    as: "loanDetails", // Output array
                },
            },
            {
                $unwind: "$loanDetails", // Unwind the loanDetails array to simplify the structure
            },
        ]);

        if (loanCategories.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No loan categories found.",
            });
        }

        res.status(200).json({
            success: true,
            data: loanCategories,
        });

    } catch (error) {
        console.error("Error fetching loan categories: ", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message,
        });
    }
});





export default router;