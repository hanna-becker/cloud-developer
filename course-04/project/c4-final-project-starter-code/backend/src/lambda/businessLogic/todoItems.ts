import * as uuid from 'uuid'
import {TodoItem} from "../../models/TodoItem";
import {TodoItemsAccess} from "../dataLayer/todoItemsAccess";
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";


const todoItemAccess = new TodoItemsAccess();

export async function getAllTodoItems(): Promise<TodoItem[]> {
    return todoItemAccess.getAllTodoItems();
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

export async function updateTodoItem(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<{ message: string; success: boolean; }> {
    const correctUserId: boolean = await verifyUserId(todoId, userId);
    if (correctUserId) {
        return await todoItemAccess.updateTodoItem(todoId, updateTodoRequest);
    }
    return {
        success: false,
        message: 'Permission denied - TodoItem was created by a different user'
    };
}

export async function deleteTodoItem(todoId: string, userId: string): Promise<{ message: string; success: boolean; }> {
    const correctUserId: boolean = await verifyUserId(todoId, userId);
    if (correctUserId) {
        return await todoItemAccess.deleteTodoItem(todoId);
    }
    return {
        success: false,
        message: 'Permission denied - TodoItem was created by a different user'
    };
}

async function verifyUserId(todoId: string, userId: string): Promise<boolean> {
    const todoItem: TodoItem = await todoItemAccess.getTodoItemById(todoId);
    return todoItem.userId === userId;
}
