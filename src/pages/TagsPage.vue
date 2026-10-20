<template>
  <div class="mb-3" data-testid="tags-page">
    <!-- Header -->
    <div class="container">
      <div class="row mt-3 mb-3">
        <h3 class="col-10">Tags</h3>
        <ChangeLang :lang="lang" @exec-change-lang="changeLang" />
      </div>
    </div>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong" />

    <div class="container">
      <div class="row">
        <!-- LEFT COLUMN: Categories and tags -->
        <div class="col-7">
          <button
            role="button_add_tag_category"
            class="btn btn-primary mt-2 mb-2"
            :disabled="pre_loader"
            @click.prevent="addCategory"
          >
            <i class="fas fa-plus"></i>
            Add category
          </button>

          <!-- Existing categories -->
          <div
            v-for="category in categories"
            :key="category.id"
            class="container mt-3"
            :data-category-id="category.id"
            style="margin-left: 0px; padding-left: 0px"
          >
            <div class="row">
              <!-- Category name -->
              <div class="form-group col-6">
                <input
                  class="form-control"
                  :class="{
                    'is-invalid': categoryErrors[category.id]?.includes('name'),
                  }"
                  :disabled="pre_loader"
                  :value="category.name?.[lang] ?? ''"
                  :placeholder="`Category name ${lang}`"
                  @input="
                    updateCategoryName(category.id, lang, $event.target.value)
                  "
                />
              </div>

              <!-- Entity type -->
              <div v-if="tagEntityTypes.length > 1" class="form-group col-4">
                <select
                  class="form-control"
                  :class="{
                    'is-invalid':
                      categoryErrors[category.id]?.includes('entity_type'),
                  }"
                  :disabled="pre_loader"
                  v-model="category.entity_type"
                >
                  <option value="">Select type</option>

                  <option
                    v-for="entityType in tagEntityTypes"
                    :key="entityType"
                    :value="entityType"
                  >
                    {{ entityType }}
                  </option>
                </select>
              </div>

              <!-- Save category -->
              <div class="col-1">
                <i
                  class="far fa-save cursor-pointer"
                  :class="{ 'disabled-if-loader': pre_loader }"
                  title="Save category"
                  role="button_save_tag_category"
                  @click="saveCategory(category)"
                ></i>
              </div>

              <!-- Delete category -->
              <div class="col-1 trash">
                <i
                  class="fas fa-trash cursor-pointer"
                  :class="{ 'disabled-if-loader': pre_loader }"
                  title="Delete category"
                  role="button_delete_tag_category"
                  @click="deleteCategory(category)"
                ></i>
              </div>
            </div>

            <!-- Tags assigned to this category -->
            <div class="ms-3 mt-2 mb-3">
              <div
                v-for="tag in getTagsByCategory(category.id)"
                :key="tag.id"
                class="row mb-2"
                :class="{
                  'selected-tag': currentTagId === tag.id,
                }"
                role="tag_item"
                @click="editTag(tag)"
              >
                <!-- Delete tag -->
                <div class="col-1 trash">
                  <i
                    class="fas fa-trash cursor-pointer"
                    :class="{ 'disabled-if-loader': pre_loader }"
                    title="Delete tag"
                    role="button_delete_tag"
                    @click.prevent="deleteTag"
                  ></i>
                </div>

                <div class="col-1">
                  <i
                    class="far fa-edit cursor-pointer"
                    title="Edit tag"
                    @click.stop="editTag(tag)"
                  ></i>
                </div>

                <div class="col-10">
                  <span>{{ tag.name?.[lang] || "(empty)" }}</span>
                </div>
              </div>

              <div
                v-if="getTagsByCategory(category.id).length === 0"
                class="text-secondary small mb-2"
              >
                No tags in this category
              </div>
            </div>
          </div>

          <!-- New category form -->
          <div
            v-if="isAddCategory"
            class="container mt-3"
            style="margin-left: 0px; padding-left: 0px"
            data-testid="new-category-form"
          >
            <h6>New category</h6>

            <div class="row align-items-start">
              <div class="form-group col-6">
                <input
                  class="form-control"
                  :class="{ 'is-invalid': newCategoryError }"
                  v-model="newCategory.name[lang]"
                  :placeholder="`Category name ${lang}`"
                  :disabled="pre_loader"
                />
              </div>

              <div v-if="tagEntityTypes.length > 1" class="form-group col-4">
                <select
                  class="form-control"
                  v-model="newCategory.entity_type"
                  :disabled="pre_loader"
                >
                  <option value="">Select type</option>

                  <option
                    v-for="entityType in tagEntityTypes"
                    :key="entityType"
                    :value="entityType"
                  >
                    {{ entityType }}
                  </option>
                </select>
              </div>

              <div class="col-1">
                <i
                  class="far fa-save cursor-pointer"
                  :class="{ 'disabled-if-loader': pre_loader }"
                  title="Save category"
                  role="button_save_tag_category"
                  @click="saveCategory('new')"
                ></i>
              </div>

              <div class="col-1 trash">
                <i
                  class="fas fa-trash cursor-pointer"
                  :class="{ 'disabled-if-loader': pre_loader }"
                  role="button_cancel_new_tag_category"
                  title="Cancel"
                  @click="cancelAddCategory"
                ></i>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Tag form -->
        <div class="col-5">
          <!-- Save tag -->
          <button
            role="button_add_tag"
            type="submit"
            class="btn btn-primary mt-2 mb-2 me-2"
            :disabled="pre_loader"
            @click.prevent="saveTag"
          >
            <i
              v-if="!pre_loader"
              :class="currentTagId ? 'far fa-save' : 'fas fa-plus'"
            ></i>

            <span v-if="pre_loader" class="spinner-grow spinner-grow-sm"></span>

            {{ currentTagId ? "Save tag" : "Add tag" }}
          </button>

          <button
            role="button_clear_tag"
            class="btn btn-info mt-2 mb-2"
            :disabled="pre_loader"
            @click.prevent="clearTagData"
          >
            Clear data
          </button>

          <form class="mt-3">
            <!-- Tag name -->
            <div class="form-group mt-3">
              <label for="tagName" class="text-secondary"> Name: </label>

              <input
                id="tagName"
                class="form-control"
                :class="{
                  'is-invalid': tagErrors.includes('name'),
                }"
                v-model="tagName[lang]"
                :placeholder="`Tag name ${lang}`"
                :disabled="pre_loader"
              />
            </div>

            <!-- Category -->
            <div class="form-group mt-3">
              <label for="tagCategory" class="text-secondary">
                Category:
              </label>

              <select
                id="tagCategory"
                class="form-control"
                :class="{
                  'is-invalid': tagErrors.includes('tag_category_id'),
                }"
                v-model="tagCategoryId"
                :disabled="pre_loader"
              >
                <option value="">Select category</option>

                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name?.[lang] || "(empty)" }}
                </option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

