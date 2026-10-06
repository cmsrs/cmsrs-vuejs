<template>
  <div class="mb-3" data-testid="pages-page">
    <!-- change lang and h1 -->
    <div class="container">
      <div class="row mt-3 mb-3">
        <h3 class="col-10" role="head_menu_pages">CMS - menus and pages</h3>
        <ChangeLang :lang="lang" @exec-change-lang="changeLang"></ChangeLang>
      </div>
    </div>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <div class="row">
        <!-- Menu  -->
        <div class="col-5">
          <button
            role="button_add_menu"
            @click.prevent="addMenu"
            class="btn btn-primary mt-2 mb-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-plus"></i>
            <span
              role="pre_loader_add_menu"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            Add menu
          </button>

          <div class="container" style="margin-left: 0px; padding-left: 0px">
            <div class="row" v-for="(m, index) in menus" :key="m.id">
              <div class="container mt-3">
                <div class="row">
                  <div class="form-group col-6">
                    <input
                      role="menu"
                      class="form-control"
                      v-model="menus[index]['name'][lang]"
                    />
                  </div>

                  <div
                    role="save_menu"
                    class="ms-2 col-1"
                    :class="{ 'disabled-if-loader': pre_loader }"
                    @click="saveMenu(index)"
                  >
                    <i class="far fa-save cursor-pointer"></i>
                  </div>
                  <div
                    role="del_menu"
                    class="ms-2 trash col-1"
                    :class="{ 'disabled-if-loader': pre_loader }"
                    @click="delMenu(index)"
                  >
                    <i class="fas fa-trash cursor-pointer" aria-hidden="true" />
                  </div>

                  <div
                    v-if="menus.length > 1"
                    role="down_menu"
                    :class="{ 'disabled-if-loader': pre_loader }"
                    class="ms-2 col-1"
                    @click="positionMenu('down', m.id)"
                  >
                    <i
                      class="fas fa-arrow-down cursor-pointer"
                      aria-hidden="true"
                    ></i>
                  </div>
                  <div
                    v-if="menus.length > 1"
                    role="up_menu"
                    :class="{ 'disabled-if-loader': pre_loader }"
                    class="ms-2 col-1"
                    @click="positionMenu('up', m.id)"
                  >
                    <i
                      class="fas fa-arrow-up cursor-pointer"
                      aria-hidden="true"
                    ></i>
                  </div>
                </div>
              </div>

              <div
                class="container"
                role="menu_pages"
                :data-menu-id="m.id"
                v-if="getPagesBelongsToMenu(m.id)"
              >
                <div
                  class="row test-parent-page"
                  v-for="p in getPagesBelongsToMenu(m.id)"
                  :key="p.id"
                >
                  <PageTitle
                    @exec-edit-page="editPage(p.id)"
                    @exec-del-page="delPage(p.id)"
                    @exec-position-page-up="positionPageUp(p.id)"
                    @exec-position-page-down="positionPageDown(p.id)"
                    :pre_loader="pre_loader"
                    :p="p"
                    :lang="lang"
                    :allPages="allPages"
                    :currentPageId="currentPageId"
                  ></PageTitle>

                  <div
                    class="container ms-2"
                    role="page_pages"
                    :data-page-id="p.id"
                    v-if="getPagesBelongsToPage(p.id)"
                  >
                    <div
                      class="row"
                      v-for="pp in getPagesBelongsToPage(p.id)"
                      :key="pp.id"
                    >
                      <PageTitle
                        @exec-edit-page="editPage(pp.id)"
                        @exec-del-page="delPage(pp.id)"
                        @exec-position-page-up="positionPageUp(pp.id)"
                        @exec-position-page-down="positionPageDown(pp.id)"
                        :pre_loader="pre_loader"
                        :p="pp"
                        :lang="lang"
                        :allPages="allPages"
                        :currentPageId="currentPageId"
                      ></PageTitle>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="container" style="margin-left: 0px; padding-left: 0px">
            <div class="row mt-3" v-if="isAddMenu">
              <div class="form-group col-6">
                <input
                  role="new_menu"
                  class="form-control"
                  :class="{ 'is-invalid': menus_error_new }"
                  v-model="new_menu_name[lang]"
                  :placeholder="`Menu name ${lang}`"
                />
              </div>

              <div
                role="save_menu_0"
                class="ms-2 col-1"
                @click="saveMenu('new')"
              >
                <i class="far fa-save cursor-pointer"></i>
              </div>
              <div
                role="del_menu_0"
                class="ms-2 trash col-1"
                @click="delMenu('new')"
              >
                <i class="fas fa-trash cursor-pointer" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div class="container" style="margin-left: 0px; padding-left: 0px">
            <div class="row" v-if="notRelatedPages">
              <h5 class="mt-4">Pages not related to menu</h5>
              <div
                class="row"
                v-for="(p, index) in notRelatedPages"
                :key="index"
              >
                <PageTitle
                  @exec-edit-page="editPage(p.id)"
                  @exec-del-page="delPage(p.id)"
                  @exec-position-page-up="positionPageUp(p.id)"
                  @exec-position-page-down="positionPageDown(p.id)"
                  :pre_loader="pre_loader"
                  :p="p"
                  :lang="lang"
                  :allPages="allPages"
                  :currentPageId="currentPageId"
                ></PageTitle>
              </div>
            </div>
            <div class="row" v-if="innerPages">
              <h5 class="mt-4">Inner boxes</h5>
              <div class="row" v-for="(p, index) in innerPages" :key="index">
                <PageTitle
                  @exec-edit-page="editPage(p.id)"
                  @exec-del-page="delPage(p.id)"
                  @exec-position-page-up="positionPageUp(p.id)"
                  @exec-position-page-down="positionPageDown(p.id)"
                  :pre_loader="pre_loader"
                  :p="p"
                  :lang="lang"
                  :allPages="allPages"
                  :showPageId="true"
                  :currentPageId="currentPageId"
                ></PageTitle>
              </div>
            </div>
          </div>
        </div>

        <!-- Pages  -->
        <div class="col-7">
          <!-- !it can be edit page too -->
          <button
            role="button_save_edit_page"
            @click.prevent="saveEditPage"
            type="submit"
            class="add-page-btn btn btn-primary mt-2 mb-2 me-2"
            :disabled="pre_loader"
          >
            <i v-if="!pre_loader" class="fas fa-plus"></i>
            <span
              role="pre_loader_save_edit_page"
              v-if="pre_loader"
              class="spinner-grow spinner-grow-sm"
            ></span>
            <span v-if="!currentPageId">Add page</span>
            <span v-if="currentPageId">Edit page</span>
          </button>
          <button
            role="button_clear_page_data"
            @click.prevent="clearDataPage"
            class="add-page-btn btn btn-info ms-2 mt-2 mb-2"
            :disabled="pre_loader"
          >
            Clear data
          </button>

          <form>
            <div class="form-group mt-3">
              <input
                class="form-control"
                :class="{ 'is-invalid': errFields.includes('title') }"
                v-model="title[lang]"
                :placeholder="`title ${lang}`"
              />
            </div>

            <div class="form-group mt-3">
              <input
                class="form-control"
                :class="{ 'is-invalid': errFields.includes('short_title') }"
                v-model="short_title[lang]"
                :placeholder="`short title ${lang}`"
              />
            </div>

            <div class="form-group mt-3">
              <textarea
                class="form-control"
                rows="4"
                cols="50"
                v-model="description[lang]"
                :placeholder="`description ${lang}`"
              ></textarea>
            </div>

            <div class="form-check mt-2 row">
              <label
                :class="{ 'disabled-if-loader': pre_loader }"
                :disabled="pre_loader"
              >
                <input
                  class="col-1"
                  name="published"
                  type="checkbox"
                  v-model="published"
                  :true-value="1"
                />
                Published
              </label>
            </div>

            <div class="form-check mt-2 row">
              <label
                :class="{ 'disabled-if-loader': pre_loader }"
                :disabled="pre_loader"
              >
                <input
                  class="col-1"
                  name="commented"
                  type="checkbox"
                  v-model="commented"
                  :true-value="1"
                />
                Commented
              </label>
            </div>

            <div class="form-check mt-2 row">
              <label
                :class="{ 'disabled-if-loader': pre_loader }"
                :disabled="pre_loader"
              >
                <input
                  class="col-1"
                  name="after_login"
                  type="checkbox"
                  v-model="after_login"
                  :true-value="1"
                />
                Available after log in
              </label>
            </div>

            <div class="form-group mt-3">
              <label for="pageType" class="text-secondary">Page type:</label>
              <select
                :class="{ 'disabled-if-loader': pre_loader }"
                :disabled="pre_loader"
                class="rs-select form-control"
                id="pageType"
                v-model="page_type"
              >
                <option
                  v-for="pageType in page_types"
                  :key="pageType"
                  :value="pageType"
                >
                  {{ pageType }}
                </option>
              </select>
            </div>

            <div class="mt-3" v-if="page_type !== 'main_page'">
              <!--
                  it is show 
                  1. menus
                  2. parent_page                  
                  for page_type different then main_page
                  -->

              <div class="form-group mt-3">
                <label for="menu_items" class="text-secondary">Menu:</label>
                <select
                  :class="{ 'disabled-if-loader': pre_loader }"
                  :disabled="pre_loader"
                  role="menu_items"
                  class="rs-select form-control"
                  v-model="menu_id"
                  @change="handleMenuChange"
                >
                  <option value=""></option>
                  <option v-for="menu in menus" :key="menu.id" :value="menu.id">
                    {{ menu.name[lang] }}
                  </option>
                </select>
              </div>

              <div class="form-group mt-3">
                <label for="page" class="text-secondary">Parent page:</label>
                <select
                  :class="{ 'disabled-if-loader': pre_loader }"
                  :disabled="pre_loader"
                  role="page_items"
                  class="rs-select form-control"
                  v-model="page_id"
                >
                  <option value=""></option>
                  <option
                    v-for="page in rootPagesBelongToMenu"
                    :key="page.id"
                    :value="page.id"
                  >
                    {{ page.short_title[lang] }}
                  </option>
                </select>
              </div>
            </div>

            <div class="mt-4">
              <div
                class="form-group"
                v-if="
                  page_type === 'cms' ||
                  page_type === 'inner' ||
                  page_type === 'privacy_policy'
                "
              >
                <br />
                <ckeditor
                  :editor="editor"
                  v-model="content[lang]"
                  :config="editorConfig"
                ></ckeditor>
                <!--
                    we show contentCKE: CKEditor (for: 'cms', 'inner', 'privacy_policy' )
                    -->
              </div>
              <div class="form-group" v-else>
                <textarea
                  class="form-control textarea-rs"
                  rows="20"
                  cols="50"
                  v-model="content[lang]"
                  :placeholder="`content ${lang}`"
                ></textarea>
              </div>
            </div>

            <!-- manage image -->
            <ManageImages
              ref="childImageComponentRef"
              v-model:internal-images="images"
              v-model:internal-msg-wrong="msgWrong"
              v-model:internal-msg-good="msgGood"
              v-model:internal-pre-loader="pre_loader"
              :lang="lang"
              :startLoading="startLoading"
              :clearMsg="clearMsg"
              :currentId="currentPageId"
              type="page"
            ></ManageImages>
          </form>
        </div>
      </div>
    </div>
    <!-- container -->
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import functions from "../helpers/functions.js";
import cms from "../helpers/cms.js";
import trans from "../helpers/trans.js";
import { handleError } from "../helpers/common.js";
import {
  postPage,
  putPage,
  getPages,
  getPage,
  postMenu,
  getMenus,
  putMenu,
  deleteMenu,
  setMenuPosition,
  deletePage,
  setPagePosition,
} from "../api/apiCalls";
import CKEditor from "@ckeditor/ckeditor5-vue";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import PageTitle from "../components/PageTitle.vue";
import Msg from "../components/Msg.vue";
import ChangeLang from "../components/ChangeLang.vue";
import ManageImages from "../components/ManageImages.vue";

