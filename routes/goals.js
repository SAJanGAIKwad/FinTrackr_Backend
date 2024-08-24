import express from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth.js';
import Goal from '../models/Goal.js';

const router = express.Router();

// Create a goal
router.post(
    '/',
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty(),
            check('targetAmount', 'Target amount must be a number').isNumeric(),
            check('deadline', 'Deadline is required').not().isEmpty(),
            check('currentAmount', 'Current amount must be a number').optional().isNumeric(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, targetAmount, deadline, currentAmount = 0 } = req.body;
        try {
            const newGoal = new Goal({
                userId: req.user.id,
                title,
                targetAmount,
                deadline,
                currentAmount,
            });
            const goal = await newGoal.save();
            res.json(goal);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// Get all goals for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        res.json(goals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a goal
router.put(
    '/:id',
    [
        auth,
        [
            check('currentAmount', 'Current amount must be a number').isNumeric(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentAmount } = req.body;

        try {
            let goal = await Goal.findById(req.params.id);

            if (!goal) return res.status(404).json({ msg: 'Goal not found' });

            if (goal.userId.toString() !== req.user.id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }

            goal = await Goal.findByIdAndUpdate(
                req.params.id,
                { $set: { currentAmount } },
                { new: true }
            );

            res.json(goal);
        } catch (err) {
            console.error(err.message);
            res.status (500).send('Server Error');
        }
    }
);

// Delete a goal
router.delete('/:id', auth, async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);

        if (!goal) return res.status(404).json({ msg: 'Goal not found' });

        if (goal.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Goal.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Goal removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
