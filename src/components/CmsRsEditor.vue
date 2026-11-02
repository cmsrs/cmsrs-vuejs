<template>
  <div class="cmsrs-editor">
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";

export default {
  name: "CmsRsEditor",

  components: {
    EditorContent,
  },

  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue"],

  data() {
    return {
      editor: null,
    };
  },

  mounted() {
    this.editor = new Editor({
      content: this.modelValue,

      extensions: [StarterKit],

      onUpdate: ({ editor }) => {
        this.$emit("update:modelValue", editor.getHTML());
      },
    });
  },

  beforeUnmount() {
    this.editor?.destroy();
  },
};
</script>

<style scoped>
.cmsrs-editor {
  border: 1px solid #ced4da;
  border-radius: 4px;
  min-height: 200px;
}

.cmsrs-editor :deep(.tiptap) {
  min-height: 200px;
  padding: 12px;
  outline: none;
}
</style>