import functions from "../helpers/functions.js";
import trans from "../helpers/trans.js";
import { handleError } from "../helpers/common.js";

import {
  postTagCategory,
  getTagCategories,
  putTagCategory,
  deleteTagCategory,
  postTag,
  getTags,
  putTag,
  deleteTag as deleteTagRequest,
} from "../api/apiCalls.js";

import Msg from "../components/Msg.vue";
import ChangeLang from "../components/ChangeLang.vue";

import { useAuthStore } from "../state/store.js";

const { auth, config, setDefaultLang } = useAuthStore();

const {
  configLangs: langs,
  configDefaultLang,
  token,
} = functions.retrieveParamsFromStorage();

// State
const lang = ref(configDefaultLang);

const msgWrong = ref("");
const msgGood = ref("");
const pre_loader = ref(false);

const categories = ref([]);
const tags = ref([]);

const isAddCategory = ref(false);
const newCategoryError = ref(false);

const newCategory = ref({
  name: {},
  entity_type: "",
});

const tagName = ref({});
const tagCategoryId = ref("");
const currentTagId = ref(false);

const tagErrors = ref([]);
const categoryErrors = ref({});

const tagEntityTypes = Array.isArray(config.tag_entity_types)
  ? config.tag_entity_types
  : [];

// --------------------------------------------------
// Common helpers
// --------------------------------------------------

