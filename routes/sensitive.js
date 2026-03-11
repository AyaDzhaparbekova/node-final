const express = require("express");
const router = express.Router();
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const User = require("../models/User");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);


router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    console.log("📖 Loaded sensitiveInfo from DB:", user.sensitiveInfo);

       const successMsg = req.flash("success");  
    const errorMsg   = req.flash("error");

    res.render("sensitive", {
      title: "Sensitive Info",
      sensitiveInfo: user.sensitiveInfo || { doctor: "", clubs: "", homework: "", sports: "" },
      csrfToken: req.csrfToken(),
      success: successMsg.length ? successMsg[0] : null, 
      errors:  errorMsg.length   ? errorMsg       : null,
    });
  } catch (err) {
    console.error("GET error:", err);
    req.flash("error", "Could not load sensitive info");
    res.redirect("/");
  }
});


router.post("/", async (req, res) => {
  try {
    console.log(" POST /sensitive — req.body:", req.body);  
    console.log("👤 User ID:", req.user?._id);                     

    const cleanData = {
      doctor:   DOMPurify.sanitize(req.body.doctor   || ""),
      clubs:    DOMPurify.sanitize(req.body.clubs    || ""),
      homework: DOMPurify.sanitize(req.body.homework || ""),
      sports:   DOMPurify.sanitize(req.body.sports   || ""),
    };

    console.log(" Clean data to save:", cleanData);

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { sensitiveInfo: cleanData } },
      { returnDocument: "after" }
    );

    console.log("Updated user sensitiveInfo:", updated?.sensitiveInfo);  

    req.flash("success", "Saved!");
    res.redirect("/sensitive");
  } catch (err) {
    console.error(" POST error:", err);
    req.flash("error", "Could not save: " + err.message);
    res.redirect("/tasks/new?private=true");
  }
});

module.exports = router;
