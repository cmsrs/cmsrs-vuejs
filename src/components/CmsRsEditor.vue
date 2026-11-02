<template>
  <div class="cmsrs-editor">
    <!-- Pasek narzędzi -->
    <div v-if="editor" class="editor-toolbar">

      <!-- Formatowanie tekstu -->
      <button
        type="button"
        title="Pogrubienie"
        :class="{ active: editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 2 7.5A4.5 4.5 0 0 1 14 20H6V4zm3 3v4h5a2 2 0 1 0 0-4H9zm0 7v3h5a1.5 1.5 0 0 0 0-3H9z"/></svg>
      </button>

      <button
        type="button"
        title="Kursywa"
        :class="{ active: editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M10 4h10v2h-4l-4 12h4v2H6v-2h4l4-12h-4z"/></svg>
      </button>

      <button
        type="button"
        title="Podkreślenie"
        :class="{ active: editor.isActive('underline') }"
        @click="editor.chain().focus().toggleUnderline().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 12 0V3h-2v7a4 4 0 0 1-8 0V3H6zm-1 17h14v2H5z"/></svg>
      </button>

      <button
        type="button"
        title="Przekreślenie"
        :class="{ active: editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M5 11h14v2H5zM12 3a6 6 0 0 1 5.5 3.5l-1.8.9A4 4 0 0 0 12 5a3 3 0 0 0-3 2c0 .8.5 1.5 1.5 2H8.2A5 5 0 0 1 7 7c0-2.2 2.2-4 5-4zm-4 12h2.5c-.8.5-1.5 1.2-1.5 2a3 3 0 0 0 3 2c1.5 0 2.5-.8 3-2l1.8.9A5.5 5.5 0 0 1 12 21c-2.8 0-5-1.8-5-4 0-.7.3-1.4 1-2z"/></svg>
      </button>

      <span class="toolbar-divider"></span>

      <!-- Nagłówki -->
      <button
        type="button"
        title="Zwykły tekst"
        :class="{ active: editor.isActive('paragraph') }"
        @click="editor.chain().focus().setParagraph().run()"
      >P</button>

      <button
        type="button"
        title="Nagłówek H1"
        :class="{ active: editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
      >H1</button>

      <button
        type="button"
        title="Nagłówek H2"
        :class="{ active: editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
      >H2</button>

      <button
        type="button"
        title="Nagłówek H3"
        :class="{ active: editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
      >H3</button>

      <span class="toolbar-divider"></span>

      <!-- Listy -->
      <button
        type="button"
        title="Lista punktowana"
        :class="{ active: editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M4 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm5 1h11v2H9zM4 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm5 1h11v2H9z"/></svg>
      </button>

      <button
        type="button"
        title="Lista numerowana"
        :class="{ active: editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M3 5h2v5H3V7H2V5h1zm0 8h3v2H3v1h3v2H2v-2l2-2H2v-1h1zm7-6h11v2H10zm0 8h11v2H10z"/></svg>
      </button>

      <button
        type="button"
        title="Cytat"
        :class="{ active: editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
      >
        <svg viewBox="0 0 24 24"><path d="M4 5h7v7H6v3H4v-5h5V7H4zm10 0h7v7h-5v3h-2v-5h5V7h-5z"/></svg>
      </button>

      <span class="toolbar-divider"></span>

      <!-- Wyrównanie -->
      <button
        type="button"
        title="Wyrównaj do lewej"
        @click="editor.chain().focus().setTextAlign('left').run()"
      >
        <svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 4h12v2H3zm0 4h18v2H3zm0 4h12v2H3z"/></svg>
      </button>

      <button
        type="button"
        title="Wyśrodkuj"
        @click="editor.chain().focus().setTextAlign('center').run()"
      >
        <svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm3 4h12v2H6zm-3 4h18v2H3zm3 4h12v2H6z"/></svg>
      </button>

      <button
        type="button"
        title="Wyrównaj do prawej"
        @click="editor.chain().focus().setTextAlign('right').run()"
      >
        <svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm6 4h12v2H9zm-6 4h18v2H3zm6 4h12v2H9z"/></svg>
      </button>

      <button
        type="button"
        title="Wyjustuj"
        @click="editor.chain().focus().setTextAlign('justify').run()"
      >
        <svg viewBox="0 0 24 24"><path d="M3 5h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z"/></svg>
      </button>

      <span class="toolbar-divider"></span>

      <!-- Link -->
      <button
        type="button"
        title="Dodaj lub edytuj link"
        :class="{ active: editor.isActive('link') }"
        @click="setLink"
      >
        <svg viewBox="0 0 24 24"><path d="M10 13a1 1 0 0 0 1.4 0l3-3A3 3 0 0 0 10.2 5.8l-1.7 1.7 1.4 1.4 1.7-1.7a1 1 0 0 1 1.4 1.4l-3 3a1 1 0 0 1-1.4 0l-1.4 1.4A3 3 0 0 0 10 13zm4-2a1 1 0 0 0-1.4 0l-3 3a3 3 0 0 0 4.2 4.2l1.7-1.7-1.4-1.4-1.7 1.7a1 1 0 0 1-1.4-1.4l3-3a1 1 0 0 1 1.4 0l1.4-1.4A3 3 0 0 0 14 11z"/></svg>
      </button>

      <button
        type="button"
        title="Usuń link"
        :disabled="!editor.isActive('link')"
        @click="editor.chain().focus().unsetLink().run()"
      >🔗</button>

      <span class="toolbar-divider"></span>

      <!-- Tabela -->
      <button
        type="button"
        title="Wstaw tabelę 3x3"
        @click="editor.chain().focus().insertTable({
          rows: 3,
          cols: 3,
          withHeaderRow: true
        }).run()"
      >
        <svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v3h5V6zm7 0v3h7V6zM5 11v3h5v-3zm7 0v3h7v-3zM5 16v2h5v-2zm7 0v2h7v-2z"/></svg>
      </button>

      <button
        type="button"
        title="Dodaj wiersz"
        :disabled="!editor.can().addRowAfter()"
        @click="editor.chain().focus().addRowAfter().run()"
      >+W</button>

      <button
        type="button"
        title="Dodaj kolumnę"
        :disabled="!editor.can().addColumnAfter()"
        @click="editor.chain().focus().addColumnAfter().run()"
      >+K</button>

      <button
        type="button"
        title="Usuń wiersz"
        :disabled="!editor.can().deleteRow()"
        @click="editor.chain().focus().deleteRow().run()"
      >−W</button>

      <button
        type="button"
        title="Usuń kolumnę"
        :disabled="!editor.can().deleteColumn()"
        @click="editor.chain().focus().deleteColumn().run()"
      >−K</button>

      <button
        type="button"
        title="Usuń tabelę"
        :disabled="!editor.can().deleteTable()"
        @click="editor.chain().focus().deleteTable().run()"
      >✕</button>

      <span class="toolbar-divider"></span>

      <!-- Cofnij / ponów -->
      <button
        type="button"
        title="Cofnij"
        :disabled="!editor.can().undo()"
        @click="editor.chain().focus().undo().run()"
      >↶</button>

      <button
        type="button"
        title="Ponów"
        :disabled="!editor.can().redo()"
        @click="editor.chain().focus().redo().run()"
      >↷</button>

    </div>

    <!-- Obszar edytora -->
    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, markRaw } from 'vue'

