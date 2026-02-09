const en = {
  common: {
    language: 'Language',
    languages: {
      en: 'English',
      zhCN: 'Chinese (Simplified)',
    },
    loading: 'Loading...',
  },
  router: {
    notFound: {
      code: '404',
      title: 'Page not found',
      description: 'The page you are looking for does not exist.',
    },
  },
  authPage: {
    hero: {
      badge: 'Starter template',
      title: 'Build fast with secure auth and protected routes.',
      description:
        'This starter includes Supabase authentication, TanStack Router guards, and a full CRUD Todo example wired to the API.',
      tags: {
        auth: 'Supabase Auth',
        router: 'TanStack Router',
        styles: 'Tailwind CSS',
      },
    },
    panel: {
      access: 'Access',
      welcomeBack: 'Welcome back',
      createAccount: 'Create an account',
      modeLogin: 'Login',
      modeSignup: 'Sign up',
      email: 'Email address',
      password: 'Password',
      loading: 'Please wait...',
      submitLogin: 'Sign in',
      submitSignup: 'Create account',
      policy: 'By continuing you agree to the starter template policies.',
      signupNotice: 'Check your email to confirm your account before signing in.',
    },
  },
  authenticatedLayout: {
    brand: 'XStack Starter',
    title: 'Authenticated workspace',
    signedIn: 'Signed in',
    signOut: 'Sign out',
    todos: 'Todos',
    routeHint: 'Protected route example',
    loadingSession: 'Loading session...',
  },
  todosPage: {
    section: {
      badge: 'Protected demo',
      title: 'Todo CRUD',
      apiBadge: 'API: /api/todos',
    },
    form: {
      placeholder: 'Add a new task',
      submit: 'Add todo',
    },
    errors: {
      createFailed: 'Failed to create todo',
      updateFailed: 'Failed to update todo',
      deleteFailed: 'Failed to delete todo',
      loadFailed: 'Failed to load todos',
    },
    list: {
      title: 'Your tasks',
      itemsCount_one: '{{count}} item',
      itemsCount_other: '{{count}} items',
      loading: 'Loading todos...',
      empty: 'No todos yet. Create your first task above.',
      createdAt: 'Created {{value}}',
      markDone: 'Mark as done',
      markUndone: 'Mark as not done',
      done: 'Done',
      todo: 'Todo',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
    },
  },
}

export default en
