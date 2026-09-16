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

export const Route = createFileRoute("/")({ loader: () => getWorkspace(), component: HomePage });

const features = tableFeatures({});
const columnHelper = createColumnHelper<typeof features, Task>();
const columns = columnHelper.columns([
  columnHelper.accessor("title", { header: "任务" }),
  columnHelper.accessor("priority", {
    header: "优先级",
    cell: (info) => ({ low: "低", normal: "普通", high: "高" })[info.getValue()],
  }),
  columnHelper.accessor("done", {
    header: "状态",
    cell: (info) => (info.getValue() ? "已完成" : "进行中"),
  }),
]);

const uiStore = createStore({ selectedPluginId: "plugin-data-inspector" });

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
    onSuccess: (nextWorkspace) => queryClient.setQueryData(["workspace"], nextWorkspace),
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
      <section {...stylex.attrs(styles.hero)} aria-labelledby="hero-title">
        <div class="aurora-scene" aria-hidden="true">
          <div class="stars" />
          <div class="aurora aurora-one" />
          <div class="aurora aurora-two" />
          <div class="aurora aurora-three" />
          <div class="hero-vignette" />
        </div>
        <header {...stylex.attrs(styles.heroTop)}>
          <a href="#top" {...stylex.attrs(styles.brand)}>
            <span {...stylex.attrs(styles.dot)} />
            Vite+ · Starter
          </a>
          <nav {...stylex.attrs(styles.heroNav)} aria-label="主导航">
            <a href="#workspace" {...stylex.attrs(styles.heroLink, styles.hideMobile)}>
              Workspace
            </a>
            <a href="#plugins" {...stylex.attrs(styles.heroLink, styles.hideMobile)}>
              Devframe
            </a>
            <a href="https://viteplus.dev/guide/" {...stylex.attrs(styles.heroLink)}>
              Docs ↗
            </a>
          </nav>
        </header>
        <div id="top" {...stylex.attrs(styles.heroBottom)}>
          <h1 id="hero-title" {...stylex.attrs(styles.title)}>
            BUILD
            <br />
            <span {...stylex.attrs(styles.titleThin)}>BETTER</span>
          </h1>
          <div {...stylex.attrs(styles.heroMeta)}>
            <p {...stylex.attrs(styles.subtitle)}>
              一套真正能开始工作的全栈起手模板。TanStack Start、SolidJS、StyleX 与
              Devframe，已经替你连接完成。
            </p>
            <a href="#workspace" {...stylex.attrs(styles.heroButton)}>
              进入工作区 <span aria-hidden="true">↘</span>
            </a>
          </div>
        </div>
      </section>

      <div {...stylex.attrs(styles.content)}>
        <section {...stylex.attrs(styles.intro)}>
          <div>
            <p {...stylex.attrs(styles.kicker)}>Built for momentum</p>
            <h2 {...stylex.attrs(styles.sectionTitle)}>
              少一点配置，
              <br />
              多一点创造。
            </h2>
          </div>
          <p {...stylex.attrs(styles.introCopy)}>
            这不是一张空白画布，而是一条已经铺好的跑道。路由、服务端函数、数据缓存、表单、表格与开发工具都拥有可运行的真实示例；删掉示例，就能长成你的产品。
          </p>
        </section>

        <section {...stylex.attrs(styles.stack)} aria-label="技术栈概览">
          <div {...stylex.attrs(styles.stackItem)}>
            <p {...stylex.attrs(styles.stackNumber)}>01 / ROUTING</p>
            <p {...stylex.attrs(styles.stackName)}>TanStack Start</p>
            <p {...stylex.attrs(styles.stackDetail)}>SSR · file routes · server functions</p>
          </div>
          <div {...stylex.attrs(styles.stackItem)}>
            <p {...stylex.attrs(styles.stackNumber)}>02 / INTERFACE</p>
            <p {...stylex.attrs(styles.stackName)}>SolidJS + StyleX</p>
            <p {...stylex.attrs(styles.stackDetail)}>reactive · typed · zero-runtime CSS</p>
          </div>
          <div {...stylex.attrs(styles.stackItem)}>
            <p {...stylex.attrs(styles.stackNumber)}>03 / TOOLCHAIN</p>
            <p {...stylex.attrs(styles.stackName)}>Vite+</p>
            <p {...stylex.attrs(styles.stackDetail)}>dev · build · test · check</p>
          </div>
          <div {...stylex.attrs(styles.stackItem)}>
            <p {...stylex.attrs(styles.stackNumber)}>04 / DEVTOOLS</p>
            <p {...stylex.attrs(styles.stackName)}>Devframe Hub</p>
            <p {...stylex.attrs(styles.stackDetail)}>10 plugins · one workspace</p>
          </div>
        </section>

        <section id="workspace" {...stylex.attrs(styles.section)}>
          <header {...stylex.attrs(styles.sectionHeader)}>
            <div>
              <p {...stylex.attrs(styles.kicker)}>Interactive workspace</p>
              <h2 {...stylex.attrs(styles.sectionHeading)}>真实交互，开箱即用</h2>
            </div>
            <span {...stylex.attrs(styles.sectionMeta)}>Form · Query · Table · Server Action</span>
          </header>
          <div {...stylex.attrs(styles.workspaceGrid)}>
            <div {...stylex.attrs(styles.panel)}>
              <div {...stylex.attrs(styles.panelHeader)}>
                <h3 {...stylex.attrs(styles.panelTitle)}>创建新任务</h3>
                <span {...stylex.attrs(styles.panelMeta)}>Server action</span>
              </div>
              <form
                {...stylex.attrs(styles.form)}
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
                        placeholder="例如：完成首页设计"
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
                        <option value="low">低优先级</option>
                        <option value="normal">普通优先级</option>
                        <option value="high">高优先级</option>
                      </select>
                    </label>
                  )}
                </form.Field>
                <button {...stylex.attrs(styles.button)} type="submit" disabled={addTask.isPending}>
                  {addTask.isPending ? "正在创建…" : "创建任务  →"}
                </button>
                <Show when={addTask.error}>
                  <p {...stylex.attrs(styles.error)}>{addTask.error?.message ?? ""}</p>
                </Show>
              </form>
            </div>
            <div {...stylex.attrs(styles.panel)}>
              <div {...stylex.attrs(styles.panelHeader)}>
                <h3 {...stylex.attrs(styles.panelTitle)}>项目任务</h3>
                <span {...stylex.attrs(styles.panelMeta)}>{tasks().length} items · live query</span>
              </div>
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
            </div>
          </div>
        </section>

        <section id="plugins" {...stylex.attrs(styles.section)}>
          <header {...stylex.attrs(styles.sectionHeader)}>
            <div>
              <p {...stylex.attrs(styles.kicker)}>Devframe ecosystem</p>
              <h2 {...stylex.attrs(styles.sectionHeading)}>调试能力，也要统一体验</h2>
            </div>
            <a href="/__devframes/" {...stylex.attrs(styles.heroButton)}>
              打开 Hub ↗
            </a>
          </header>
          <div {...stylex.attrs(styles.pluginGrid)}>
            <Show when={selectedPlugin()}>
              {(plugin) => (
                <article {...stylex.attrs(styles.selectedPanel)}>
                  <div {...stylex.attrs(styles.selectedIcon)}>{initials(plugin().name)}</div>
                  <div>
                    <p {...stylex.attrs(styles.selectedLabel)}>Selected capability</p>
                    <h3 {...stylex.attrs(styles.selectedName)}>{plugin().name}</h3>
                    <p {...stylex.attrs(styles.selectedText)}>{plugin().benefit}</p>
                  </div>
                </article>
              )}
            </Show>
            <div
              ref={(element) => {
                pluginScrollElement = element;
              }}
              {...stylex.attrs(styles.virtualScroller)}
            >
              <div
                style={{ height: `${pluginVirtualizer.getTotalSize()}px`, position: "relative" }}
              >
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
                          uiStore.setState((state) => ({ ...state, selectedPluginId: plugin.id }))
                        }
                      >
                        <div {...stylex.attrs(styles.pluginIcon)}>{initials(plugin.name)}</div>
                        <div>
                          <p {...stylex.attrs(styles.pluginName)}>{plugin.name}</p>
                          <p {...stylex.attrs(styles.pluginText)}>{plugin.benefit}</p>
                        </div>
                        <span {...stylex.attrs(styles.arrow)} aria-hidden="true">
                          ↗
                        </span>
                      </article>
                    );
                  }}
                </For>
              </div>
            </div>
          </div>
        </section>

        <footer {...stylex.attrs(styles.footer)}>
          <span>Vite+ × TanStack Start × SolidJS</span>
          <span>Build something remarkable.</span>
        </footer>
      </div>
    </main>
  );
}