import { useAuthStore } from "../state/store.js";

const router = useRouter();
const { auth, config, setDefaultLang } = useAuthStore();

const childImageComponentRef = ref(null);

const {
  configLangs: langs,
  configDefaultLang,
  pageTypes: page_types,
  token,
} = functions.retrieveParamsFromStorage();

const lang = ref(configDefaultLang);
const msgWrong = ref("");
const msgGood = ref("");
const pre_loader = ref(false);
const errFields = ref([]);

const allPages = ref([]);
const notRelatedPages = ref(false);
const innerPages = ref(false);
const pagesBelongsToMenus = ref([]);
const pagesBelongsToPages = ref([]);

const title = ref({});
const short_title = ref({});
const description = ref({});
const content = ref({});
const page_type = ref("cms");
const published = ref(false);
const commented = ref(false);
const after_login = ref(false);
const menu_id = ref("");
const page_id = ref("");
const images = ref([]);

const rootPagesBelongToMenu = ref([]);
const isAddMenu = ref(false);
const new_menu_name = ref({});
const menus = ref([]);
const menus_error_new = ref(false);
const currentPageId = ref(false);

const editor = ref(ClassicEditor);
const editorConfig = ref({});

editor.value = ClassicEditor;
const ckeditor = CKEditor.component;

