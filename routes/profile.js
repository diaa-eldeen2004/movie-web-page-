import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/user.js';

const router = express.Router();

// Get profile page
router.get('/', auth(), async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('watchlist')
            .populate('favorites');
            
        res.render('pages/profile', {
            user,
            title: 'My Profile'
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).render('pages/error', {
            message: 'Error loading profile'
        });
    }
});

// Update profile
router.post('/update', auth(), async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // Check if email is already taken by another user
        if (email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            user: updatedUser,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Change password
router.post('/change-password', auth(), async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
});

export default router; 