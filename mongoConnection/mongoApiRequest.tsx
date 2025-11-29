
import { toast } from "sonner"


interface mongoApiRequestInterface {
    url: string;
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    payload: any;

}


async function mongoApiRequest({
    url, method, payload
}: mongoApiRequestInterface) {


    try {

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (response.ok) {

            return { status: 'success', data: response  };

        } else {

            return { status: 'failed', data: response};

        }

    } catch (Err) {
        toast.error("Failed to contact server");
        console.error("Failed to contact database", Err)
        return { status: 'error', data: [] };
    }
}

async function createResource(database: string, collectionName: string, documentData: any) {
    return mongoApiRequest({
        url: `/api/${database}/${collectionName}`,
        method: 'POST',
        payload: documentData
    });
}

async function searchResource(database: string, collectionName: string, aggregationPipeline: any[]) {
    return mongoApiRequest({
        url: `/api/${database}/${collectionName}/search`,
        method: 'POST',
        payload: { aggregationPipeline }
    });
}

async function updateResource(database: string, collectionName: string, id: string, updateData: any) {
    return mongoApiRequest({
        url: `/api/${database}/${collectionName}/${id}`,
        method: 'PATCH',
        payload: updateData
    });
}

async function deleteResource(database: string, collectionName: string, id: string) {
    return mongoApiRequest({
        url: `/api/${database}/${collectionName}/${id}`,
        method: 'DELETE',
        payload: {}
    });
}

export default mongoApiRequest
export { createResource, searchResource, updateResource, deleteResource }