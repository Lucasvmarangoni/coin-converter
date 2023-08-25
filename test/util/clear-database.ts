import { Connection } from 'mongoose';

export const clearDatabase = async (connection: Connection): Promise<void> => {
  const collections = connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
