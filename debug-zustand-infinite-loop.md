# Debug Session: zustand-infinite-loop
- **Status**: [OPEN]
- **Date**: 2026-06-15
- **Description**: React 报错 "getSnapshot should be cached" 和 "Maximum update depth exceeded"，发生在 Home 组件
- **Stack Trace**: 指向 src/pages/Home.tsx:108:22

## 现象
1. 控制台警告：`The result of getSnapshot should be cached to avoid an infinite loop`
2. 致命错误：`Maximum update depth exceeded` - 无限更新循环

## 假设列表
| # | 假设 | 状态 | 证据位置 |
|---|------|------|----------|
| **H1** | **`useCopybookStore` 选择器每次返回新对象引用，导致 zustand 无限重渲染** | ✅ **确认** | Home.tsx L66-74 |
| H2 | `useMemo` 依赖数组中包含了 getter 函数引用，而 getter 是每次渲染新建的 | ❌ 排除 | - |
| H3 | zustand store 内部的 `get()` 调用在 getter 中触发了状态更新 | ❌ 排除 | - |
| H4 | `parseTextToPages` 函数每次返回不同引用导致连锁更新 | ❌ 排除 | - |
| H5 | 多个组件同时读取 store 并触发链式更新 | ❌ 排除 | - |

## 根因分析
**H1 确认成立**：对比项目中 17 处 `useCopybookStore` 调用，其他 16 处均使用 `useShallow` 包裹选择器，唯独 [Home.tsx](file:///Volumes/ExMac/traeProject/全站1/yq-34/src/pages/Home.tsx#L67-L75) 漏掉了。

Zustand v5 使用 `useSyncExternalStore`，默认用 `Object.is()` 比较返回值。每次渲染选择器返回新对象 `{...}`，引用不同 → 认为状态变化 → 触发重渲染 → 无限循环。

## 修复
文件：[Home.tsx](file:///Volumes/ExMac/traeProject/全站1/yq-34/src/pages/Home.tsx)
1. L2: 添加 `import { useShallow } from 'zustand/react/shallow';`
2. L67-75: 用 `useShallow()` 包裹选择器函数

## 验证结果
- ✅ TypeScript 类型检查通过（`npm run check` exit code 0）
- ✅ 页面正常加载，字帖预览、日历、所有控件渲染正常
- ✅ 控制台：仅 React DevTools 提示，**无报错无警告**
  - 之前的 `getSnapshot should be cached` 警告 → **已消失**
  - 之前的 `Maximum update depth exceeded` 错误 → **已消失**

## 变更历史
- 2026-06-15: 初始分析，读取 Home.tsx 和 useCopybookStore.ts
- 2026-06-15: 确认 H1，添加 useShallow 修复，验证通过