// Computed
//const SERVER_URL = computed(() => SERVER_URL);

const saveEditPage = async () => {
  if (!startLoading()) {
    return false;
  }

  try {
    const post = {
      title: title.value,
      short_title: short_title.value,
      description: description.value,
      type: page_type.value,
      content: content.value,
      published: published.value,
      commented: commented.value,
      after_login: after_login.value,
      menu_id: menu_id.value,
      page_id: page_id.value,
      images: images.value,
    };

    const retPage = currentPageId.value
      ? await putPage(post, currentPageId.value, token)
      : await postPage(post, token);

    if (retPage.data.success) {
      if (!currentPageId.value) {
        const pageId = retPage.data.data.pageId;
        currentPageId.value = pageId;
        router.push("/pages/" + pageId);
        msgGood.value = trans.ttt("success_page_add");
      } else {
        await getPageById(currentPageId.value); //refresh fields especially images.position
        msgGood.value = trans.ttt("success_page_edit");
      }
    } else if (retPage.data.success === false) {
      msgWrong.value = await functions.parseError(retPage.data.error);
      errFields.value = await functions.getErrorFields(retPage.data.error);
    } else {
      msgWrong.value = "Something wrong";
    }

    const ret = await refreshPages();
    if (ret) {
      pre_loader.value = false;
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
  }
  pre_loader.value = false;
};

const clearDataPage = () => {
  if (!startLoading()) {
    return false;
  }
  router.push("/pages");

  title.value = {};
  short_title.value = {};
  description.value = {};
  content.value = {};
  page_type.value = "cms";
  published.value = false;
  commented.value = false;
  after_login.value = false;
  menu_id.value = "";
  page_id.value = "";
  images.value = [];

  currentPageId.value = false;

  pre_loader.value = false;
};

async function changeLang(inLang) {
  lang.value = inLang;
  setDefaultLang(inLang);
}

function addMenu() {
  clearMsg();
  isAddMenu.value = true;
  menus_error_new.value = false;
  new_menu_name.value = {};
}

async function saveMenu(index) {
  clearMsg();

  if ("new" === index) {
    menus_error_new.value = false;
    for (let lang of langs) {
      if (!new_menu_name.value[lang]) {
        msgWrong.value =
          "Add menu name" + cms.getInfoMsgPrefixByLang(langs, lang); // for lang = "+lang;
        menus_error_new.value = true;
        break;
      }
    }

    if (!msgWrong.value) {
      if (!startLoading()) {
        return false;
      }

      try {
        const post = {
          name: new_menu_name.value,
        };
        const addMenu = await postMenu(post, token);
        if (addMenu.data.success) {
          const ret = await refreshMenus();
          if (ret) {
            isAddMenu.value = false;
            msgGood.value = "Menu has been added";
          }
        }
      } catch (error) {
        handleError(error, config.demo_status, msgWrong, pre_loader);
        //console.log("_is_error__", error);
        //msgWrong.value = "Add menu problem = " + error;
      }
      pre_loader.value = false;
    }
  } else {
    if (!menus.value[index]["name"]) {
      console.log("sth wrong i cant find menu with index=" + index);
      return false;
    }
    const menuByLangs = menus.value[index]["name"];

    for (let lang of langs) {
      if (!menuByLangs[lang]) {
        msgWrong.value =
          "Add menu name" + cms.getInfoMsgPrefixByLang(langs, lang); // for '+lang+' lang';
        break;
      }
    }

    if (!msgWrong.value) {
      if (!startLoading()) {
        return false;
      }

      try {
        const post = {
          id: menus.value[index]["id"],
          name: menuByLangs,
        };
        const updateMenu = await putMenu(post, token);
        if (updateMenu.data.success) {
          msgGood.value = "Menu has been changed";
        }
      } catch (error) {
        handleError(error, config.demo_status, msgWrong, pre_loader);
        //console.log("_is_error__", error);
        //msgWrong.value = "Add menu problem = " + error;
      }
      pre_loader.value = false;
    }
  }
}

async function delMenu(index) {
  clearMsg();
  if ("new" === index) {
    isAddMenu.value = false;
  } else {
    if (window.confirm("Are you sure you wish to delete this item?")) {
      if (!startLoading()) {
        return false;
      }

      try {
        const menuId = menus.value[index]["id"];
        const objDeleteMenu = await deleteMenu(menuId, token);
        if (objDeleteMenu.data.success) {
          const ret = await refreshMenus();
          if (ret) {
            msgGood.value = "Menu has been deleted";
            pre_loader.value = false;
          }
        }
      } catch (error) {
        handleError(error, config.demo_status, msgWrong, pre_loader);
        //console.log("_is_error__", error);
        //msgWrong.value = "Delete menu problem = " + error;
      }
    }
  }
}

function clearMsg() {
  msgWrong.value = "";
  msgGood.value = "";
  errFields.value = [];
}

const startLoading = async () => {
  clearMsg();
  if (pre_loader.value) {
    return false;
  }
  pre_loader.value = true;
  return true;
};

const positionMenu = async (direction, menuId) => {
  if (!startLoading()) {
    return false;
  }
  try {
    const pos = await setMenuPosition(direction, menuId, token);

    if (pos.data.success) {
      const ret = await refreshMenus();
      if (ret) {
        msgGood.value = "Position menu has been changed";
        pre_loader.value = false;
      }
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //console.log("_is_error__", error);
    //msgWrong.value = "Position menu problem = " + error;
  }
};

const getPageById = async (pageId) => {
  try {
    const dbPage = await getPage(pageId, token);
    if (dbPage.data.success) {
      const p = dbPage.data.data;

      currentPageId.value = p.id;

      rootPagesBelongToMenu.value = cms.getRootPages(
        p.menu_id,
        currentPageId.value,
        allPages.value,
      ); //p.menu_id ? getRootPages(p.menu_id) : [];
      title.value = p.title;
      short_title.value = p.short_title;
      description.value = p.description;
      page_type.value = p.type; //!
      content.value = p.content[lang.value]
        ? p.content
        : functions.createEmptyObj(langs);
      published.value = p.published;

      commented.value = p.commented;
      after_login.value = p.after_login;
      menu_id.value = p.menu_id;
      page_id.value = p.page_id;
      images.value = p.images;

      await childImageComponentRef.value.resetSelectedItems();

      return true;
    }
  } catch (error) {
    //handleError(error, config.demo_status, msgWrong, pre_loader);
    console.log("_is_error_get_page_", error);
    msgWrong.value = "Get page problem = " + error;
    return false;
  }
};

const editPage = async (pageId) => {
  if (!startLoading()) {
    return false;
  }

  const getSomePage = await getPageById(pageId);
  if (getSomePage) {
    router.push("/pages/" + pageId);
    pre_loader.value = false;
  } else {
    msgWrong.value = "Get page problem = " + error;
  }
};

const delPage = async (pageId) => {
  clearMsg();
  if (window.confirm("Are you sure you wish to delete this item?")) {
    if (!startLoading()) {
      return false;
    }

    try {
      const objDeletePage = await deletePage(pageId, token);
      if (objDeletePage.data.success) {
        const ret = await refreshPages();
        if (ret) {
          msgGood.value = "Page has been deleted";
          pre_loader.value = false;
        }
      }
    } catch (error) {
      handleError(error, config.demo_status, msgWrong, pre_loader);
      //console.log("_is_error__", error);
      //msgWrong.value = "Delete menu problem = " + error;
    }
  }
};

const positionPageUp = async (pageId) => {
  positionPage("up", pageId);
};
const positionPageDown = async (pageId) => {
  positionPage("down", pageId);
};

const positionPage = async (direction, pageId) => {
  if (!startLoading()) {
    return false;
  }

  try {
    const pos = await setPagePosition(direction, pageId, token);
    if (pos.data.success) {
      const ret = await refreshPages();
      if (ret) {
        msgGood.value = "Position page has been changed";
        pre_loader.value = false;
      }
    } else if (pos.data.success === false) {
      //in case one page to sorting
      pre_loader.value = false;
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //console.log("_is_error__", error);
    //msgWrong.value = "Position page problem = " + error;
  }
};

const refreshMenus = async () => {
  try {
    const responseM = await getMenus(token);
    menus.value = responseM.data.data;
    return true;
  } catch (error) {
    //handleError(error, config.demo_status, msgWrong, pre_loader);
    console.log("error get menu=", error);
  }
  return false;
};

const refreshPages = async () => {
  try {
    const responseP = await getPages(token);
    allPages.value = responseP.data.data;
    pagesBelongsToMenus.value = cms.getPagesBelongsToMenus(responseP.data.data);
    pagesBelongsToPages.value = cms.getPagesBelongsToPages(responseP.data.data);

    notRelatedPages.value = cms.getNotRelatedPages(responseP.data.data);
    innerPages.value = cms.getInnerPages(responseP.data.data);
    return true;
  } catch (error) {
    //handleError(error, config.demo_status, msgWrong, pre_loader);
    console.log("error get pages=", error);
  }
  return false;
};

const handleMenuChange = () => {
  rootPagesBelongToMenu.value = cms.getRootPages(
    menu_id.value,
    currentPageId.value,
    allPages.value,
  ); //menu_id.value ? getRootPages(menu_id.value) : [];
};

function getPagesBelongsToMenu(menuId) {
  return functions.getItemFromArrayOrFalse(pagesBelongsToMenus.value, menuId);
}

function getPagesBelongsToPage(parentPageId) {
  return functions.getItemFromArrayOrFalse(
    pagesBelongsToPages.value,
    parentPageId,
  );
}

onMounted(async () => {
  if (!auth.token) {
    router.push("/");
    return false;
  }

  pre_loader.value = true;
  const refreshM = await refreshMenus();
  const refreshP = await refreshPages();

  const pageId = router.currentRoute.value.params.id;
  if (pageId) {
    currentPageId.value = parseInt(pageId);
    await childImageComponentRef.value.resetSelectedItems();

    const getSomePage = await getPageById(pageId);
    if (refreshM && refreshP && getSomePage) {
      pre_loader.value = false;
    }
  } else {
    if (refreshM && refreshP) {
      pre_loader.value = false;
    }
  }
});

watch(
  new_menu_name,
  () => {
    clearMsg();
  },
  { deep: true },
);

watch(
  menus,
  () => {
    clearMsg();
  },
  { deep: true },
);

watch(lang, () => {
  clearMsg();
});
</script>
