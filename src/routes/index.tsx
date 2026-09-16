import { For, Show, createMemo } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query";
import { createForm } from "@tanstack/solid-form";
import { createColumnHelper, createTable, tableFeatures } from "@tanstack/solid-table";
import { createVirtualizer } from "@tanstack/solid-virtual";
import { createStore } from "@tanstack/store";
import { useSelector } from "@tanstack/solid-store";
import * as stylex from "@stylexjs/stylex";

import {
  createTask,
  getWorkspace,
  type Task,
  type TaskInput,
  type TaskPriority,
} from "../lib/workspace";
import { styles } from "../styles";

export const Route = createFileRoute("/")({
  loader: () => getWorkspace(),
  component: HomePage,
});

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Task>();
const columns = columnHelper.columns([
  columnHelper.accessor("title", { header: "任务" }),
  columnHelper.accessor("priority", { header: "优先级" }),
  columnHelper.accessor("done", {
    header: "状态",
    cell: (info) => (info.getValue() ? "完成" : "进行中"),
  }),
]);

const uiStore = createStore({
  selectedPluginId: "plugin-data-inspector",
});

function HomePage() {
  const initialWorkspace = Route.useLoaderData();
  const queryClient = useQueryClient();

  const workspaceQuery = useQuery(() => ({
    queryKey: ["workspace"],
    queryFn: () => getWorkspace(),
    initialData: initialWorkspace(),
  }));
  const workspace = createMemo(() => workspaceQuery.data ?? initialWorkspace());
  const tasks = createMemo(() => workspace().tasks);
  const plugins = createMemo(() => workspace().plugins);

  const addTask = useMutation(() => ({
    mutationFn: (input: TaskInput) => createTask({ data: input }),
    onSuccess: (nextWorkspace) => {
      queryClient.setQueryData(["workspace"], nextWorkspace);
    },
  }));

  const form = createForm(() => ({
    defaultValues: { title: "", priority: "normal" as TaskPriority },
    onSubmit: async ({ value }) => {
      await addTask.mutateAsync(value);
      form.reset();
    },
  }));

  const taskTable = createTable({
    features,
    columns,
    get data() {
      return tasks();
    },
    getRowId: (task) => task.id,
  });

  let pluginScrollElement: HTMLDivElement | undefined = undefined;
  const pluginVirtualizer = createVirtualizer({
    get count() {
      return plugins().length;
    },
    getScrollElement: () => pluginScrollElement ?? null,
    estimateSize: () => 76,
    overscan: 5,
    getItemKey: (index) => plugins()[index]?.id ?? String(index),
  });

  const selectedPluginId = useSelector(uiStore, (state) => state.selectedPluginId);
  const selectedPlugin = createMemo(
    () => plugins().find((plugin) => plugin.id === selectedPluginId()) ?? plugins()[0],
  );

  return (
    <main {...stylex.attrs(styles.page)}>
      <header {...stylex.attrs(styles.header)}>
        <p {...stylex.attrs(styles.eyebrow)}>Devframe starter</p>
        <h1 {...stylex.attrs(styles.title)}>TanStack Start × SolidJS × StyleX</h1>
        <p {...stylex.attrs(styles.subtitle)}>
          一个同时接入 TanStack Router / Query / Form / Table / Virtual / Store 与 Devframe Hub
          的起手模板。 开发时访问 <code>/__devframes/</code> 即可打开完整的插件工作台。
        </p>
      </header>

      <section {...stylex.attrs(styles.section)}>
        <h2 {...stylex.attrs(styles.sectionTitle)}>添加任务</h2>
        <div {...stylex.attrs(styles.grid)}>
          <form
            {...stylex.attrs(styles.card, styles.form)}
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            <form.Field name="title">
              {(field) => (
                <label {...stylex.attrs(styles.label)}>
                  任务标题
                  <input
                    {...stylex.attrs(styles.input)}
                    value={field().state.value}
                    onInput={(event) => field().setValue(event.currentTarget.value)}
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </label>
              )}
            </form.Field>

            <form.Field name="priority">
              {(field) => (
                <label {...stylex.attrs(styles.label)}>
                  优先级
                  <select
                    {...stylex.attrs(styles.input)}
                    value={field().state.value}
                    onChange={(event) =>
                      field().setValue(event.currentTarget.value as TaskPriority)
                    }
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                  </select>
                </label>
              )}
            </form.Field>

            <button {...stylex.attrs(styles.button)} type="submit" disabled={addTask.isPending}>
              {addTask.isPending ? "提交中…" : "添加任务"}
            </button>

            <Show when={addTask.error}>
              <p {...stylex.attrs(styles.error)}>{addTask.error?.message ?? ""}</p>
            </Show>
          </form>

          <div {...stylex.attrs(styles.selectedPanel)}>
            <h3 {...stylex.attrs(styles.sectionTitle)}>当前选中插件</h3>
            <Show
              when={selectedPlugin()}
              fallback={<p {...stylex.attrs(styles.status)}>暂无插件</p>}
            >
              {(plugin) => (
                <>
                  <p {...stylex.attrs(styles.pluginName)}>{plugin().name}</p>
                  <p {...stylex.attrs(styles.pluginText)}>{plugin().benefit}</p>
                </>
              )}
            </Show>
          </div>
        </div>
      </section>

      <section {...stylex.attrs(styles.section)}>
        <h2 {...stylex.attrs(styles.sectionTitle)}>任务表</h2>
        <div {...stylex.attrs(styles.tableWrap)}>
          <table {...stylex.attrs(styles.table)}>
            <thead>
              <For each={taskTable.getHeaderGroups()}>
                {(group) => (
                  <tr>
                    <For each={group.headers}>
                      {(header) => (
                        <th {...stylex.attrs(styles.tableHead, styles.tableCell)}>
                          <taskTable.FlexRender header={header} />
                        </th>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </thead>
            <tbody>
              <For each={taskTable.getRowModel().rows}>
                {(row) => (
                  <tr>
                    <For each={row.getAllCells()}>
                      {(cell) => (
                        <td {...stylex.attrs(styles.tableCell)}>
                          <taskTable.FlexRender cell={cell} />
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section {...stylex.attrs(styles.section)}>
        <h2 {...stylex.attrs(styles.sectionTitle)}>Devframe 插件目录</h2>
        <div
          ref={(element) => {
            pluginScrollElement = element;
          }}
          {...stylex.attrs(styles.virtualScroller)}
          style={{ height: "380px" }}
        >
          <div style={{ height: `${pluginVirtualizer.getTotalSize()}px`, position: "relative" }}>
            <For each={pluginVirtualizer.getVirtualItems()}>
              {(item) => {
                const plugin = plugins()[item.index];

                return (
                  <article
                    data-index={item.index}
                    ref={(node) => {
                      node.dataset.index = String(item.index);
                      pluginVirtualizer.measureElement(node);
                    }}
                    class={
                      stylex.attrs([
                        styles.virtualItem,
                        selectedPluginId() === plugin.id && styles.virtualItemSelected,
                      ]).class
                    }
                    style={{
                      position: "absolute",
                      top: 0,
                      width: "100%",
                      transform: `translateY(${item.start}px)`,
                    }}
                    onClick={() =>
                      uiStore.setState((state) => ({
                        ...state,
                        selectedPluginId: plugin.id,
                      }))
                    }
                  >
                    <p {...stylex.attrs(styles.pluginName)}>{plugin.name}</p>
                    <p {...stylex.attrs(styles.pluginText)}>{plugin.benefit}</p>
                  </article>
                );
              }}
            </For>
          </div>
        </div>
      </section>
    </main>
  );
}
