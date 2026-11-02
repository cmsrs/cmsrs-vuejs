<template>
  <div data-testid="settings-page">
    <h3>Settings</h3>

    <Msg :msgGood="msgGood" :msgWrong="msgWrong"></Msg>

    <div class="container">
      <form>
        <div v-if="config.cache_enable" class="form-check mt-4 row">
          <label
            :class="{ 'disabled-if-loader': pre_loader }"
            :disabled="pre_loader"
          >
            <input
              role="toggle_cache_enable"
              type="checkbox"
              v-model="toggleCacheEnable"
              @click.prevent="changeCacheEnable"
              :true-value="true"
            />
            {{ trans.ttt("toggle_cache_enable") }}
          </label>
        </div>

        <div v-if="config.cache_enable" class="form-check mt-4 row">
          <label
            role="clear_cache"
            @click.prevent="actionClearCache"
            :class="{ 'disabled-if-loader': pre_loader }"
            :disabled="pre_loader"
          >
            <Icon name="fa-cog" aria-hidden="true" />
            {{ trans.ttt("clear_cache") }}
          </label>
        </div>

        <div class="form-check mt-4 row">
          <label
            role="create_sitemap"
            @click.prevent="actionCreateSitemap"
            :class="{ 'disabled-if-loader': pre_loader }"
            :disabled="pre_loader"
          >
            <Icon name="fa-cog" aria-hidden="true" />
            {{ trans.ttt("create_sitemap") }}
          </label>
        </div>
      </form>
    </div>
    <!--  container -->
  </div>
</template>
<script setup>
import Icon from "../components/Icon.vue";
import { ref, watch, onMounted } from "vue";
import {
  postToggleCacheEnableFile,
  getClearCache,
  getCreateSitemap,
} from "../api/apiCalls";
import Msg from "../components/Msg.vue";
import trans from "../helpers/trans.js";
import functions from "../helpers/functions.js";
import { handleError } from "../helpers/common.js";
import { useAuthStore } from "../state/store.js";
const { auth, config, setIsCacheEnable } = useAuthStore();

//const {
//  cacheEnable
//} = functions.retrieveParamsFromStorage();

const msgWrong = ref("");
const msgGood = ref("");

const toggleCacheEnable = ref(config.is_cache_enable); //we assume that in config cache_enable == true, because:  is_cache_enable=cache_enable (in config) && file_exist(cache_enable_file))
//const clearCache = ref(false);
//const createSitemap = ref(false);

const pre_loader = ref(false);

const clearMsg = () => {
  msgWrong.value = "";
  msgGood.value = "";
};

const startLoading = () => {
  clearMsg();
  if (pre_loader.value) {
    return false;
  }
  pre_loader.value = true;
  return true;
};

const changeCacheEnable = async () => {
  if (!startLoading()) {
    return false;
  }

  try {
    const response = await postToggleCacheEnableFile(
      functions.getPostToggleCacheEnableFile(),
      auth.token,
    );
    if (response.data.success) {
      toggleCacheEnable.value = response.data.data.value;
      setIsCacheEnable(response.data.data.value);
      msgGood.value = response.data.data.message;
      pre_loader.value = false;
      return true;
    } else {
      msgWrong.value = "Sth wrong with changeCacheEnable";
      console.log("error changeCacheEnable", response.data);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //msgWrong.value = "Sth wrong with changeCacheEnable (error)";
    //console.log("error changeCacheEnable", error);
  }
  return false;
};

const actionClearCache = async () => {
  if (!startLoading()) {
    return false;
  }

  try {
    const response = await getClearCache(auth.token);
    if (response.data.success) {
      msgGood.value = trans.ttt("cache_was_cleared");
      pre_loader.value = false;
      return true;
    } else {
      msgWrong.value = "Sth wrong with actionClearCache";
      console.log("error actionClearCache", response.data);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //msgWrong.value = "Sth wrong with actionClearCache (error)";
    //console.log("error actionClearCache", error);
  }
  return false;
};

const actionCreateSitemap = async () => {
  if (!startLoading()) {
    return false;
  }

  try {
    const response = await getCreateSitemap(auth.token);
    if (response.data.success) {
      msgGood.value = trans.ttt("sitemap_was_created");
      pre_loader.value = false;
      return true;
    } else {
      msgWrong.value = "Sth wrong with actionCreateSitemap";
      console.log("error actionCreateSitemap", response.data);
    }
  } catch (error) {
    handleError(error, config.demo_status, msgWrong, pre_loader);
    //msgWrong.value = "Sth wrong with actionCreateSitemap (error)";
    //console.log("error actionCreateSitemap", error);
  }
  return false;
};

onMounted(async () => {
  if (!auth.token) {
    router.push("/");
    return false;
  }

  clearMsg();
});

watch(
  () => config.is_cache_enable,
  (newValue) => {
    toggleCacheEnable.value = newValue;
  },
);
</script>
