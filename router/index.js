const express = require("express");
const router = express.Router();
const UserCtr = require("../controller/UserCtr");
const MeetingCtr = require("../controller/MeetingCtr");

const zoomRoute = require("./zoomRouter");

const { isAllowedOrigin } = require("../middleware");

router.post("/register", isAllowedOrigin, UserCtr.register);
router.post("/login", isAllowedOrigin, UserCtr.login);
router.post("/sendemail", isAllowedOrigin, UserCtr.sendEmail);
router.post("/buyowner", isAllowedOrigin, UserCtr.buyowner);
router.post("/mintFunc", isAllowedOrigin, UserCtr.mintFunc);
router.post("/getbalance", isAllowedOrigin, UserCtr.getBalance);
router.post("/buysubscription", isAllowedOrigin, UserCtr.buysubscription);

router.get(
  "/getMeetingschedule",
  isAllowedOrigin,
  MeetingCtr.getMeetingschedule
);
router.post("/meetingschedule", isAllowedOrigin, MeetingCtr.meetingschedule);
router.post(
  "/deletemeetingschedule",
  isAllowedOrigin,
  MeetingCtr.deletemeetingschedule
);
router.post(
  "/editmeetingschedule",
  isAllowedOrigin,
  MeetingCtr.editmeetingschedule
);
router.post("/createMeeting", isAllowedOrigin, zoomRoute);

module.exports = router;
