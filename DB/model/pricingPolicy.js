import mongoose from 'mongoose';

export const pricingPolicySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255
    },
    description: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    workspaceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    }
}, { timestamps: true });

export const pricingModel = mongoose.model('Pricing', pricingPolicySchema);