import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import TextAlign from '@tiptap/extension-text-align'

// Props i emit
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// Instancja edytora
const editor = ref(null)

// Konfiguracja i inicjalizacja Tiptap
onMounted(() => {
  editor.value = markRaw(
    new Editor({
      content: props.modelValue,

      extensions: [
        StarterKit,

        // Wyrównywanie tekstu
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),

        // Obsługa tabel
        TableKit.configure({
          table: {
            resizable: true,
            HTMLAttributes: {
              class: 'table table-bordered',
            },
          },
        }),
      ],

      // Przekazywanie HTML do rodzica
      onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.getHTML())
      },
    }),
  )
})

// Dodawanie i edycja linków
function setLink() {
  const previousUrl = editor.value.getAttributes('link').href

  const url = window.prompt(
    'Podaj adres URL:',
    previousUrl || 'https://',
  )

  if (url === null) return

  if (url === '') {
    editor.value.chain().focus().unsetLink().run()
    return
  }

  editor.value.chain().focus().setLink({ href: url }).run()
}

// Niszczenie instancji edytora
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.cmsrs-editor {
  border: 1px solid #ced4da;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;
  padding: 7px;
  background: #f8f9fa;
  border-bottom: 1px solid #ced4da;
}

.editor-toolbar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 5px 7px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: #343a40;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.editor-toolbar button:hover:not(:disabled) {
  background: #e2e6ea;
  border-color: #ced4da;
}

.editor-toolbar button.active {
  background: #d6e4ff;
  border-color: #9bbcff;
  color: #084298;
}

.editor-toolbar button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.editor-toolbar svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  margin: 0 5px;
  background: #ced4da;
}

.cmsrs-editor :deep(.tiptap) {
  min-height: 200px;
  padding: 12px;
  outline: none;
}

.cmsrs-editor :deep(.tiptap p) {
  margin-bottom: 0.75rem;
}

.cmsrs-editor :deep(.tiptap table) {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin: 12px 0;
  overflow: hidden;
}

.cmsrs-editor :deep(.tiptap th),
.cmsrs-editor :deep(.tiptap td) {
  min-width: 1em;
  border: 1px solid #adb5bd;
  padding: 6px 8px;
  vertical-align: top;
}

.cmsrs-editor :deep(.tiptap th) {
  background: #e9ecef;
  font-weight: bold;
}

.cmsrs-editor :deep(.tiptap .selectedCell) {
  background: #d6e4ff;
}

.cmsrs-editor :deep(.tiptap a) {
  color: #0d6efd;
  text-decoration: underline;
}

.cmsrs-editor :deep(.tiptap blockquote) {
  border-left: 3px solid #adb5bd;
  padding-left: 12px;
  margin-left: 0;
  color: #6c757d;
}

.cmsrs-editor :deep(.tiptap h1) {
  font-size: 2rem;
}

.cmsrs-editor :deep(.tiptap h2) {
  font-size: 1.6rem;
}

.cmsrs-editor :deep(.tiptap h3) {
  font-size: 1.3rem;
}
</style>