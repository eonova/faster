import { createServerFn } from "@tanstack/solid-start";

import { parseTaskInput, type TaskInput, type TaskPriority } from "./task-input";

export type { TaskInput, TaskPriority };

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  done: boolean;
  createdAt: number;
}

export interface WorkspacePlugin {
  id: string;
  name: string;
  benefit: string;
}

export interface Workspace {
  tasks: Task[];
  plugins: WorkspacePlugin[];
}

let tasks: Task[] = [
  {
    id: "seed-stylex",
    title: "确认 StyleX 样式已经完成 SSR 输出",
    priority: "high",
    done: false,
    createdAt: Date.now(),
  },
  {
    id: "seed-devframe",
    title: "打开 Devframe Hub 并试用插件面板",
    priority: "normal",
    done: false,
    createdAt: Date.now(),
  },
];

const plugins: WorkspacePlugin[] = [
  {
    id: "plugin-data-inspector",
    name: "Data Inspector",
    benefit: "用 jora 查询实时服务端对象与数据源。",
  },
  {
    id: "plugin-terminals",
    name: "Terminals",
    benefit: "在面板中运行安全的 Vite+ 预设命令。",
  },
  {
    id: "plugin-a11y",
    name: "A11y",
    benefit: "用 axe 扫描路由、定位问题并生成修复提示。",
  },
  {
    id: "plugin-assets",
    name: "Assets",
    benefit: "浏览、预览和管理 public/ 静态资源。",
  },
  {
    id: "plugin-code-server",
    name: "Code Server",
    benefit: "在浏览器中打开当前工作区的编辑器。",
  },
  { id: "plugin-git", name: "Git", benefit: "查看状态、变更、历史、分支与远端。" },
  {
    id: "plugin-inspect",
    name: "Inspect",
    benefit: "检查 RPC、共享状态、Agent API 与运行实例。",
  },
  {
    id: "plugin-messages",
    name: "Messages",
    benefit: "统一查看所有 devframe 的诊断和通知。",
  },
  {
    id: "plugin-og",
    name: "OG",
    benefit: "检查并对比页面的社交分享卡片元数据。",
  },
  {
    id: "vp-inspector",
    name: "VP Inspector",
    benefit: "检查 Vite+ 运行时、环境、源码树和笔记。",
  },
];

export const getWorkspace = createServerFn({ method: "GET" }).handler(
  async (): Promise<Workspace> => ({ tasks: [...tasks], plugins }),
);

export const createTask = createServerFn({ method: "POST" })
  .validator((data: unknown): TaskInput => parseTaskInput(data))
  .handler(async ({ data }): Promise<Workspace> => {
    tasks = [
      {
        id: crypto.randomUUID(),
        title: data.title,
        priority: data.priority,
        done: false,
        createdAt: Date.now(),
      },
      ...tasks,
    ];

    return { tasks: [...tasks], plugins };
  });
