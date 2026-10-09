import trans from "../helpers/trans.js";

export function handleError(error, isDemo, msgWrong, pre_loader) {
  if (isDemo) {
    msgWrong.value = trans.ttt("is_demo_true");
    pre_loader.value = false;
  } else {
    msgWrong.value = trans.ttt("internal_problem");   
    if (import.meta.env.MODE !== "test") { 
      console.error("_is_error__", error);
    }
  }
}
