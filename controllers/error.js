exports.get404 = (req, res) =>
  res.status(404).render("404", {
    pageTitle: "Page Not Found!!",
    path: "",
  });
exports.get500 = (req, res) =>
  res.status(500).render("500", { pageTitle: "Error!!" });
exports.globalErrorHandling = (error, req, res, next) => {
  console.log(error.message, "THE ERROR", error);
  const params = {
    pageTitle: "Error!!",
    isAuthenticated: req?.session?.isLoggedIn,
    csrfToken: req?.csrfToken?.(),
    path: "/500",
    errorMessage: req?.flash?.("error")?.[0],
    successMessage: req?.flash?.("success")?.[0],
  };
  res.status(500).render("500", params);
};
