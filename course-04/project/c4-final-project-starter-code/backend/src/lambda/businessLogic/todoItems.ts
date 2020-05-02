import * as uuid from 'uuid'
import {TodoItem} from "../../models/TodoItem";
import {TodoItemsAccess} from "../dataLayer/todoItemsAccess";
import {CreateTodoRequest} from "../../requests/CreateTodoRequest";
import {UpdateTodoRequest} from "../../requests/UpdateTodoRequest";
import {AttachmentsAccess} from "../dataLayer/attachmentsAccess";


const todoItemAccess = new TodoItemsAccess();
const attachmentsAccess = new AttachmentsAccess();

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

export async function updateTodoItemIfExists(userId: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<{ message: string; success: boolean; }> {
    const todoItemExists: boolean = await todoItemAccess.todoItemExists(userId, todoId);
    if (todoItemExists) {
        return await todoItemAccess.updateTodoItem(userId, todoId, updateTodoRequest);
    }
    return {message: `TodoItem with todoId ${todoId} does not exist`, success: false}
}

export async function deleteTodoItemAndAttachment(userId: string, todoId: string): Promise<{ message: string; success: boolean; }> {
    const todoItem: TodoItem = await todoItemAccess.getTodoItem(userId, todoId);
    const {attachmentUrl} = todoItem;

    if (attachmentUrl) {
        const splitUrl = attachmentUrl.split("/");
        const attachmentId: string = splitUrl[splitUrl.length - 1];
        await attachmentsAccess.deleteAttachment(attachmentId);
    }

    return await todoItemAccess.deleteTodoItem(userId, todoId);
}

export async function todoItemExists(userId: string, todoId: string): Promise<boolean> {
    return await todoItemAccess.todoItemExists(userId, todoId);
}

export async function storeAttachmentUrlInDb(userId, todoId, attachmentUrl): Promise<{ message: string; success: boolean; }> {
    return await todoItemAccess.storeAttachmentUrlInDb(userId, todoId, attachmentUrl);
}

export function getUploadUrl(attachmentId: string) {
    return attachmentsAccess.getUploadUrl(attachmentId);
}
