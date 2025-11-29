import { NextRequest, NextResponse } from 'next/server';
import { connectMongoose } from '@/lib/mongooseConnection';
import mongoose from 'mongoose';


// Helper function to convert Extended JSON ObjectId format to mongoose ObjectId
function convertObjectIds(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(item => convertObjectIds(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
        if (obj.$oid && typeof obj.$oid === 'string') {
            return new mongoose.Types.ObjectId(obj.$oid);
        }
        
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
            converted[key] = convertObjectIds(value);
        }
        return converted;
    }
    
    return obj;
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ database: string; collection: string }> }
) {
    try {
        const { database, collection } = await params;
        const body = await request.json();
        const { aggregationPipeline } = body;

        if (!aggregationPipeline) {
            return NextResponse.json(
                { error: 'aggregationPipeline is required' },
                { status: 400 }
            );
        }

        await connectMongoose();

        // Get the collection using Mongoose connection to specified database
        const connection = mongoose.connection.useDb(database);
        const collectionObj = connection.collection(collection);
        // Convert Extended JSON ObjectId format to actual ObjectIds
        const convertedPipeline = convertObjectIds(aggregationPipeline);
        const results = await collectionObj.aggregate(convertedPipeline).toArray();

        return NextResponse.json({
            status: 'success',
            database,
            collection,
            data: results
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search resource', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
