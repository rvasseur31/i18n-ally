/* eslint-disable no-undef */
import { createApp } from 'vue'
import { createStore } from 'vuex'
import { createI18n } from 'vue-i18n'
import 'vue-material-design-icons/styles.css'
import VCheck from 'vue-material-design-icons/Check.vue'
import VPlusMinus from 'vue-material-design-icons/PlusMinus.vue'
import VCommentOutline from 'vue-material-design-icons/CommentOutline.vue'
import VEarth from 'vue-material-design-icons/Earth.vue'
import VCommentEditOutline from 'vue-material-design-icons/CommentEditOutline.vue'
import VCommentQuestionOutline from 'vue-material-design-icons/CommentQuestionOutline.vue'
import VCheckboxMarkedOutline from 'vue-material-design-icons/CheckboxMarkedOutline.vue'
import VPencilOff from 'vue-material-design-icons/PencilOff.vue'
import VPencil from 'vue-material-design-icons/Pencil.vue'
import VCheckAll from 'vue-material-design-icons/CheckAll.vue'
import VMenu from 'vue-material-design-icons/Menu.vue'
import VChevronLeft from 'vue-material-design-icons/ChevronLeft.vue'
import VChevronRight from 'vue-material-design-icons/ChevronRight.vue'
import VDeleteEmptyOutline from 'vue-material-design-icons/DeleteEmptyOutline.vue'
import VFormatQuoteOpen from 'vue-material-design-icons/FormatQuoteOpen.vue'
import { vscode } from './api'
import App from './App.vue'

const app = createApp(App)

app.component('VCheck', VCheck)
app.component('VPlusMinus', VPlusMinus)
app.component('VCommentOutline', VCommentOutline)
app.component('VEarth', VEarth)
app.component('VCommentEditOutline', VCommentEditOutline)
app.component('VCommentQuestionOutline', VCommentQuestionOutline)
app.component('VCheckboxMarkedOutline', VCheckboxMarkedOutline)
app.component('VPencilOff', VPencilOff)
app.component('VPencil', VPencil)
app.component('VCheckAll', VCheckAll)
app.component('VDeleteEmptyOutline', VDeleteEmptyOutline)
app.component('VFormatQuoteOpen', VFormatQuoteOpen)
app.component('VMenu', VMenu)
app.component('VChevronLeft', VChevronLeft)
app.component('VChevronRight', VChevronRight)

const locale = 'en'
const i18n = createI18n({
  locale,
  messages: {},
  legacy: true,
  globalInjection: true,
})

const store = createStore({
  state: () => {
    return Object.assign({
      ready: false,
      config: {
        debug: false,
        sourceLanguage: 'en',
        displayLanguage: 'en',
        enabledFrameworks: [],
        ignoredLocales: [],
        extensionRoot: '',
        flags: [],
        locales: [],
      },
      context: {},
      i18n: {},
      route: 'welcome',
      routeData: {},
    },
    vscode.getState(),
    { ready: false })
  },
  mutations: {
    config(state, data) {
      state.config = data
    },
    i18n(state, data) {
      state.i18n = data
      i18n.global.setLocaleMessage(locale, data)
    },
    route(state, { route, data }) {
      state.routeData = data
      state.route = route
    },
    context(state, context) {
      state.context = context
    },
    ready(state) {
      state.ready = true
    },
  },
})

window.addEventListener('message', (event) => {
  const message = event.data
  switch (message.type) {
    case 'ready':
      store.commit('ready')
      break
    case 'config':
      store.commit('config', message.data)
      break
    case 'route':
      store.commit('route', message)
      break
    case 'i18n':
      store.commit('i18n', message.data)
      break
    case 'context':
      store.commit('context', message.data)
  }
})

app.use(store)
app.use(i18n)

// Watch store state
store.subscribe((mutation, state) => {
  vscode.setState(state)
})

window.app = app.mount('#app')

vscode.postMessage({ type: 'ready' })
