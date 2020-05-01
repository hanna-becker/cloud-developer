import * as uuid from 'uuid'
import {TodoItem} from "../../models/TodoItem";
import {TodoItemsAccess} from "../dataLayer/todoItemsAccess";
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";


const todoItemAccess = new TodoItemsAccess();

export async function getTodoItemsByUser(userId: string): Promise<TodoItem[]> {
    return await todoItemAccess.getTodoItemsByUser(userId);
}

export async function createTodoItem(createTodoItemRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    return await todoItemAccess.createTodoItem({
        userId,
        todoId: uuid.v4(),
        createdAt: new Date().toISOString(),
        name: createTodoItemRequest.name,
        dueDate: createTodoItemRequest.dueDate,
        done: false
    })
}

export async function updateTodoItem(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<{ message: string; success: boolean; }> {
    return await todoItemAccess.updateTodoItem(userId, todoId, updateTodoRequest);
}

export async function deleteTodoItem(userId: string, todoId: string): Promise<{ message: string; success: boolean; }> {
    return await todoItemAccess.deleteTodoItem(userId, todoId);
}

export async function todoItemExists(userId: string, todoId: string): Promise<boolean> {
    return await todoItemAccess.todoItemExists(userId, todoId);
}

export async function storeAttachmentUrlInDb(userId, todoId, imageUrl): Promise<{ message: string; success: boolean; }> {
    return await todoItemAccess.storeAttachmentUrlInDb(userId, todoId, imageUrl);
}
