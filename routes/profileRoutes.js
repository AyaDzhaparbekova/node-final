const express = require("express");
const router = express.Router();
const User = require("../models/User");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const DOMPurify = createDOMPurify(new JSDOM("").window);


router.get("/", async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("profile", {
    title: "My Profile",
    userData: user,
    sensitiveInfo: user.sensitiveInfo || {},
    children: user.children || [],
  });
});


router.get("/child/new", (req, res) => {
  res.render("childForm", {
    title: "Add Child",
    child: null,
    isEdit: false,
    csrfToken: req.csrfToken(),
  });
});


router.post("/child", async (req, res) => {
  try {
    const child = {
      name:     DOMPurify.sanitize(req.body.name     || ""),
      age:      parseInt(req.body.age) || null,
      doctor:   DOMPurify.sanitize(req.body.doctor   || ""),
      school:   DOMPurify.sanitize(req.body.school   || ""),
      contacts: DOMPurify.sanitize(req.body.contacts || ""),
      sports:   DOMPurify.sanitize(req.body.sports   || ""),
      notes:    DOMPurify.sanitize(req.body.notes    || ""),
    };
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { children: child } }
    );
    req.flash("success", `${child.name} added! ✅`);
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not add child");
    res.redirect("/profile/child/new");
  }
});

router.get("/child/:id/edit", async (req, res) => {
  const user = await User.findById(req.user._id);
  const child = user.children.id(req.params.id);
  if (!child) return res.redirect("/profile");
  res.render("childForm", {
    title: "Edit Child",
    child,
    isEdit: true,
    csrfToken: req.csrfToken(),
  });
});


router.post("/child/:id", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const child = user.children.id(req.params.id);
    if (!child) return res.redirect("/profile");

    child.name     = DOMPurify.sanitize(req.body.name     || "");
    child.age      = parseInt(req.body.age) || null;
    child.doctor   = DOMPurify.sanitize(req.body.doctor   || "");
    child.school   = DOMPurify.sanitize(req.body.school   || "");
    child.contacts = DOMPurify.sanitize(req.body.contacts || "");
    child.sports   = DOMPurify.sanitize(req.body.sports   || "");
    child.notes    = DOMPurify.sanitize(req.body.notes    || "");

    await user.save();
    req.flash("success", `${child.name} updated! ✅`);
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not update child");
    res.redirect("/profile");
  }
});


router.post("/child/:id/delete", async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { children: { _id: req.params.id } } }
    );
    req.flash("success", "Child removed");
    res.redirect("/profile");
  } catch (err) {
    req.flash("error", "Could not delete child");
    res.redirect("/profile");
  }
});


router.get("/edit", async (req, res) => {
  const user = await User.findById(req.user._id);
  res.render("sensitive", {
    title: "Edit Profile",
    sensitiveInfo: user.sensitiveInfo || {},
    csrfToken: req.csrfToken(),
  });
});

router.post("/edit", async (req, res) => {
  try {
    const cleanData = {
      doctor:   DOMPurify.sanitize(req.body.doctor   || ""),
      clubs:    DOMPurify.sanitize(req.body.clubs    || ""),
      homework: DOMPurify.sanitize(req.body.homework || ""),
      sports:   DOMPurify.sanitize(req.body.sports   || ""),
    };
    await User.findByIdAndUpdate(req.user._id, { $set: { sensitiveInfo: cleanData } });
    req.flash("success", "Profile updated! ✅");
    res.redirect("/profile");
  } catch (err) {
    req.flash("error", "Could not save");
    res.redirect("/profile/edit");
  }
});

module.exports = router;
