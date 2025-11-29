import { MongoClient, ObjectId } from 'mongodb';

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const uri = process.env.MONGODB_URL;

    if (!uri) {
        throw new Error('Missing MONGODB_URL environment variable');
    }

    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;

    return client;
}

export async function getDatabase(databaseName: string) {
    const client = await connectToDatabase();
    return client.db(databaseName);
}

export async function getCollection(databaseName: string, collectionName: string) {
    const db = await getDatabase(databaseName);
    return db.collection(collectionName);
}

export { ObjectId };
