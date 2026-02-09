const zhCN = {
  common: {
    language: '语言',
    languages: {
      en: 'English',
      zhCN: '简体中文',
    },
    loading: '加载中...',
  },
  router: {
    notFound: {
      code: '404',
      title: '页面未找到',
      description: '你访问的页面不存在。',
    },
  },
  authPage: {
    hero: {
      badge: '起步模板',
      title: '快速构建，内置安全认证与受保护路由。',
      description:
        '这个模板包含 Supabase 认证、TanStack Router 路由守卫，以及已接好 API 的 Todo 全 CRUD 示例。',
      tags: {
        auth: 'Supabase 认证',
        router: 'TanStack Router',
        styles: 'Tailwind CSS',
      },
    },
    panel: {
      access: '访问',
      welcomeBack: '欢迎回来',
      createAccount: '创建账户',
      modeLogin: '登录',
      modeSignup: '注册',
      email: '邮箱地址',
      password: '密码',
      loading: '请稍候...',
      submitLogin: '登录',
      submitSignup: '创建账户',
      policy: '继续即表示你同意该起步模板的相关政策。',
      signupNotice: '请先前往邮箱完成账户确认，再进行登录。',
    },
  },
  authenticatedLayout: {
    brand: 'XStack 模板',
    title: '已认证工作区',
    signedIn: '已登录',
    signOut: '退出登录',
    todos: '待办',
    routeHint: '受保护路由示例',
    loadingSession: '正在加载会话...',
  },
  todosPage: {
    section: {
      badge: '受保护示例',
      title: 'Todo 增删改查',
      apiBadge: 'API: /api/todos',
    },
    form: {
      placeholder: '添加一个新任务',
      submit: '添加待办',
    },
    errors: {
      createFailed: '创建待办失败',
      updateFailed: '更新待办失败',
      deleteFailed: '删除待办失败',
      loadFailed: '加载待办失败',
    },
    list: {
      title: '你的任务',
      itemsCount_one: '{{count}} 项',
      itemsCount_other: '{{count}} 项',
      loading: '正在加载待办...',
      empty: '还没有待办任务，先在上方创建一个吧。',
      createdAt: '创建于 {{value}}',
      markDone: '标记为已完成',
      markUndone: '标记为未完成',
      done: '已完成',
      todo: '待办',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
    },
  },
}

export default zhCN
