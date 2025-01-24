import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";

const openNotification = (type, message) => {
  switch (type) {
    case "success":
      toast.success(message);
      break;
    case "info":
      toast.info(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      break;
  }
};

export default openNotification;