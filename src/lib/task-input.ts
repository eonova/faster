export type TaskPriority = "low" | "normal" | "high";

export interface TaskInput {
  title: string;
  priority: TaskPriority;
}

const priorities = new Set<TaskPriority>(["low", "normal", "high"]);

export function parseTaskInput(data: unknown): TaskInput {
  if (typeof data !== "object" || data === null) {
    throw new Error("Task input must be an object");
  }

  const input = data as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";

  if (title.length < 2 || title.length > 80) {
    throw new Error("Title must be between 2 and 80 characters");
  }

  if (typeof input.priority !== "string" || !priorities.has(input.priority as TaskPriority)) {
    throw new Error("Priority must be low, normal, or high");
  }

  return { title, priority: input.priority as TaskPriority };
}
