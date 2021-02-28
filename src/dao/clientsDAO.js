import { ObjectId } from "bson";

import config from "../configs/config";
import logger from "../configs/logger";

class ClientsDAO {
  static clients;
  static async injectDB(conn) {
    if (ClientsDAO.clients) {
      return;
    }
    try {
      ClientsDAO.clients = await conn.db(config.database).collection("clients");
      logger.info(
        `Connected to clients collection of ${config.database} database.`,
        "ClientsDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "ClientsDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createClient(clientInfo) {
    try {
      const info = {
        user: ObjectId(clientInfo.user),
        ...clientInfo,
      };
      const result = await ClientsDAO.clients.insertOne(info);
      if (result && result.insertedCount === 1) {
        const data = result.ops[0];
        return {
          success: true,
          data: data,
          statusCode: 201,
        };
      }
    } catch (error) {
      if (String(error).startsWith("MongoError: E11000 duplicate key error")) {
        logger.error(
          `Error occurred while adding new profile, ${error.message}.`,
        );
        return {
          success: false,
          data: {
            error:
              "A freelancer with the given user id or phone already exists.",
          },
          statusCode: 409,
        };
      }
      logger.error(
        `Error occurred while adding new profile, ${error.message}.`,
      );
      throw error;
    }
  }
  static async getClients({ page = 0, clientsPerPage = 10, filter = {} } = {}) {
    const sort = ClientsDAO.DEFAULT_SORT;
    const projection = {};
    let cursor;
    try {
      cursor = await ClientsDAO.clients
        .find(filter)
        .project(projection)
        .sort(sort);
    } catch (e) {
      logger.error(`Unable to issue find command, ${e.message}`);
      return {
        success: false,
        data: [],
        totalNumClients: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(clientsPerPage))
      .limit(parseInt(clientsPerPage));
    try {
      const documents = await displayCursor.toArray();
      const totalNumClients =
        parseInt(page) === 0 ? await ClientsDAO.clients.countDocuments({}) : 0;
      return {
        success: true,
        data: documents,
        totalNumClients,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
  static async getClientByPhone(phoneNumber) {
    return await ClientsDAO.clients.findOne({
      "phone.phoneNumber": phoneNumber,
    });
  }
  static async getClientById(id) {
    try {
      const pipeline = [
        { $match: { _id: ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
        {
          $project: {
            "user.password": 0,
            "user.role": 0,
          },
        },
      ];

      const client = await ClientsDAO.clients.aggregate(pipeline).next();
      if (client) {
        return {
          success: true,
          data: client,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getClientById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getClientById()",
      );
      throw e;
    }
  }
}

export default ClientsDAO;