function clearMsg() {
  msgWrong.value = "";
  msgGood.value = "";
  tagErrors.value = [];
  categoryErrors.value = {};
  newCategoryError.value = false;
}

const startLoading = () => {
  clearMsg();

  if (pre_loader.value) {
    return false;
  }

  pre_loader.value = true;
  return true;
};

function finishLoading() {
  pre_loader.value = false;
}

function getTagsByCategory(categoryId) {
  return tags.value.filter(
    (tag) => Number(tag.tag_category_id) === Number(categoryId),
  );
}

function emptyTranslations() {
  return functions.createEmptyObj(langs);
}

// --------------------------------------------------
// Language
// --------------------------------------------------

function changeLang(inLang) {
  lang.value = inLang;
  setDefaultLang(inLang);
}

watch(lang, () => {
  clearMsg();
});

// --------------------------------------------------
// Refresh data
// --------------------------------------------------

async function refreshCategories() {
  const response = await getTagCategories(token);

  if (response.data.success) {
    categories.value = response.data.data || [];
    return true;
  }

  throw new Error(trans.ttt("error_loading_tag_categories"));
}

async function refreshTags() {
  const response = await getTags(token);

  if (response.data.success) {
    tags.value = response.data.data || [];
    return true;
  }

  throw new Error(trans.ttt("error_loading_tags"));
}

// --------------------------------------------------
// Categories
// --------------------------------------------------

function addCategory() {
  clearMsg();

  isAddCategory.value = true;

  newCategory.value = {
    name: emptyTranslations(),
    entity_type: tagEntityTypes[0] || "",
  };
}

function cancelAddCategory() {
  isAddCategory.value = false;
  newCategoryError.value = false;
}

function updateCategoryName(categoryId, selectedLang, value) {
  const category = categories.value.find(
    (item) => Number(item.id) === Number(categoryId),
  );

  if (!category) {
    return;
  }

  if (!category.name) {
    category.name = emptyTranslations();
  }

  category.name[selectedLang] = value;
}

function validateCategory(category) {
  const errors = [];

  for (const currentLang of langs) {
    if (!category.name?.[currentLang]?.trim()) {
      msgWrong.value =
        trans.ttt("msg_add_category_name") + cmsLangPrefix(currentLang);

      errors.push("name");
      break;
    }
  }

  if (!category.entity_type) {
    msgWrong.value = trans.ttt("msg_select_category_entity_type");
    errors.push("entity_type");
  }

  return errors;
}

function cmsLangPrefix(currentLang) {
  return ` (${currentLang})`;
}

