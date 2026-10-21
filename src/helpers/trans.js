const ttt = (key) => {
  const d = {
    success_page_add: "Page has been added",
    success_page_edit: "Page has been changed",
    success_client_edit: "Client has been changed",
    success_client_add: "Client has been added",
    success_product_edit: "Product has been changed",
    success_product_add: "Product has been added",
    success_image_position: "Position image has been changed",
    success_image_delete: "Image has been deleted",
    success_images_delete: "Images has been deleted",
    success_images_upload: "Images have been uploaded",

    fail_delete_images_no_items: "fail delete images no items",

    toggle_cache_enable: "toggle cache",
    clear_cache: "clear cache",
    create_sitemap: "create sitemap",

    cache_was_cleared: "Cache was cleared",
    sitemap_was_created: "Sitemap was created",

    success_edit_checkout: "Checkout has been updated",

    is_demo_true:
      "We're sorry, but this action is not available in the demo version.",
    internal_problem: "internal problem, see logs",

    confirm_tag_delete: "Are you sure you wish to delete this tag?",
    confirm_tag_category_delete:
      "Are you sure you want to delete this category and all its tags?",
    success_tag_added: "Tag has been added",
    success_tag_changed: "Tag has been changed",
    success_tag_deleted: "Tag has been deleted",
    success_tag_category_deleted: "Category has been deleted",
    success_tag_category_added: "Category has been added",
    success_tag_category_changed: "Category has been changed",
    error_tag_category_not_found: "Selected category does not exist",
    error_loading_tag_categories: "Could not load tag categories",
    error_loading_tags: "Could not load tags",
    msg_select_category_entity_type: "Select category entity type",
    msg_add_category_name: "Add category name",
    msg_add_tag_name: "Add tag name",
    msg_select_tag_category: "Select tag category",
  };

  return d[key] ? d[key] : key;
};

export default {
  ttt,
};
