import { ObjectId } from "mongodb";

import logger from "../configs/logger";
import config from "../configs/config";

class UsersDAO {
  static #users;
  static #DEFAULT_SORT = [["username", -1]];

  static async injectDB(conn) {
    if (UsersDAO.#users) {
      return;
    }
    try {
      UsersDAO.#users = await conn.db(config.database).collection("users");
      logger.info(
        `Connected to users collection of ${config.database} database.`,
        "UsersDAO.injectDB()",
      );
    } catch (e) {
      logger.error(
        `Error while injecting DB: ${e.message}`,
        "UsersDAO.injectDB()",
      );
      throw e;
    }
  }
  static async createUser(userInfo) {
    try {
      const result = await UsersDAO.#users.insertOne(userInfo);
      if (result.insertedCount === 1) {
        const data = result.ops[0];
        return {
          success: true,
          data: data,
          statusCode: 201,
        };
      }
    } catch (e) {
      if (String(e).startsWith("MongoError: Document failed validation")) {
        return {
          success: false,
          data: { error: "Document failed validation" },
          statusCode: 422,
        };
      }
      logger.error(`Error occurred while adding new user, ${e}.`);
      throw e;
    }
  }
  static async getUsers({ page = 0, usersPerPage = 10, filter = {} } = {}) {
    const sort = UsersDAO.#DEFAULT_SORT;
    const projection = { password: 0 };
    let cursor;
    try {
      cursor = await UsersDAO.#users
        .find(filter)
        .project(projection)
        .sort(sort);
    } catch (e) {
      logger.error(`Unable to issue find command, ${e.message}`);
      return {
        success: false,
        data: [],
        totalNumUsers: 0,
        statusCode: 404,
      };
    }
    const displayCursor = cursor
      .skip(parseInt(page) * parseInt(usersPerPage))
      .limit(parseInt(usersPerPage));
    try {
      const documents = await displayCursor.toArray();
      const totalNumUsers =
        parseInt(page) === 0 ? await UsersDAO.#users.countDocuments({}) : 0;
      return {
        success: true,
        data: documents,
        totalNumUsers,
        statusCode: documents.length > 0 ? 200 : 404,
      };
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
      );
      throw e;
    }
  }
  static async getUserByEmail(email) {
    return await UsersDAO.#users.findOne({
      email: email,
    });
  }
  static async getUserByUsername(username) {
    return await UsersDAO.#users.findOne({
      username: username,
    });
  }
  static async getUserById(id) {
    try {
      const query = {
        _id: ObjectId(id),
      };
      const user = await UsersDAO.#users.findOne(query);
      if (user) {
        return {
          success: true,
          data: user,
          statusCode: 200,
        };
      } else {
        const message = "No document matching id: " + id + " could be found!";
        logger.error(message, "getUserById()");
        return {
          success: false,
          data: {},
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(
        `Unable to convert cursor to array or problem counting documents, ${e.message}`,
        "getUserById()",
      );
      throw e;
    }
  }
  static async updateUser(id, updateObject) {
    try {
      const result = await UsersDAO.#users.updateOne(
        {
          _id: ObjectId(id),
        },
        {
          $set: updateObject,
        },
      );
      if (
        (result.modifiedCount === 1 && result.matchedCount === 1) ||
        result.matchedCount === 1
      ) {
        return {
          success: true,
          data: {
            message: "Updated successfully.",
          },
          statusCode: 201,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No user exist with this userId.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(`Error occurred while updating user, ${e}`, "updateUser()");
      throw e;
    }
  }
  static async deleteUser(id) {
    try {
      const result = await UsersDAO.#users.deleteOne({ _id: ObjectId(id) });
      if (result.deletedCount === 1) {
        return {
          success: true,
          data: { message: "Deleted successfully." },
          statusCode: 200,
        };
      } else {
        return {
          success: false,
          data: {
            error: "No user exist with this userId.",
          },
          statusCode: 404,
        };
      }
    } catch (e) {
      logger.error(`Error occurred while deleting user, ${e}`, "deleteUser()");
      throw e;
    }
  }
}

export default UsersDAO;