async function saveCategory(categoryOrNew) {
  clearMsg();

  const isNew = categoryOrNew === "new";

  const category = isNew ? newCategory.value : categoryOrNew;

  const errors = validateCategory(category);

  if (isNew) {
    newCategoryError.value = errors.includes("name");
  } else {
    categoryErrors.value[category.id] = errors;
  }

  if (errors.length) {
    return false;
  }

  if (!startLoading()) {
    return false;
  }

  try {
    const post = {
      name: { ...category.name },
      entity_type: category.entity_type,
    };

    const response = isNew
      ? await postTagCategory(post, token)
      : await putTagCategory(post, category.id, token);

    if (response.data.success) {
      await refreshCategories();

      isAddCategory.value = false;

      msgGood.value = isNew
        ? trans.ttt("success_tag_category_added")
        : trans.ttt("success_tag_category_changed");
    } else {
      msgWrong.value = functions.parseError(response.data.error);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
  } finally {
    finishLoading();
  }
}

async function deleteCategory(category) {
  clearMsg();

  // const assignedTags = getTagsByCategory(category.id);
  // if (assignedTags.length > 0) {
  //   msgWrong.value =
  //     "This category contains tags. Move or delete its tags before deleting the category.";
  //   return;
  // }

  if (!window.confirm(trans.ttt("confirm_tag_category_delete"))) {
    return;
  }

  if (!startLoading()) {
    return false;
  }

  try {
    const response = await deleteTagCategory(category.id, token);

    if (response.data.success) {
      await refreshCategories();

      msgGood.value = trans.ttt("success_tag_category_deleted");

      if (
        currentTagId.value &&
        !categories.value.some(
          (item) => Number(item.id) === Number(tagCategoryId.value),
        )
      ) {
        clearTagData();
      }
    } else {
      msgWrong.value = functions.parseError(response.data.error);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
  } finally {
    finishLoading();
  }
}

// --------------------------------------------------
// Tags
// --------------------------------------------------
function clearTagData() {
  clearMsg();

  currentTagId.value = false;
  tagName.value = emptyTranslations();
  tagCategoryId.value = "";
}

function editTag(tag) {
  clearMsg();

  currentTagId.value = tag.id;

  tagName.value = {
    ...emptyTranslations(),
    ...tag.name,
  };

  tagCategoryId.value =
    tag.tag_category_id == null ? "" : String(tag.tag_category_id);
}

function validateTag() {
  tagErrors.value = [];

  for (const currentLang of langs) {
    if (!tagName.value[currentLang]?.trim()) {
      msgWrong.value =
        trans.ttt("msg_add_tag_name") + cmsLangPrefix(currentLang);

      tagErrors.value.push("name");
      return false;
    }
  }

  if (!tagCategoryId.value) {
    msgWrong.value = trans.ttt("msg_select_tag_category");

    tagErrors.value.push("tag_category_id");
    return false;
  }

  const selectedCategoryExists = categories.value.some(
    (category) => Number(category.id) === Number(tagCategoryId.value),
  );

  if (!selectedCategoryExists) {
    msgWrong.value = trans.ttt("error_tag_category_not_found");

    tagErrors.value.push("tag_category_id");
    return false;
  }

  return true;
}

async function saveTag() {
  clearMsg();

  if (!validateTag()) {
    return false;
  }

  if (!startLoading()) {
    return false;
  }

  try {
    const post = {
      name: { ...tagName.value },
      tag_category_id: Number(tagCategoryId.value),
    };

    const response = currentTagId.value
      ? await putTag(post, currentTagId.value, token)
      : await postTag(post, token);

    if (response.data.success) {
      const wasNew = !currentTagId.value;

      await refreshTags();

      if (wasNew) {
        clearTagData();
      }

      msgGood.value = wasNew
        ? trans.ttt("success_tag_added")
        : trans.ttt("success_tag_changed");
    } else {
      msgWrong.value = functions.parseError(response.data.error);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
  } finally {
    finishLoading();
  }
}

async function deleteTag() {
  clearMsg();

  if (!currentTagId.value) {
    return false;
  }

  if (!window.confirm(trans.ttt("confirm_tag_delete"))) {
    return;
  }

  if (!startLoading()) {
    return false;
  }

  try {
    const response = await deleteTagRequest(currentTagId.value, token);

    if (response.data.success) {
      await refreshTags();

      clearTagData();

      msgGood.value = trans.ttt("success_tag_deleted");
    } else {
      msgWrong.value = functions.parseError(response.data.error);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
  } finally {
    finishLoading();
  }
}

// --------------------------------------------------
// Initialization
// --------------------------------------------------
onMounted(async () => {
  if (!auth.token) {
    return;
  }

  pre_loader.value = true;

  try {
    await Promise.all([refreshCategories(), refreshTags()]);
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
  } finally {
    finishLoading();
  }
});
</script>
