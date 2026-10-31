<template>
  <div class="form-group mt-3" :data-testid="`${entity}-tag-assignment`">
    <label :for="`${entity}TagSelect`" class="text-secondary">
      Tags for this {{ entity }}:
    </label>
    <select
      :id="`${entity}TagSelect`"
      class="rs-select form-control"
      :role="`${entity}_tag_select`"
      v-model="tagToAdd"
      :disabled="disabled || availableTags.length === 0"
      @change="addTag"
    >
      <option value=""></option>
      <option
        v-for="tag in availableTags"
        :key="tag.id"
        :value="String(tag.id)"
      >
        {{ getTagName(tag) }}
      </option>
    </select>

    <div class="mt-2" :data-testid="`assigned-${entity}-tags`">
      <div
        v-for="tagId in selectedTagIds"
        :key="tagId"
        class="d-flex align-items-center mb-1"
        :data-assigned-tag-id="tagId"
      >
        <span class="me-2">{{ getTagNameById(tagId) }}</span>
        <div
          :role="`del_${entity}_tag`"
          class="trash"
          :class="{ 'disabled-if-loader': disabled }"
          :aria-label="`Remove ${getTagNameById(tagId)}`"
          @click="removeTag(tagId)"
        >
          <i
            class="fas fa-trash cursor-pointer"
            :title="`Remove ${getTagNameById(tagId)}`"
            aria-hidden="true"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  tags: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
  lang: {
    type: String,
    required: true,
  },
  defaultLang: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  entity: {
    type: String,
    required: true,
    validator: (value) => ["page", "product"].includes(value),
  },
});

const emit = defineEmits(["update:modelValue", "remove-tag"]);

const tagToAdd = ref("");
const selectedTagIds = computed(() => props.modelValue || []);
const availableTags = computed(() =>
  props.tags.filter((tag) => !selectedTagIds.value.includes(Number(tag.id))),
);

const getTagName = (tag) =>
  tag?.name?.[props.lang] ||
  tag?.name?.[props.defaultLang] ||
  String(tag?.id ?? "");

const getTagNameById = (tagId) => {
  const tag = props.tags.find((item) => Number(item.id) === Number(tagId));
  return tag ? getTagName(tag) : String(tagId);
};

const addTag = () => {
  const tagId = Number(tagToAdd.value);
  if (
    tagToAdd.value !== "" &&
    Number.isInteger(tagId) &&
    !selectedTagIds.value.includes(tagId)
  ) {
    emit("update:modelValue", [...selectedTagIds.value, tagId]);
  }
  tagToAdd.value = "";
};

const removeTag = (tagId) => {
  if (
    window.confirm(
      `Remove tag "${getTagNameById(tagId)}" from this ${props.entity}?`,
    )
  ) {
    emit("remove-tag", tagId);
  }
};
</script>
