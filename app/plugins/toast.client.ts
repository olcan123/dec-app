import { createToaster } from "@meforma/vue-toaster";
import { defineNuxtPlugin } from "#app";

export default defineNuxtPlugin((nuxtApp) => {
  const toaster = createToaster({
    position: "bottom-right",
  });

  // Define custom toast functions
  const successToast = (message: string) => {
    toaster.show(message, {
      type: "success",
      duration: 3000,
      className: "bg-green-500 text-white p-4 rounded shadow-md w-[300px] my-2",
    });
  };

  const failToast = (message: string) => {
    toaster.show(message, {
      type: "error",
      duration: 3000,
      className: "bg-red-500 text-white p-4 rounded shadow-md w-[300px] my-2",
    });
  };

  const warnToast = (message: string) => {
    toaster.show(message, {
      type: "warning",
      duration: 3000,
      className:
        "bg-yellow-500 text-white p-4 rounded shadow-md w-[300px] my-2",
    });
  };

  // Provide the toasts globally with types
  nuxtApp.provide("successToast", successToast);
  nuxtApp.provide("failToast", failToast);
  nuxtApp.provide("warnToast", warnToast);
});
