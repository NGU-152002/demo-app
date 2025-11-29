import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongooseConnection';
import mongoose from 'mongoose';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ database: string; collection: string }> }
) {
    try {
        const { database, collection } = await params;
        const documentData = await request.json();

        if (!documentData || Object.keys(documentData).length === 0) {
            return NextResponse.json(
                { error: 'Document data is required' },
                { status: 400 }
            );
        }

        await connectMongoose();

        const connection = mongoose.connection.useDb(database);
        const collectionObj = connection.collection(collection);

        const document = {
            ...documentData,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collectionObj.insertOne(document);

        return NextResponse.json({
            status: 'success',
            database,
            collection,
            insertedId: result.insertedId.toString(),
            message: 'Document created'
        }, { status: 201 });

    } catch (error) {
        console.error('Create error:', error);
        return NextResponse.json(
            { error: 'Failed to create document', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 400 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ database: string; collection: string }> }
) {
    try {
        const { database, collection } = await params;
        const searchParams = request.nextUrl.searchParams;

        const skip = parseInt(searchParams.get('skip') || '0');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || '_id';
        const sortOrder = searchParams.get('sortOrder') === 'desc' ? -1 : 1;

        await connectMongoose();

        const connection = mongoose.connection.useDb(database);
        const collectionObj = connection.collection(collection);

        const documents = await collectionObj
            .find({})
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await collectionObj.countDocuments();

        return NextResponse.json({
            status: 'success',
            database,
            collection,
            data: documents,
            pagination: {
                total,
                skip,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch documents', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
