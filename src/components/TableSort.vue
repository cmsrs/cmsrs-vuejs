<template>
  <span>
    <span
      :role="'sorting_' + sortColumn + '_asc'"
      :class="{ 'disabled-if-loader': pre_loader }"
      class="ml-2 col-1"
      @click.prevent="$emit('sortAsc')"
    >
      <Icon
        name="fa-arrow-down"
        class="cursor-pointer"
        :class="{ 'text-primary': sortColumn == column && direction == 'asc' }"
        aria-hidden="true"
      />
    </span>
    <span
      :role="'sorting_' + sortColumn + '_desc'"
      :class="{ 'disabled-if-loader': pre_loader }"
      class="ml-2 col-1"
      @click.prevent="$emit('sortDesc')"
    >
      <Icon
        name="fa-arrow-up"
        class="cursor-pointer"
        :class="{ 'text-primary': sortColumn == column && direction == 'desc' }"
        aria-hidden="true"
      />
    </span>
  </span>
</template>

<script setup>
import Icon from "./Icon.vue";
defineProps({
  pre_loader: Boolean,
  sortColumn: String,
  column: String,
  direction: String,
});

defineEmits(["sortAsc", "sortDesc"]);
</script>
