// مسیر: constants/modelPageMessages.ts
export const modelPageMessages = {
  pageTitle: "مدیریت مدل‌های برند «{brandName}»",
  addModel: "افزودن مدل جدید",
  editModel: "ویرایش مدل",
  deleteModel: "حذف مدل",
  
  confirmDeleteTitle: "تایید حذف",
  confirmDeleteModel: "آیا از حذف مدل «{modelName}» مطمئن هستید؟",
 title: (brandName: string) => `مدیریت مدل‌های برند «${brandName}»`,
  modelTitleLabel: "عنوان مدل",

  addSuccess: "مدل با موفقیت اضافه شد.",
  updateSuccess: "مدل با موفقیت ویرایش شد.",
  deleteSuccess: "مدل با موفقیت حذف شد.",
  actionError: "خطا در انجام عملیات.",
  
  noModels: "هیچ مدلی برای این برند ثبت نشده است.",
  
  save: "ذخیره",
  cancel: "انصراف",
  confirm: "بله، حذف کن",
};