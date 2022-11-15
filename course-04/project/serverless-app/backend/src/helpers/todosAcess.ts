import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';


const logger = createLogger('fortodosaccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
        logger.info("Get todo")
    
        const parameters = {
            TableName: this.todosTable,
            KeyConditionExpression: "#userId = :userId",
            ExpressionAttributeNames: {
                "#userId": "userId"
            },
            ExpressionAttributeValues: {
                ":userId": userId
            }
        };
    
        const result = await this.docClient.query(parameters).promise();
    
        return result.Items as TodoItem[];
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        logger.info("Create todo")
        
        const parameters = {
            TableName: this.todosTable,
            Item: todoItem,
        };
    
        await this.docClient.put(parameters).promise();
    
        return todoItem as TodoItem;
    }

    async updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
        logger.info("Update todo")
        
        const parameters = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            UpdateExpression: "set #nameField = :nameField, #dueDateField = :dueDateField, #doneField = :doneField",
            ExpressionAttributeNames: {
                "#nameField": "name",
                "#dueDateField": "dueDate",
                "#doneField": "done"
            },
            ExpressionAttributeValues: {
                ":nameField": todoUpdate.name,
                ":dueDateField": todoUpdate.dueDate,
                ":doneField": todoUpdate.done
            },
            ReturnValues: "ALL_NEW"
        };
    
        const result = await this.docClient.update(parameters).promise();
    
        return result.Attributes as TodoUpdate;
    }


    async deleteTodo(todoId: string, userId:string): Promise<string> {
        logger.info("Delete todo")

        const parameters = {
            TableName: this.todosTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
        };

        await this.docClient.delete(parameters).promise();

        return "" as string;
    }
}