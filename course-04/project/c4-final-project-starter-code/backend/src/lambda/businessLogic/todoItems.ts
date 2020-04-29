import * as uuid from 'uuid'
import {TodoItem} from "../../models/TodoItem";
import {TodoItemsAccess} from "../dataLayer/todoItemsAccess";
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";


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
