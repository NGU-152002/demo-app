import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongooseConnection';
import mongoose from 'mongoose';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ database: string; collection: string; id: string }> }
) {
    try {
        const { database, collection, id } = await params;
        const updateData = await request.json();

        if (!updateData || Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: 'Update data is required' },
                { status: 400 }
            );
        }

        await connectMongoose();

        const connection = mongoose.connection.useDb(database);
        const collectionObj = connection.collection(collection);

        const result = await collectionObj.updateOne(
            { _id: new mongoose.Types.ObjectId(id) },
            { $set: { ...updateData, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            database,
            collection,
            id,
            modifiedCount: result.modifiedCount,
            message: 'Resource updated'
        });

    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json(
            { error: 'Failed to update resource', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ database: string; collection: string; id: string }> }
) {
    try {
        const { database, collection, id } = await params;

        await connectMongoose();

        const connection = mongoose.connection.useDb(database);
        const collectionObj = connection.collection(collection);

        const result = await collectionObj.deleteOne({ _id: new mongoose.Types.ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            status: 'success',
            database,
            collection,
            id,
            message: 'Resource deleted'
        });

    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete resource', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
