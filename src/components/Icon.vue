<template>
  <img :src="icon" class="cmsrs-icon" aria-hidden="true" />
</template>

<script setup>
import { computed } from "vue";

import plus from "../assets/icons/plus.svg";
import search from "../assets/icons/search.svg";
import edit from "../assets/icons/edit.svg";
import trash from "../assets/icons/trash.svg";
import save from "../assets/icons/save.svg";
import arrowDown from "../assets/icons/arrow-down.svg";
import arrowUp from "../assets/icons/arrow-up.svg";
import money from "../assets/icons/money-bill-alt.svg";
import cog from "../assets/icons/cog.svg";
import check from "../assets/icons/check.svg";
import times from "../assets/icons/times.svg";
import cameraRetro from "../assets/icons/camera-retro.svg";
import upload from "../assets/icons/upload.svg";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const icons = {
  "fa-plus": plus,
  "fa-search": search,
  "fa-edit": edit,
  "fa-trash": trash,
  "fa-save": save,
  "fa-arrow-down": arrowDown,
  "fa-arrow-up": arrowUp,
  "fa-money-bill-alt": money,
  "fa-cog": cog,
  "fa-check": check,
  "fa-times": times,
  "fa-camera-retro": cameraRetro,
  "fa-upload": upload,
};

const icon = computed(() => icons[props.name]);
</script>

<style scoped>
.cmsrs-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
}

.cmsrs-icon.fa-lg {
  width: 1.25em;
  height: 1.25em;
}

.cmsrs-icon.fa-3x {
  width: 3em;
  height: 3em;
}
</style>
