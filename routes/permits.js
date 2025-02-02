const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Permit = require('../models/permit');

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Submit new permit application
router.post('/', auth, async (req, res) => {
    try {
        console.log('Creating new permit with status: Pending');
        // Get uploaded files
        const files = req.files || [];
        
        // Process uploaded files
        const documents = files.map(file => ({
            fileName: file.originalname,
            filePath: `/uploads/${file.filename}`,
            fileType: file.mimetype
        }));

        // Create permit data
        const permitData = {
            userId: req.user._id,
            applicantName: req.user.fullName,
            propertyAddress: req.body.propertyAddress,
            propertyType: req.body.propertyType,
            constructionType: req.body.constructionType,
            plotArea: Number(req.body.plotArea),
            buildingArea: Number(req.body.buildingArea),
            estimatedCost: Number(req.body.estimatedCost),
            documents: documents,
            status: 'Pending'
        };

        // Validate required fields
        const requiredFields = ['propertyAddress', 'propertyType', 'constructionType', 'plotArea', 'buildingArea', 'estimatedCost'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate numeric fields
        const numericFields = ['plotArea', 'buildingArea', 'estimatedCost'];
        const invalidFields = numericFields.filter(field => isNaN(Number(req.body[field])) || Number(req.body[field]) < 0);
        
        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: `Invalid values for fields: ${invalidFields.join(', ')}`
            });
        }

        // Create and save permit
        const permit = new Permit(permitData);
        await permit.save();

        res.status(201).json({
            message: 'Permit application submitted successfully',
            permit: permit
        });
    } catch (error) {
        console.error('Error submitting permit:', error);
        res.status(500).json({
            error: 'Failed to submit permit application. ' + error.message
        });
    }
});

// Get user's permit applications
router.get('/my-permits', auth, async (req, res) => {
    try {
        const permits = await Permit.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json(permits);
    } catch (error) {
        res.status(500).json({
            error: 'Error fetching permits: ' + error.message
        });
    }
});

// Admin Routes

// Get all permits (admin only)
router.get('/all', auth, isAdmin, async (req, res) => {
    try {
        const permits = await Permit.find()
            .sort({ createdAt: -1 });
        res.json(permits);
    } catch (error) {
        console.error('Error fetching all permits:', error);
        res.status(500).json({ error: 'Failed to fetch permits' });
    }
});

// Update permit status (admin only)
router.put('/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status, comments } = req.body;
        console.log(`Attempting to update permit ${req.params.id} status to: ${status}`);
        // Validate status
        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            console.error(`Invalid status received: ${status}`);
            return res.status(400).json({ 
                error: `Invalid status: "${status}". Valid statuses are: ${validStatuses.join(', ')}`
            });
        }
        const permit = await Permit.findById(req.params.id);
        if (!permit) {
            console.error(`Permit not found: ${req.params.id}`);
            return res.status(404).json({ error: 'Permit not found' });
        }
        console.log(`Updating permit status from ${permit.status} to ${status}`);
        permit.status = status;
        permit.comments = comments;
        permit.updatedAt = Date.now();
        await permit.save();
        console.log(`Successfully updated permit ${req.params.id} status to ${status}`);
        res.json({ 
            message: `Status successfully updated to "${status}"`, 
            permit 
        });
    } catch (error) {
        console.error('Error updating permit status:', error);
        res.status(500).json({ error: 'Failed to update permit status' });
    }
});

// Get permit details (admin only)
router.get('/:id', auth, isAdmin, async (req, res) => {
    try {
        const permit = await Permit.findById(req.params.id);
        if (!permit) {
            return res.status(404).json({ error: 'Permit not found' });
        }
        res.json(permit);
    } catch (error) {
        console.error('Error fetching permit details:', error);
        res.status(500).json({ error: 'Failed to fetch permit details' });
    }
});

module.exports = router;
