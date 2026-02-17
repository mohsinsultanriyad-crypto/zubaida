
/**
 * MongoDB Atlas Data API Service
 * 
 * Instructions:
 * To enable live sync, replace API_KEY with your Atlas Data API Key.
 * This key is injected via environment in standard production deployments.
 */

const CLUSTER_NAME = "Cluster0";
const DATABASE_NAME = "fastep_work";
const DATA_SOURCE = "mongodb-atlas";
const BASE_URL = "https://data.mongodb-api.com/app/data-backend/endpoint/data/v1";

// NOTE: Set your API Key here for persistent cloud storage.
const API_KEY = ""; 

async function mongoRequest(action: string, collection: string, body: any) {
  if (!API_KEY) {
    // Silent fail to allow mock data usage if cloud isn't configured yet
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/action/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Request-Headers": "*",
        "api-key": API_KEY,
      },
      body: JSON.stringify({
        dataSource: DATA_SOURCE,
        database: DATABASE_NAME,
        collection: collection,
        ...body,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Cloud Error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`MongoDB ${action} failed:`, error);
    return null;
  }
}

export const db = {
  /**
   * Fetches all documents from a specific cloud collection
   */
  async getAll<T>(collection: string): Promise<T[]> {
    const res = await mongoRequest("find", collection, { filter: {} });
    return res?.documents || [];
  },

  /**
   * Upserts a single document by its internal ID
   */
  async upsert(collection: string, id: string, data: any) {
    return await mongoRequest("updateOne", collection, {
      filter: { id: id },
      update: { $set: data },
      upsert: true,
    });
  },

  /**
   * Deletes a document by ID
   */
  async delete(collection: string, id: string) {
    return await mongoRequest("deleteOne", collection, {
      filter: { id: id },
    });
  },

  /**
   * Iterates and syncs a batch of documents to ensure cloud consistency
   */
  async saveBatch(collection: string, documents: any[]) {
    // Batch upsert to ensure no data loss during state updates
    for (const doc of documents) {
      if (doc.id) {
        await this.upsert(collection, doc.id, doc);
      }
    }
  }
};
