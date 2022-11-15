import { TodosAccess } from './todosAcess'
import { generatePresignedUrl } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const LOGGER = createLogger('helperloggertodos')
const TODO_ACCESS = new TodosAccess()

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return TODO_ACCESS.getTodosByUserId(userId);
}

export function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    LOGGER.info(`Create todo by userID: ${userId}`);
    const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
    const todoId =  uuid()
    
    return TODO_ACCESS.createTodo({
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`, 
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest
    });
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, todoId: string, userId: string): Promise<TodoUpdate> {
    return TODO_ACCESS.updateTodo(updateTodoRequest, todoId, userId);
}


export async function deleteTodo(todoId: string, userId: string): Promise<string> {
    return TODO_ACCESS.deleteTodo(todoId, userId);
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> {    
    return generatePresignedUrl(todoId);
}