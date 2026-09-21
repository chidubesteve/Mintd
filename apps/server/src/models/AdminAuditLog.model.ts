/**
 * AdminAuditLog
 *
 * A record of every action taken from the admin dashboard, for
 * traceability. Written alongside the action itself (same request), never
 * edited or deleted afterwards.
 */
import { model, Schema } from 'mongoose';

const AdminAuditLogSchema = new Schema(
    {
        admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        action: {
            type: String,
            required: true,
            enum: [
                'WATCH_APPROVED',
                'WATCH_REJECTED',
                'CATALOGUE_ENTRY_ADDED',
            ],
        },
        targetType: {
            type: String,
            required: true,
            enum: ['Watch', 'WatchCatalogue'],
        },
        targetId: { type: String, required: true },
        details: { type: Schema.Types.Mixed },
    },
    { timestamps: true },
);

AdminAuditLogSchema.index({ createdAt: -1 });

export const AdminAuditLog = model('AdminAuditLog', AdminAuditLogSchema);
