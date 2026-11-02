<template>
  <div class="container">
    <div class="row test-page">
      <div
        role="edit_page"
        class="ml-2 col-1"
        :class="{ 'disabled-if-loader': pre_loader }"
        @click="$emit('execEditPage', p.id)"
      >
        <Icon name="fa-edit" class="cursor-pointer" />
      </div>
      <div
        role="del_page"
        class="ml-2 col-1"
        :class="{ 'disabled-if-loader': pre_loader }"
        @click="$emit('execDelPage', p.id)"
      >
        <Icon name="fa-trash" class="cursor-pointer" />
      </div>
      <div
        role="down_page"
        :class="{ 'disabled-if-loader': pre_loader }"
        class="ml-2 col-1"
        @click="$emit('execPositionPageDown', p.id)"
      >
        <Icon name="fa-arrow-down" class="cursor-pointer" aria-hidden="true" />
      </div>
      <div
        role="up_page"
        :class="{ 'disabled-if-loader': pre_loader }"
        class="ml-2 col-1"
        @click="$emit('execPositionPageUp', p.id)"
      >
        <Icon name="fa-arrow-up" class="cursor-pointer" aria-hidden="true" />
      </div>
      <span class="col" :class="{ 'text-secondary': !p.published }">
        <span
          @click="$emit('execEditPage', p.id)"
          v-if="showPageId"
          :class="{ 'text-primary': p.id == currentPageId }"
        >
          {{ p.short_title[lang] + " (" + p.id + ")" }}
        </span>
        <span
          v-else
          :class="{ 'text-primary': p.id == currentPageId }"
          @click="$emit('execEditPage', p.id)"
        >
          {{ p.short_title[lang] }}
        </span>
      </span>
    </div>
  </div>
</template>
<script setup>
import Icon from "./Icon.vue";
defineProps({
  pre_loader: Boolean,
  p: Object,
  lang: String,
  allPages: Object,
  showPageId: Boolean,
  currentPageId: [Number, Boolean],
});

defineEmits([
  "execEditPage",
  "execDelPage",
  "execPositionPageUp",
  "execPositionPageDown",
]);
</script>
